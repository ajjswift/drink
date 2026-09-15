import Link from "next/link";
import { Suspense } from "react";
import { Nav, Passboard, PlanningStrip, SharedMenuStory } from "./components";
import { MenuSection, MenuSectionSkeleton } from "./menu";

/** Square data is cached through Redis in production; see lib/menu.ts. */
export const dynamic = "force-dynamic";

export default function Home() {
  return <main>
    <Nav />
    <section className="home-hero">
      <div className="hero-copy">
        <div className="hero-rule" />
        <h1>good drinks<br />for every<br />gathering.</h1>
        <p>A friendly Dorset drinks van for festivals, school fetes, work events and wedding celebrations.</p>
        <Link href="#occasions" className="hero-link">choose your occasion <span aria-hidden>↓</span></Link>
      </div>
      <Passboard />
      <img className="van-plate" src="/plates/van-illustration.png" alt="Decorative line illustration of the drink. mobile van" />
      <p className="hero-signoff">same van.<br />different occasions.</p>
    </section>
    <section className="occasions-intro" id="occasions"><p>Find the service that fits your day.</p><div className="occasion-links"><Link href="/festivals">Festivals &amp; events</Link><Link href="/school-fetes">School fetes</Link><Link href="/corporate">Corporate events</Link><Link href="/weddings">Weddings</Link></div></section>
    <Suspense fallback={<MenuSectionSkeleton />}><MenuSection /></Suspense>
    <SharedMenuStory />
    <PlanningStrip />
  </main>;
}
