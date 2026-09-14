"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { events, type EventKey } from "../lib/events";

export { events, type EventKey };

export function Nav({ inverse = false }: { inverse?: boolean }) {
  const pathname = usePathname();
  const navLink = (href: string, label: string) =>
    <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>;
  return <nav className={`site-nav ${inverse ? "inverse" : ""}`} aria-label="Main navigation">
    <Link href="/" className="brand" aria-label="drink. home">drink.</Link>
    <div className="nav-links">
      {navLink("/", "Home")}
      {Object.entries(events).map(([slug, event]) => navLink(`/${slug}`, event.short))}
    </div>
    <a className="nav-cta" href="#plan">plan your drinks</a>
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

export function MenuNote() {
  return <section className="menu-note" id="menu">
    <div><p className="section-mark">The menu</p><h2>The same good drink, with or without alcohol.</h2></div>
    <p>Our cocktail recipes are built so the alcohol can be taken out for a mocktail that tastes almost the same. Purple Rain, Pornstar Martini, Mojito and Piña Colada are all on the current menu.</p>
    <Link href="/festivals" className="text-link">See the occasions <span aria-hidden>→</span></Link>
  </section>;
}

export function PlanningStrip({ event }: { event?: EventKey }) {
  const eventName = event ? events[event].name.toLowerCase() : "occasion";
  return <section className="planning-strip" id="plan">
    <p>Planning a {eventName}?</p>
    <h2>Good drinks belong in the plan.</h2>
    <p>Booking details are coming soon. In the meantime, explore the menu and choose the occasion that fits your day.</p>
    <Link href="/" className="button-light">back to the passbook</Link>
  </section>;
}
