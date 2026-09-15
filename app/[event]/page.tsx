import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav, PlanningStrip, PlateFace } from "../components";
import { events, type EventKey } from "../../lib/events";
import { MenuSection, MenuSectionSkeleton, SCHOOL_FETE_MENU_COPY } from "../menu";

const details: Record<EventKey, { title: string; lead: string; body: string; detail: string }> = {
  festivals: { title: "Bring the good vibes to the field.", lead: "Festival-ready drinks, familiar favourites and a bright van ready for the long day outdoors.", body: "A bright drinks stop for the moments between the music, the catch-ups and whatever is next on the line-up.", detail: "Choose a favourite, take a breather and head back out there. The full menu is made for the whole festival day." },
  "school-fetes": { title: "A drinks stop for the whole community.", lead: "A proper drinks menu for a busy school-fete day: cocktail-style serves, all made without alcohol.", body: "A cheerful pause in the day for pupils, families, staff and visitors.", detail: "Every drink keeps the familiar look and flavour of the cocktails you know, without a drop of alcohol." },
  corporate: { title: "A smart mobile bar, without the fuss.", lead: "A considered drinks service for teams, launches and company gatherings.", body: "A polished addition to team gatherings, client events and launch days, with a menu that makes the choice simple.", detail: "From the first welcome to the last catch-up, drink. brings a friendly, well-considered service to the room." },
  weddings: { title: "A drinks moment made for your celebration.", lead: "Elegant, relaxed and ready for a wonderful day.", body: "For the arrival, the catch-up and the dancefloor pause: a beautiful drinks service for the moments everyone shares.", detail: "A thoughtful addition to the day, built around familiar favourites and the people you have brought together." }
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ event: string }> }): Promise<Metadata> {
  const { event } = await params;
  if (!(event in events)) return { title: "Page not found" };
  const key = event as EventKey;
  return { title: events[key].name, description: details[key].lead };
}

export default async function EventPage({ params }: { params: Promise<{ event: string }> }) {
  const { event: route } = await params;
  if (!(route in events)) notFound();
  const key = route as EventKey; const item = events[key]; const content = details[key];
  return <main className={`event-page ${item.className}`}>
    <Nav inverse={key === "festivals"} />
    <section className="event-hero">
      <div className="event-copy"><p className="event-label">{item.name}</p><h1>{content.title}</h1><p className="event-lead">{content.lead}</p><a className="event-action" href="#plan">start planning</a></div>
      <div className="event-artefact"><div className="artefact-frame"><PlateFace event={item} /></div></div>
    </section>
    <section className="event-story"><p>{content.body}</p><p>{content.detail}</p></section>
    <Suspense fallback={<MenuSectionSkeleton />}><MenuSection copy={key === "school-fetes" ? SCHOOL_FETE_MENU_COPY : undefined} /></Suspense>
    <section className="next-occasion"><p>Same van. Different occasions.</p><div>{Object.entries(events).filter(([slug]) => slug !== key).map(([slug, entry]) => <Link key={slug} href={`/${slug}`}>{entry.short} <span aria-hidden>↗</span></Link>)}</div></section>
    <PlanningStrip event={key} />
  </main>;
}
