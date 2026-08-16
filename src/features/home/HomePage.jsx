import { useEffect } from "react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { HeroSection } from "./components/HeroSection";
import { StorefrontSection } from "./components/StorefrontSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { ForMerchantsSection } from "./components/ForMerchantsSection";
import { FaqSection } from "./components/FaqSection";
import { CtaSection } from "./components/CtaSection";
import { Footer } from "./components/Footer";

export function HomePage() {
  // One fetch for the page: the rate board and the shop read the same catalogue.
  const fetchAllProducts = useInventoryStore((s) => s.fetchAllProducts);
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <>
      <HeroSection />
      <StorefrontSection />
      <HowItWorksSection />
      <FaqSection />
      <ForMerchantsSection />
      <CtaSection />
      <Footer />
    </>
  );
}
