import Link from "next/link";
import { getMenu, menuForOccasion, type Menu } from "../lib/menu";

type MenuCopy = { heading: string; description: string };

const DEFAULT_MENU_COPY: MenuCopy = {
  heading: "The same good drink, with or without alcohol.",
  description: "Our cocktail recipes are built so the alcohol can be taken out for a mocktail that tastes almost the same.",
};

export const SCHOOL_FETE_MENU_COPY: MenuCopy = {
  heading: "All the cocktail flavour. Zero alcohol.",
  description: "Every drink is made without alcohol, while keeping the familiar look and taste of the cocktails you know.",
};

/** Server Component: the live Square menu. Keeps the Square token on the server. */
export async function MenuSection({ menu: suppliedMenu, copy = DEFAULT_MENU_COPY }: { menu?: Menu; copy?: MenuCopy } = {}) {
  const menu = suppliedMenu ?? await getMenu();
  const categories = menuForOccasion(menu);

  return <section className="menu-section" id="menu">
    <div className="menu-intro">
      <p className="section-mark">The menu</p>
      <h2>{copy.heading}</h2>
      <p>{copy.description}</p>
      <Link href="/#occasions" className="text-link">Choose your occasion <span aria-hidden>→</span></Link>
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
