import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SITE_NAME, SITE_URL } from "../lib/metadata.js";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Professional Website Audit & Conversion Engine`,
    template: `%s | ${SITE_NAME}`
  },
  description:
    "Find what's stopping your visitors from buying. Complete UX audit in under a minute with visual proof and step-by-step fixes.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Find what's stopping your visitors from buying. Complete UX audit in under a minute with visual proof and step-by-step fixes."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} antialiased`}>{children}</body>
    </html>
  );
}
