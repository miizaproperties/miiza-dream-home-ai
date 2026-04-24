import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PropertiesSection from "@/components/PropertiesSection";
import PropertyNavigation from "@/components/PropertyNavigation";
import PropertyStats from "@/components/PropertyStats";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
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
