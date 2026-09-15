"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { events, type EventKey } from "../lib/events";

export { events, type EventKey };

export function Nav({ inverse = false }: { inverse?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLink = (href: string, label: string) =>
    <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>;
  return <nav className={`site-nav ${inverse ? "inverse" : ""}`} aria-label="Main navigation">
    <Link href="/" className="brand" aria-label="drink. home">drink.</Link>
    <button className="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(open => !open)}>
      <span /><span /><span />
    </button>
    <div className={`nav-links ${menuOpen ? "open" : ""}`} id="primary-navigation">
      {navLink("/", "Home")}
      {Object.entries(events).map(([slug, event]) => navLink(`/${slug}`, event.short))}
    </div>
    <a className="nav-cta" href="#plan" onClick={() => setMenuOpen(false)}>plan your drinks</a>
  </nav>;
}

/** The artwork plus the text printed on it. `.plate-paper` is laid over the card's
 *  real (slightly rotated) paper surface by CSS, so the same face reads correctly
 *  at passboard size and at event-hero size. */
export function PlateFace({ event, copy = false }: { event: typeof events[EventKey]; copy?: boolean }) {
  return <>
    <img src={event.asset} alt="" />
    <span className="plate-paper">
      <span className="plate-type">{event.tag}</span>
      <strong>drink.</strong>
      <span className="plate-title">{event.short}</span>
      {copy && <span className="plate-copy">{event.description}</span>}
    </span>
  </>;
}

export function Passboard() {
  const [active, setActive] = useState<EventKey>("festivals");
  return <section className={`passboard active-${active}`} aria-label="Choose your occasion">
    {(Object.entries(events) as [EventKey, typeof events[EventKey]][]).map(([slug, event]) => (
      <Link href={`/${slug}`} className={`occasion-plate ${event.className} ${active === slug ? "active" : ""}`} key={slug}
        onMouseEnter={() => setActive(slug)} onFocus={() => setActive(slug)}>
        <PlateFace event={event} copy />
      </Link>
    ))}
  </section>;
}

export function PlanningStrip({ event }: { event?: EventKey }) {
  const eventName = event ? events[event].name.toLowerCase() : "occasion";
  return <section className="planning-strip" id="plan">
    <p>Planning a {eventName}?</p>
    <h2>Good drinks start with your day.</h2>
    <p>Start with the people you are bringing together, the setting and the drinks you would love to see in their hands. One shared menu keeps the choice easy for everyone.</p>
    <div className="planning-prompts" aria-label="Ideas for planning your drinks"><span>your occasion</span><span>your guest list</span><span>your favourites</span></div>
    <Link href="#menu" className="button-light">see the menu</Link>
  </section>;
}

export function SharedMenuStory() {
  return <section className="shared-menu-story" aria-labelledby="shared-menu-title">
    <div><h2 id="shared-menu-title">One menu. Everyone in.</h2><p>A bright, friendly drinks service for the moments people come together—whether they are dancing, catching up or taking five.</p></div>
    <div className="shared-menu-points">
      <article><h3>The favourites</h3><p>Choose from the drinks people already know, recognise and look forward to.</p></article>
      <article><h3>A choice for every guest</h3><p>Every cocktail has an alcohol-free alternative, made to hold on to the flavour people love.</p></article>
      <article><h3>Made for gathering</h3><p>From a village fete to a wedding celebration, the same van fits the moment.</p></article>
    </div>
  </section>;
}
