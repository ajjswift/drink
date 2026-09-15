import { buildMenu, menuForOccasion, FALLBACK_MENU, type SquareObject } from "../lib/menu";

const MENU = "6VC47G3IED5AQRMUTNCLSMY5";
let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { console.log(`  ok   ${label}`); return; }
  failures++; console.log(`  FAIL ${label}\n       expected ${e}\n       actual   ${a}`);
}

const cat = (id: string, name: string, parent?: string, ordinal = 0): SquareObject => ({
  id, type: "CATEGORY",
  category_data: { name, ...(parent ? { parent_category: { id: parent, ordinal } } : {}) },
});
const item = (id: string, name: string, catId: string, amount?: number, extra: any = {}): SquareObject => ({
  id, type: "ITEM",
  item_data: {
    name,
    categories: [{ id: catId, ordinal: extra.ordinal ?? 0 }],
    ...(amount !== undefined
      ? { variations: [{ id: `${id}-v`, item_variation_data: { price_money: { amount, currency: "GBP" } } }] }
      : {}),
    ...extra.data,
  },
});

console.log("\n1. nested menu category -> Cocktails + Mocktails, priced and ordered");
{
  const objects: SquareObject[] = [
    cat(MENU, "Drinks menu"),
    cat("C1", "Cocktails", MENU, 1), cat("C2", "Mocktails", MENU, 2),
    cat("C9", "Retail", "OTHER"),
    item("i3", "Mojito", "C1", 950, { ordinal: 3 }),
    item("i1", "Purple Rain", "C1", 850, { ordinal: 1 }),
    item("i2", "Pornstar Martini", "C1", 1000, { ordinal: 2 }),
    item("m1", "Cherry Cola", "C2", 500),
    item("r1", "Branded glass", "C9", 300),
  ];
  const menu = buildMenu(objects, MENU);
  check("two categories, cocktails first", menu.map(c => c.name), ["Cocktails", "Mocktails"]);
  check("items in Square's order", menu[0].items.map(i => i.name), ["Purple Rain", "Pornstar Martini", "Mojito"]);
  check("price formatted", menu[0].items[0].price, "£8.50");
  check("whole pounds lose .00", menu[0].items[2].price, "£9.50");
  check("unrelated category excluded", menu.some(c => c.name === "Retail"), false);
}

console.log("\n2. price ranges, descriptions, deleted + archived items");
{
  const objects: SquareObject[] = [
    cat(MENU, "Drinks menu"), cat("C1", "Cocktails", MENU, 1),
    { id: "i1", type: "ITEM", item_data: { name: "Espresso Martini", description: "Rich and cold",
      categories: [{ id: "C1", ordinal: 1 }],
      variations: [
        { id: "v1", item_variation_data: { price_money: { amount: 900, currency: "GBP" } } },
        { id: "v2", item_variation_data: { price_money: { amount: 1200, currency: "GBP" } } }] } },
    { id: "i2", type: "ITEM", is_deleted: true, item_data: { name: "Deleted", categories: [{ id: "C1" }] } },
    { id: "i3", type: "ITEM", item_data: { name: "Archived", is_archived: true, categories: [{ id: "C1" }] } },
    { id: "i4", type: "ITEM", item_data: { name: "Flat", categories: [{ id: "C1", ordinal: 9 }] } },
  ];
  const menu = buildMenu(objects, MENU);
  check("deleted and archived dropped", menu[0].items.map(i => i.name), ["Espresso Martini", "Flat"]);
  check("range rendered", menu[0].items[0].price, "£9–£12");
  check("description kept", menu[0].items[0].description, "Rich and cold");
  check("priceless item has no price", menu[0].items[1].price, undefined);
}

console.log("\n3. legacy category_id and reporting_category");
{
  const objects: SquareObject[] = [
    cat(MENU, "Drinks menu"), cat("C1", "Cocktails", MENU, 1),
    { id: "i1", type: "ITEM", item_data: { name: "Legacy field", category_id: "C1" } },
    { id: "i2", type: "ITEM", item_data: { name: "Reporting only", reporting_category: { id: "C1" } } },
  ];
  check("both resolve", buildMenu(objects, MENU)[0].items.map(i => i.name), ["Legacy field", "Reporting only"]);
}

console.log("\n4. id points straight at a category of drinks (no children)");
{
  const objects: SquareObject[] = [cat("FLAT", "Cocktails"), item("i1", "Mojito", "FLAT", 900)];
  check("uses the category itself", buildMenu(objects, "FLAT").map(c => c.name), ["Cocktails"]);
}

console.log("\n5. configured id resolves to nothing -> named categories");
{
  const objects: SquareObject[] = [
    cat("X1", "Cocktails"), cat("X2", "Mocktails"), cat("X3", "Merch"),
    item("i1", "Mojito", "X1", 900), item("i2", "Cherry Cola", "X2", 400), item("i3", "Tote", "X3", 800),
  ];
  check("falls back to drink categories", buildMenu(objects, "WRONG-ID").map(c => c.name), ["Cocktails", "Mocktails"]);
}

console.log("\n6. empty catalog");
check("no categories", buildMenu([], MENU), []);

console.log("\n7. shared menu");
{
  const menu = { categories: [
    { id: "C1", name: "Cocktails", items: [{ id: "a", name: "Mojito" }] },
    { id: "C2", name: "Mocktails", items: [{ id: "b", name: "Cherry Cola" }] },
    { id: "C3", name: "Merch", items: [{ id: "c", name: "Tote" }] },
  ], source: "square" as const };
  check("only the cocktail data is shown", menuForOccasion(menu)[0].items.map(i => i.name), ["Mojito"]);
  check("the visible category is named The Menu", menuForOccasion(menu).map(c => c.name), ["The Menu"]);
  check("fallback covers the full supplied menu", FALLBACK_MENU.map(c => c.items.length), [12]);
}

console.log(failures === 0 ? "\nAll checks passed\n" : `\n${failures} FAILED\n`);
process.exit(failures === 0 ? 0 : 1);
