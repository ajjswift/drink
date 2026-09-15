"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
 return <main className="status-page"><p>This page did not load as expected.</p><h1>Let’s try that again.</h1><div className="status-actions"><button type="button" className="event-action" onClick={reset}>try again</button><Link href="/" className="text-link">back to homepage</Link></div></main>;
}
