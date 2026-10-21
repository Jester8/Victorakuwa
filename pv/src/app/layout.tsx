import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pastor Victor Akuwa | Teacher, Author, Mentor",
  description:
    "Pastor Victor Akuwa is a teacher, author, mentor, husband, father, and disciple committed to raising people who know God deeply, live by His Word, and carry His influence into every sphere of society.",
  applicationName: "Pastor Victor Akuwa",
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
