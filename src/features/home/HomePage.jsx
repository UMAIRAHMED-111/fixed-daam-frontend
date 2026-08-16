import { HeroSection } from "./components/HeroSection";
import { StorefrontSection } from "./components/StorefrontSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { ForMerchantsSection } from "./components/ForMerchantsSection";
import { CtaSection } from "./components/CtaSection";
import { Footer } from "./components/Footer";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <StorefrontSection />
      <HowItWorksSection />
      <ForMerchantsSection />
      <CtaSection />
      <Footer />
    </>
  );
}
