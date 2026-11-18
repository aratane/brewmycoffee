import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartMount } from "@/components/layout/cart-mount";

const display = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Artisan Brew Co. — Every Cup, A Little Happiness", template: "%s | Artisan Brew Co." },
  description:
    "Freshly brewed coffee, handcrafted with love, served with a little bunny magic. Order online, visit us, or join our coffee family.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-warm font-sans antialiased">
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <CartMount />
        </Providers>
      </body>
    </html>
  );
}
