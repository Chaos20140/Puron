import { usePageTitle } from "../../hooks/usePageTitle";
import { HeroSection } from "../sections/HeroSection";
import { ClientTicker } from "../sections/ClientTicker";
import { ServicesPreview } from "../sections/ServicesPreview";
// import { SelectedWorks } from "../sections/SelectedWorks"; // hidden until we have real portfolio entries
import { GoalsSection } from "../sections/GoalsSection";
// import { WhyPuronSection } from "../sections/WhyPuronSection"; // section removed per design
import { SocialProof } from "../sections/SocialProof";
import { ContactCta } from "../sections/ContactCta";

export function HomePage() {
  usePageTitle("Puron Media — Social Media Content, der funktioniert");
  return (
    <>
      <HeroSection />
      <ClientTicker />
      <ServicesPreview />
      {/* <SelectedWorks /> */}
      <GoalsSection />
      {/* <WhyPuronSection /> */}
      <SocialProof />
      <ContactCta />
    </>
  );
}
