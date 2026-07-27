import { usePageMeta } from "../../hooks/usePageTitle";
import { HOME_META } from "../../seo";
import { HeroSection } from "../sections/HeroSection";
import { ClientTicker } from "../sections/ClientTicker";
import { ServicesPreview } from "../sections/ServicesPreview";
// import { SelectedWorks } from "../sections/SelectedWorks"; // hidden until we have real portfolio entries
import { GoalsSection } from "../sections/GoalsSection";
// import { WhyPuronSection } from "../sections/WhyPuronSection"; // section removed per design
import { InstagramReels } from "../sections/InstagramReels";
import { SocialProof } from "../sections/SocialProof";
import { ContactCta } from "../sections/ContactCta";

export function HomePage() {
  usePageMeta(HOME_META.title, HOME_META.description, "/");
  return (
    <>
      <HeroSection />
      <ClientTicker />
      <ServicesPreview />
      {/* <SelectedWorks /> */}
      <GoalsSection />
      {/* <WhyPuronSection /> */}
      <InstagramReels />
      <SocialProof />
      <ContactCta />
    </>
  );
}
