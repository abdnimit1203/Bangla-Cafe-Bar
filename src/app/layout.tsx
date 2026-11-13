import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PreviewBanner } from "@/components/layout/preview-banner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ToastProvider } from "@/components/ui/toast";
import { restaurantConfig } from "@/lib/config/restaurant";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${restaurantConfig.name} | ${restaurantConfig.tagline}`,
    template: `%s | ${restaurantConfig.name}`,
  },
  description: restaurantConfig.hero.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col">
        <MotionProvider>
          <ToastProvider>
            <PreviewBanner />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartSidebar />
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
