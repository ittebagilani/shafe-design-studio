import type { Metadata } from "next";
import { Cardo, EB_Garamond, Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "./components/SmoothScroll";
import { Nav } from "./components/Nav";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

// Cardo is kept for the SHAFE wordmark only; headings run on EB Garamond.
const cardo = Cardo({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHAFE Design Studio - Interior Design, Architecture & Permits",
  description:
    "SHAFE Design Studio reimagines interiors and the built environment: interior design, architecture, and permit drawings for homes and businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cardo.variable} ${ebGaramond.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <Nav />
          {children}
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
