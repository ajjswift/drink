import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "drink. | good drinks for every gathering", template: "%s | drink." },
  description: "A Dorset mobile drinks van serving familiar cocktail favourites and alcohol-free alternatives for every gathering.",
  applicationName: "drink.",
  keywords: ["Dorset mobile drinks van", "cocktails", "alcohol-free drinks", "weddings", "school fetes", "corporate events", "festivals"],
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "en_GB", siteName: "drink.", title: "drink. | good drinks for every gathering", description: "A Dorset mobile drinks van serving familiar cocktail favourites and alcohol-free alternatives for every gathering." }
};

export const viewport: Viewport = { themeColor: "#E6007E", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
