import Link from "next/link";
import { getMenu, menuForOccasion, type Menu } from "../lib/menu";

type MenuCopy = { heading: string; description: string };

const DEFAULT_MENU_COPY: MenuCopy = {
  heading: "The drinks people know and love.",
  description: "A full menu of familiar cocktail favourites, mixed for your occasion. Alcohol-free versions are available too.",
};

export const SCHOOL_FETE_MENU_COPY: MenuCopy = {
  heading: "All the cocktail flavour. Zero alcohol.",
  description: "Every drink is made without alcohol, while keeping the familiar look and taste of the cocktails you know.",
};

export function MenuSectionSkeleton() {
  return <section className="menu-section menu-skeleton" id="menu" aria-busy="true" aria-label="Loading the menu">
    <div className="menu-intro" aria-hidden="true">
      <p className="section-mark">The menu</p>
      <span className="skeleton-block skeleton-heading" />
      <span className="skeleton-block skeleton-copy" />
      <span className="skeleton-block skeleton-copy short" />
    </div>
    <div className="menu-board" aria-hidden="true">
      <section className="menu-category">
        <span className="skeleton-block skeleton-category" />
        <div className="skeleton-list">
          <span className="skeleton-block" /><span className="skeleton-block" /><span className="skeleton-block" /><span className="skeleton-block short" /><span className="skeleton-block" />
        </div>
      </section>
    </div>
  </section>;
}

/** Server Component: the live Square menu. Keeps the Square token on the server. */
export async function MenuSection({ menu: suppliedMenu, copy = DEFAULT_MENU_COPY }: { menu?: Menu; copy?: MenuCopy } = {}) {
  const menu = suppliedMenu ?? await getMenu();
  const categories = menuForOccasion(menu);

  return <section className="menu-section" id="menu">
    <div className="menu-intro">
      <p className="section-mark">The menu</p>
      <h2>{copy.heading}</h2>
      <p>{copy.description}</p>
      <Link href="/#occasions" className="text-link">See every occasion <span aria-hidden>→</span></Link>
    </div>
    <div className="menu-board">
      {categories.map(category => (
        <section className="menu-category" key={category.id} aria-labelledby={`menu-${category.id}`}>
          <h3 id={`menu-${category.id}`}>{category.name}</h3>
          <ul>
            {category.items.map(item => {
              const noteId = `menu-${category.id}-${item.id}-note`;
              return <li className="menu-row" key={item.id} tabIndex={item.description ? 0 : undefined} aria-describedby={item.description ? noteId : undefined}>
                <span className="menu-name">{item.name}</span>
                {item.description ? <span className="menu-item-note" id={noteId}>{item.description}</span> : null}
              </li>;
            })}
          </ul>
        </section>
      ))}
    </div>
  </section>;
}
