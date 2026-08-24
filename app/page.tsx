import { Hero } from "./components/Hero";
import { FeaturedWorks } from "./components/FeaturedWorks";
import { WorkSpans } from "./components/WorkSpans";
import { Services } from "./components/Services";
import { Consultation } from "./components/Consultation";
import { Municipalities } from "./components/Municipalities";
import { Faq } from "./components/Faq";
import { ContactCta } from "./components/ContactCta";
import { getFeatured, getProjects } from "./lib/portfolio";

export default function Home() {
  const projects = getProjects();
  const featured = getFeatured();
  return (
    <div className="grain relative overflow-x-clip bg-cream">
      <main>
        <Hero slides={featured} />
        <FeaturedWorks projects={projects} />
        <WorkSpans images={featured.map((p) => p.cover)} />
        <Services />
        <ContactCta invert />
        <Consultation />
        <Municipalities />
        <Faq />
        <ContactCta />
      </main>
    </div>
  );
}
