import { usePageTitle } from "../../hooks/usePageTitle";
import { HeroSection } from "../sections/HeroSection";
import { ClientTicker } from "../sections/ClientTicker";
import { ServicesPreview } from "../sections/ServicesPreview";
import { SelectedWorks } from "../sections/SelectedWorks";
import { GoalsSection } from "../sections/GoalsSection";
import { WhyPuronSection } from "../sections/WhyPuronSection";
import { SocialProof } from "../sections/SocialProof";
import { ContactCta } from "../sections/ContactCta";

export function HomePage() {
  usePageTitle("Puron Agency — Social Media Content, das Unternehmen sichtbar macht");
  return (
    <>
      <HeroSection />
      <ClientTicker />
      <ServicesPreview />
      <SelectedWorks />
      <GoalsSection />
      <WhyPuronSection />
      <SocialProof />
      <ContactCta />
    </>
  );
}
