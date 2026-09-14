"use client";

import Link from "next/link";
import { useState } from "react";
import { events, type EventKey } from "../lib/events";

export { events, type EventKey };

export function Nav({ inverse = false }: { inverse?: boolean }) {
  return <nav className={`site-nav ${inverse ? "inverse" : ""}`} aria-label="Main navigation">
    <Link href="/" className="brand" aria-label="drink. home">drink.</Link>
    <div className="nav-links">
      {Object.entries(events).map(([slug, event]) => <Link key={slug} href={`/${slug}`}>{event.short}</Link>)}
    </div>
    <a className="nav-cta" href="#plan">plan your drinks</a>
  </nav>;
}

export function Passboard() {
  const [active, setActive] = useState<EventKey>("festivals");
  return <section className={`passboard active-${active}`} aria-label="Choose your occasion">
    {(Object.entries(events) as [EventKey, typeof events[EventKey]][]).map(([slug, event]) => (
      <Link href={`/${slug}`} className={`occasion-plate ${event.className} ${active === slug ? "active" : ""}`} key={slug}
        onMouseEnter={() => setActive(slug)} onFocus={() => setActive(slug)}>
        <img src={event.asset} alt="" />
        <span className="plate-type">{event.tag}</span>
        <strong>drink.</strong>
        <span className="plate-title">{event.short}</span>
        <span className="plate-copy">{event.description}</span>
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
