import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { KEYWORDS, SITE_DESCRIPTION, SITE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pastor Victor Akuwa | Teacher, Author, Mentor",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "religion",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    title: "Pastor Victor Akuwa | Teacher, Author, Mentor",
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pastor Victor Akuwa | Teacher, Author, Mentor",
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  appleWebApp: {
    capable: true,
    title: "PV",
    statusBarStyle: "black",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
