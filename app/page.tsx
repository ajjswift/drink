import Link from "next/link";
import { Nav, Passboard, PlanningStrip } from "./components";
import { MenuSection } from "./menu";

/** Square data is cached through Redis in production; see lib/menu.ts. */
export const dynamic = "force-dynamic";

export default function Home() {
  return <main>
    <Nav />
    <section className="home-hero">
      <div className="hero-copy">
        <div className="hero-rule" />
        <h1>good drinks<br />for every<br />gathering.</h1>
        <p>A friendly mobile drinks van in Dorset, serving cocktails and mocktails for school events, celebrations and everyday moments.</p>
        <Link href="#occasions" className="hero-link">choose your occasion <span aria-hidden>↓</span></Link>
      </div>
      <Passboard />
      <img className="van-plate" src="/plates/van-illustration.png" alt="Decorative line illustration of the drink. mobile van" />
      <p className="hero-signoff">same van.<br />different occasions.</p>
    </section>
    <section className="occasions-intro" id="occasions"><p>Pick the invitation that feels most like your day.</p><div className="occasion-links"><Link href="/festivals">Festival energy</Link><Link href="/school-fetes">Fete-friendly</Link><Link href="/corporate">Corporate-ready</Link><Link href="/weddings">Wedding quiet</Link></div></section>
    <MenuSection />
    <PlanningStrip />
  </main>;
}
