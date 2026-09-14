import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav, PlanningStrip } from "../components";
import { events, type EventKey } from "../../lib/events";

const details: Record<EventKey, { title: string; lead: string; body: string; detail: string; menu: string[] }> = {
  festivals: { title: "Bring the good vibes to the field.", lead: "Festival-ready drinks, with a mocktail version that still feels part of the main event.", body: "The festival pass is the loudest page in the set: bright, fast-moving and built to be found in a crowd.", detail: "Cocktails and mocktails share the same generous menu language—so everyone gets a proper drink moment.", menu: ["Purple Rain", "Sex on the Beach", "Mojito"] },
  "school-fetes": { title: "A drinks stop for the whole community.", lead: "Bright, friendly and easy to understand for a busy school-fete day.", body: "This route takes its cues from a proper raffle ticket: joyful, local and full of little reasons to pause by the van.", detail: "The drink. approach is non-alcohol-specific, so mocktails can be part of the occasion without feeling like an afterthought.", menu: ["Cherry Cola", "Strawberry Daiquiri", "Piña Colada"] },
  corporate: { title: "A smart mobile bar, without the fuss.", lead: "A considered service moment for teams, launches and company gatherings.", body: "The corporate page is deliberately more ordered: a service sheet rather than a party poster, while holding onto the same warm pink brand signal.", detail: "Alcohol-free options sit right alongside the cocktail menu, helping hosts make the event work for everyone.", menu: ["Cosmopolitan", "Margarita Spritz", "Deep Blue Sea"] },
  weddings: { title: "A drinks moment made for your celebration.", lead: "Elegant, relaxed and inclusive—because every guest deserves something lovely in hand.", body: "The wedding invitation gives the brand more quiet space. The celebration still feels joyful; the details simply get to breathe.", detail: "Choose cocktails, close-tasting mocktails, or both from one shared menu for the whole party.", menu: ["Pornstar Martini", "Coconut Breeze", "WooWoo"] }
};

export default async function EventPage({ params }: { params: Promise<{ event: string }> }) {
  const { event: route } = await params;
  if (!(route in events)) notFound();
  const key = route as EventKey; const item = events[key]; const content = details[key];
  return <main className={`event-page ${item.className}`}>
    <Nav inverse={key === "festivals"} />
    <section className="event-hero">
      <div className="event-copy"><p className="event-label">{item.name}</p><h1>{content.title}</h1><p className="event-lead">{content.lead}</p><a className="event-action" href="#plan">start planning</a></div>
      <div className="event-artefact"><img src={item.asset} alt={`Printed ${item.tag} for ${item.name}`} /></div>
    </section>
    <section className="event-story"><p>{content.body}</p><p>{content.detail}</p><div className="menu-list"><span>On the menu</span>{content.menu.map(name => <b key={name}>{name}</b>)}</div></section>
    <section className="next-occasion"><p>Same van. Different occasions.</p><div>{Object.entries(events).filter(([slug]) => slug !== key).map(([slug, entry]) => <Link key={slug} href={`/${slug}`}>{entry.short} <span aria-hidden>↗</span></Link>)}</div></section>
    <PlanningStrip event={key} />
  </main>;
}
