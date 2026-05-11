import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PropertiesSection from "@/components/PropertiesSection";
import PropertyNavigation from "@/components/PropertyNavigation";
import PropertyStats from "@/components/PropertyStats";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Nairobi Real Estate | Apartments, Homes & Rentals – Miiza Realtors",
    description: "Looking for property in Nairobi? Miiza Realtors offers apartments, serviced rentals, commercial spaces, and property management with flexible leasing options.",
    keywords: "Real Estate in Nairobi, Nairobi Real Estate, Property for Rent in Nairobi, apartments Nairobi, houses Nairobi, commercial property Nairobi, property management, real estate agent Nairobi, Miiza Realtors, serviced apartments Nairobi",
    canonicalUrl: "https://miizarealtors.com/"
  });

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      <Navigation />
      <HeroSection />
      <PropertiesSection />
      <PropertyNavigation />
      <PropertyStats />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
