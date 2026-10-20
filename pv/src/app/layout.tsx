import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SmoothScroll from "@/components/SmoothScroll";
import NewBooksPopup from "@/components/NewBooksPopup";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pastor Victor Akuwa | Teacher, Author, Mentor",
  description:
    "Pastor Victor Akuwa is a teacher, author, mentor, husband, father, and disciple committed to raising people who know God deeply, live by His Word, and carry His influence into every sphere of society.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <SmoothScroll />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
        <NewBooksPopup />
      </body>
    </html>
  );
}
