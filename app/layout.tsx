import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "drink. | mobile drinks for every gathering",
  description: "A Dorset mobile drinks van for celebrations, school events, corporate gatherings and weddings."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
