import type { Metadata } from "next";
import { Cardo, Cormorant_Garamond, Manrope } from "next/font/google";
import { SmoothScroll } from "./components/SmoothScroll";
import { Nav } from "./components/Nav";
import { SiteFooter } from "./components/SiteFooter";
import { Tweaks } from "./components/Tweaks";
import "./globals.css";

// Cardo is kept for the SHAFE wordmark only; headings run on Cormorant Garamond.
const cardo = Cardo({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
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
      className={`${cardo.variable} ${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Re-applies a saved theme before first paint, so a client clicking
            through a shared link doesn't see the stock design flash on every
            page. No-op (and no network) for anyone who hasn't used the panel. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=JSON.parse(localStorage.getItem('shafe-tweaks'));if(t&&t.vars){var r=document.documentElement;for(var k in t.vars)r.style.setProperty(k,t.vars[k]);r.setAttribute('data-tweaks','')}}catch(e){}`,
          }}
        />
        <SmoothScroll>
          <Nav />
          {children}
          <SiteFooter />
        </SmoothScroll>
        <Tweaks />
      </body>
    </html>
  );
}
