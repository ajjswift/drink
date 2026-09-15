import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav, PlanningStrip, PlateFace } from "../components";
import { events, type EventKey } from "../../lib/events";
import { getMenu } from "../../lib/menu";
import { MenuSection, SCHOOL_FETE_MENU_COPY } from "../menu";

const details: Record<EventKey, { title: string; lead: string; body: string; detail: string }> = {
  festivals: { title: "Bring the good vibes to the field.", lead: "Festival-ready drinks, with a mocktail version that still feels part of the main event.", body: "The festival pass is the loudest page in the set: bright, fast-moving and built to be found in a crowd.", detail: "Cocktails and mocktails share the same generous menu language—so everyone gets a proper drink moment." },
  "school-fetes": { title: "A drinks stop for the whole community.", lead: "A proper drinks menu for a busy school-fete day: cocktail-style serves, all made without alcohol.", body: "This route takes its cues from a proper raffle ticket: joyful, local and full of little reasons to pause by the van.", detail: "Every drink keeps the familiar look and flavour of the cocktails you know, without a drop of alcohol." },
  corporate: { title: "A smart mobile bar, without the fuss.", lead: "A considered service moment for teams, launches and company gatherings.", body: "The corporate page is deliberately more ordered: a service sheet rather than a party poster, while holding onto the same warm pink brand signal.", detail: "Alcohol-free options sit right alongside the cocktail menu, helping hosts make the event work for everyone." },
  weddings: { title: "A drinks moment made for your celebration.", lead: "Elegant, relaxed and inclusive—because every guest deserves something lovely in hand.", body: "The wedding invitation gives the brand more quiet space. The celebration still feels joyful; the details simply get to breathe.", detail: "Choose cocktails, close-tasting mocktails, or both from one shared menu for the whole party." }
};

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ event: string }> }) {
  const { event: route } = await params;
  if (!(route in events)) notFound();
  const key = route as EventKey; const item = events[key]; const content = details[key];
  const menu = await getMenu();
  return <main className={`event-page ${item.className}`}>
    <Nav inverse={key === "festivals"} />
    <section className="event-hero">
      <div className="event-copy"><p className="event-label">{item.name}</p><h1>{content.title}</h1><p className="event-lead">{content.lead}</p><a className="event-action" href="#plan">start planning</a></div>
      <div className="event-artefact"><div className="artefact-frame"><PlateFace event={item} /></div></div>
    </section>
    <section className="event-story"><p>{content.body}</p><p>{content.detail}</p></section>
    <MenuSection menu={menu} copy={key === "school-fetes" ? SCHOOL_FETE_MENU_COPY : undefined} />
    <section className="next-occasion"><p>Same van. Different occasions.</p><div>{Object.entries(events).filter(([slug]) => slug !== key).map(([slug, entry]) => <Link key={slug} href={`/${slug}`}>{entry.short} <span aria-hidden>↗</span></Link>)}</div></section>
    <PlanningStrip event={key} />
  </main>;
}
