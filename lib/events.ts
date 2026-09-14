export type EventKey = "festivals" | "school-fetes" | "corporate" | "weddings";

export const events: Record<EventKey, { name: string; short: string; tag: string; description: string; className: string; asset: string }> = {
  festivals: { name: "Festivals & events", short: "Festivals", tag: "festival pass", description: "Big energy, quick service and drinks everyone can enjoy.", className: "festival", asset: "/plates/festival-pass.png" },
  "school-fetes": { name: "School fetes", short: "School fetes", tag: "raffle ticket", description: "A cheerful drinks stop for a community day out.", className: "fete", asset: "/plates/school-ticket.png" },
  corporate: { name: "Corporate events", short: "Corporate", tag: "service sheet", description: "A polished mobile bar moment for teams and guests.", className: "corporate", asset: "/plates/corporate-sheet.png" },
  weddings: { name: "Weddings", short: "Weddings", tag: "invitation", description: "A considered drinks service for beautiful moments together.", className: "wedding", asset: "/plates/wedding-invitation.png" }
};
