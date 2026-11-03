import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SmoothScroll from "@/components/SmoothScroll";
import NewBooksPopup from "@/components/NewBooksPopup";
import PageViewTracker from "@/components/PageViewTracker";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import ThemePreviewBar from "@/components/ThemePreviewBar";
import { getActiveTheme } from "@/lib/theme";
import { themeCss } from "@/lib/theme-shared";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getActiveTheme();
  return (
    <>
      {/* The admin-chosen theme. Only the public site gets it, so the admin always stays readable. */}
      <style id="site-theme" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      <SmoothScroll />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
      <NewBooksPopup />
      <PageViewTracker />
      <WebVitalsReporter />
      <ThemePreviewBar />
    </>
  );
}
