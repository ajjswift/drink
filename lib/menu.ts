/**
 * The drink. menu, read from Square's Catalog API.
 *
 * SERVER ONLY. This module reads SQUARE_ACCESS_TOKEN, so it must never be imported
 * from a Client Component ("use client") — the token would be bundled for the browser.
 *
 * Square's catalog is the source of truth; FALLBACK_MENU only covers an outage or a
 * missing key so a live page never renders an empty menu.
 */

/** Square category holding the Cocktails category. Override with SQUARE_MENU_ID. */
const DEFAULT_MENU_ID = "6VC47G3IED5AQRMUTNCLSMY5";
import { createClient } from "redis";

/** The production Redis cache defaults to one hour. */
const DEFAULT_CACHE_TTL_SECONDS = 60 * 60;
/** Stops a misbehaving cursor from paging forever. */
const MAX_CATALOG_PAGES = 20;

const SQUARE_HOSTS = {
  production: "https://connect.squareup.com",
  sandbox: "https://connect.squareupsandbox.com",
} as const;

export type MenuItem = { id: string; name: string; description?: string; price?: string };
export type MenuCategory = { id: string; name: string; items: MenuItem[] };
export type Menu = { categories: MenuCategory[]; source: "square" | "fallback" };

type RedisClient = ReturnType<typeof createClient>;

const redisState = globalThis as typeof globalThis & {
  squareMenuRedis?: RedisClient;
  squareMenuRedisConnection?: Promise<RedisClient>;
};

function redisCacheEnabled() {
  return process.env.NODE_ENV === "production" && Boolean(process.env.REDIS_URL);
}

function cacheTtlSeconds() {
  const configured = Number(process.env.SQUARE_MENU_CACHE_TTL_SECONDS);
  return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_CACHE_TTL_SECONDS;
}

function cacheKey(menuId: string) {
  const environment = process.env.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
  return `drink:square-menu:${environment}:${menuId}`;
}

async function redisClient(): Promise<RedisClient | null> {
  if (!redisCacheEnabled()) return null;

  if (!redisState.squareMenuRedis) {
    redisState.squareMenuRedis = createClient({
      url: process.env.REDIS_URL,
      socket: { connectTimeout: 1_000, reconnectStrategy: false },
    });
    redisState.squareMenuRedis.on("error", (error) => {
      console.error("[menu] Redis cache error — continuing without the cache.", error);
    });
    redisState.squareMenuRedisConnection = redisState.squareMenuRedis.connect();
  }

  try {
    await redisState.squareMenuRedisConnection;
    return redisState.squareMenuRedis;
  } catch (error) {
    console.error("[menu] Redis cache unavailable — continuing without the cache.", error);
    redisState.squareMenuRedis?.disconnect();
    delete redisState.squareMenuRedis;
    delete redisState.squareMenuRedisConnection;
    return null;
  }
}

function isCachedMenu(value: unknown): value is Pick<Menu, "categories"> {
  return typeof value === "object" && value !== null && Array.isArray((value as Menu).categories) &&
    (value as Menu).categories.every((category) =>
      typeof category?.id === "string" && typeof category.name === "string" && Array.isArray(category.items));
}

async function readCachedMenu(menuId: string): Promise<Menu | null> {
  const client = await redisClient();
  if (!client) return null;

  try {
    const raw = await client.get(cacheKey(menuId));
    if (!raw) return null;
    const cached = JSON.parse(raw) as unknown;
    return isCachedMenu(cached) ? { categories: cached.categories, source: "square" } : null;
  } catch (error) {
    console.error("[menu] Could not read the Redis cache — continuing without it.", error);
    return null;
  }
}

async function cacheMenu(menuId: string, categories: MenuCategory[]) {
  const client = await redisClient();
  if (!client) return;

  try {
    await client.set(cacheKey(menuId), JSON.stringify({ categories }), { EX: cacheTtlSeconds() });
  } catch (error) {
    console.error("[menu] Could not write the Redis cache — continuing without it.", error);
  }
}

/* ------------------------------------------------------------------ Square API */

type SquareMoney = { amount?: number; currency?: string };
type SquareCategoryRef = { id?: string; ordinal?: number };

/** Only the slice of Square's CatalogObject this site reads. */
export type SquareObject = {
  id: string;
  type: string;
  is_deleted?: boolean;
  category_data?: { name?: string; parent_category?: SquareCategoryRef; ordinal?: number };
  item_data?: {
    name?: string;
    description?: string;
    description_plaintext?: string;
    is_archived?: boolean;
    /** Legacy single-category field, still returned for older catalogs. */
    category_id?: string;
    categories?: SquareCategoryRef[];
    reporting_category?: SquareCategoryRef;
    variations?: { id: string; item_variation_data?: { price_money?: SquareMoney } }[];
  };
};

function squareConfig() {
  const environment = process.env.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
  return {
    token: process.env.SQUARE_ACCESS_TOKEN,
    menuId: process.env.SQUARE_MENU_ID?.trim() || DEFAULT_MENU_ID,
    host: SQUARE_HOSTS[environment],
    // Optional: pin a Square API version. Unset means Square uses the account default.
    apiVersion: process.env.SQUARE_API_VERSION?.trim(),
  };
}

async function fetchCatalogObjects(): Promise<SquareObject[]> {
  const { token, host, apiVersion } = squareConfig();
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not set");

  const objects: SquareObject[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_CATALOG_PAGES; page++) {
    const url = new URL("/v2/catalog/list", host);
    url.searchParams.set("types", "ITEM,CATEGORY");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(apiVersion ? { "Square-Version": apiVersion } : {}),
      },
      // Redis is the production cache. Keeping this uncached means local development
      // always reads Square directly and deployment instances share one cache.
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Square catalog request failed: ${response.status} ${response.statusText}`);
    }

    const body: { objects?: SquareObject[]; cursor?: string } = await response.json();
    if (body.objects?.length) objects.push(...body.objects);
    cursor = body.cursor;
    if (!cursor) break;
  }

  return objects;
}

/* ------------------------------------------------------- Catalog -> menu (pure) */

const isDrinkCategory = (name?: string) => /mock?tail|cocktail/i.test(name ?? "");
const byOrdinal = (a: { ordinal: number }, b: { ordinal: number }) => a.ordinal - b.ordinal;

function categoryOrdinal(category: SquareObject): number {
  return category.category_data?.parent_category?.ordinal ?? category.category_data?.ordinal ?? 0;
}

/** Every category id an item belongs to, across Square's current and legacy fields. */
function categoryIdsOf(item: SquareObject): Set<string> {
  const data = item.item_data;
  const ids = [
    ...(data?.categories?.map((c) => c.id) ?? []),
    data?.category_id,
    data?.reporting_category?.id,
  ];
  return new Set(ids.filter((id): id is string => Boolean(id)));
}

/** Where this item sits within a given category, so Square's own ordering is respected. */
function itemOrdinal(item: SquareObject, categoryId: string): number {
  const match = item.item_data?.categories?.find((c) => c.id === categoryId);
  return match?.ordinal ?? item.item_data?.reporting_category?.ordinal ?? 0;
}

/**
 * The categories to render: the configured menu's children if it has any, the menu
 * itself if it holds items directly, or — if the id resolves to nothing — any
 * cocktail/mocktail categories in the catalog.
 */
function resolveCategories(categories: SquareObject[], menuId: string): SquareObject[] {
  const children = categories.filter((c) => c.category_data?.parent_category?.id === menuId);
  if (children.length > 0) {
    return [...children].sort((a, b) => categoryOrdinal(a) - categoryOrdinal(b) ||
      (a.category_data?.name ?? "").localeCompare(b.category_data?.name ?? ""));
  }

  const menu = categories.find((c) => c.id === menuId);
  if (menu) return [menu];

  const drinkCategories = categories.filter((c) => isDrinkCategory(c.category_data?.name));
  return drinkCategories.sort((a, b) =>
    (a.category_data?.name ?? "").localeCompare(b.category_data?.name ?? ""));
}

function currencyDigits(currency: string): number {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency })
      .resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/** Square amounts are minor units (850 GBP -> £8.50). Whole amounts lose the ".00". */
function formatMoney(amount: number, currency: string): string {
  const digits = currencyDigits(currency);
  const value = amount / 10 ** digits;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : digits,
  }).format(value);
}

/** One price, or a range when an item has differently priced variations (sizes). */
function priceOf(item: SquareObject): string | undefined {
  const prices = (item.item_data?.variations ?? [])
    .map((variation) => variation.item_variation_data?.price_money)
    .filter((money): money is Required<SquareMoney> =>
      typeof money?.amount === "number" && typeof money.currency === "string");
  if (prices.length === 0) return undefined;

  const currency = prices[0].currency;
  const amounts = prices.filter((p) => p.currency === currency).map((p) => p.amount);
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);
  return low === high
    ? formatMoney(low, currency)
    : `${formatMoney(low, currency)}–${formatMoney(high, currency)}`;
}

function toMenuItem(item: SquareObject): MenuItem {
  const description = (item.item_data?.description_plaintext ?? item.item_data?.description ?? "").trim();
  return {
    id: item.id,
    name: (item.item_data?.name ?? "").trim(),
    ...(description ? { description } : {}),
    ...(priceOf(item) ? { price: priceOf(item) } : {}),
  };
}

/** Pure catalog -> menu transform, kept separate from the network call so it can be tested. */
export function buildMenu(objects: SquareObject[], menuId: string): MenuCategory[] {
  const live = objects.filter((object) => !object.is_deleted);
  const categories = live.filter((object) => object.type === "CATEGORY");
  const items = live.filter(
    (object) => object.type === "ITEM" && !object.item_data?.is_archived && object.item_data?.name?.trim(),
  );

  return resolveCategories(categories, menuId)
    .map((category) => ({
      id: category.id,
      name: category.category_data?.name?.trim() || "Menu",
      items: items
        .filter((item) => categoryIdsOf(item).has(category.id))
        .map((item) => ({ ordinal: itemOrdinal(item, category.id), item: toMenuItem(item) }))
        .sort((a, b) => byOrdinal(a, b) || a.item.name.localeCompare(b.item.name))
        .map((entry) => entry.item),
    }))
    .filter((category) => category.items.length > 0);
}

/* ---------------------------------------------------------------------- Reading */

/**
 * Names taken from the site's own copy. No prices here: an outage should never put a
 * made-up number in front of a customer.
 */
export const FALLBACK_MENU: MenuCategory[] = [
  {
    id: "fallback-cocktails",
    name: "Cocktails",
    items: [
      { id: "fallback-purple-rain", name: "Purple Rain" },
      { id: "fallback-sex-on-the-beach", name: "Sex on the Beach" },
      { id: "fallback-pornstar-martini", name: "Pornstar Martini" },
      { id: "fallback-woowoo", name: "WooWoo" },
      { id: "fallback-coconut-breeze", name: "Coconut Breeze" },
      { id: "fallback-cherry-cola", name: "Cherry Cola" },
      { id: "fallback-margarita-spritz", name: "Margarita Spritz" },
      { id: "fallback-mojito", name: "Mojito" },
      { id: "fallback-strawberry-daiquiri", name: "Strawberry Daiquiri" },
      { id: "fallback-cosmopolitan", name: "Cosmopolitan" },
      { id: "fallback-deep-blue-sea", name: "Deep Blue Sea" },
      { id: "fallback-pina-colada", name: "Piña Colada" },
    ],
  },
];

export async function getMenu(): Promise<Menu> {
  const { menuId, token } = squareConfig();

  if (!token) {
    console.warn("[menu] SQUARE_ACCESS_TOKEN is not set — serving the static menu.");
    return { categories: FALLBACK_MENU, source: "fallback" };
  }

  const cached = await readCachedMenu(menuId);
  if (cached) return cached;

  try {
    const categories = buildMenu(await fetchCatalogObjects(), menuId);
    if (categories.length > 0) {
      await cacheMenu(menuId, categories);
      return { categories, source: "square" };
    }
    console.warn(`[menu] Square returned no items for menu ${menuId} — serving the static menu.`);
  } catch (error) {
    console.error("[menu] Could not read the Square catalog — serving the static menu.", error);
  }

  return { categories: FALLBACK_MENU, source: "fallback" };
}

const isCocktailCategory = (category: MenuCategory) => /cocktail/i.test(category.name) && !/mocktail/i.test(category.name);

/**
 * Every visitor sees one shared menu. It takes its item names and descriptions from
 * Square's Cocktails category because those describe the drink in either form.
 */
export function menuForOccasion(menu: Menu): MenuCategory[] {
  const source = menu.categories.filter(isCocktailCategory);
  const categories = source.length > 0 ? source : FALLBACK_MENU;
  return [{ id: "site-menu", name: "The Menu", items: categories.flatMap((category) => category.items) }];
}
