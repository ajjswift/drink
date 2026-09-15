import Link from "next/link";

export default function NotFound() {
 return <main className="status-page"><p>We could not find that page.</p><h1>Find the right occasion.</h1><Link href="/#occasions" className="event-action">see all occasions</Link></main>;
}
