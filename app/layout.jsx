import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: {
    default: "The Plateful — AI-Powered Recipe Discovery",
    template: "%s | The Plateful",
  },
  description:
    "Discover recipes with AI. Search by craving, cook from your pantry, or generate a full meal plan with nutrition info.",
  metadataBase: new URL("https://theplateful.app"),
  openGraph: {
    type: "website",
    siteName: "The Plateful",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Plateful",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
  themeColor: "#1B3D2F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body>
        {children}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8479936784705193"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
