import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#f4f3f0",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://footxi.com"),
  title: {
    default: "FootXI — Premium football kits",
    template: "%s · FootXI",
  },
  description:
    "Official-style football kits from top leagues and national teams. Clear listings, secure checkout, worldwide shipping.",
  keywords: [
    "football kits",
    "soccer jerseys",
    "premier league",
    "la liga",
    "serie a",
    "bundesliga",
    "national team jersey",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FootXI",
    title: "FootXI — Premium football kits",
    description:
      "Shop quality football jerseys: club and national kits, fans and player editions, retro drops. Worldwide delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FootXI — Premium football kits",
    description: "Club & national football kits with secure checkout and worldwide shipping.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.png?v=4", type: "image/png", sizes: "512x512" },
      { url: "/favicon.png?v=4", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/apple-icon.png?v=4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <Providers>
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <SmoothScroll />
          <Navbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="min-h-screen pt-[var(--site-header-height)] outline-none"
          >
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
