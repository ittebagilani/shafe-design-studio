// Single source of truth for business facts used across metadata, JSON-LD,
// sitemap, and OG images — so they can't drift out of sync with each other.

export const SITE_URL = "https://shafedesign.studio";
export const SITE_NAME = "SHAFE Design Studio";
export const SITE_TITLE = "SHAFE Design Studio — Interior Design, Architecture & Permits";
export const SITE_DESCRIPTION =
  "SHAFE Design Studio is an Ontario architecture and interior design practice handling custom homes, additions, legal basement suites (ARUs), and permit drawings — from first sketch to final approval.";

export const BUSINESS = {
  email: "info@shafeinc.com",
  address: {
    streetAddress: "126 Burnhamthorpe Road East",
    addressLocality: "Oakville",
    addressRegion: "ON",
    postalCode: "L6H 0X9",
    addressCountry: "CA",
  },
  instagram: "https://www.instagram.com/shafe.inc/",
  municipalities: ["Oakville", "Burlington", "Milton", "Peterborough", "Mississauga", "Hamilton"],
};

// So Google can render the "Home > Projects > X" trail in search results
// instead of a bare URL. Pass path segments only; SITE_URL is prepended.
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
