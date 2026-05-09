import Navigation from "@/components/Navigation";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const AboutPage = () => {
  useSEO({
    title: "About MiiZA Realtors | Leading Real Estate Company in Nairobi",
    description: "Learn about MiiZA Realtors, your trusted real estate partner in Nairobi. We provide professional property sales, rentals, and management services.",
    keywords: "about MiiZA Realtors, real estate company Nairobi, property management Kenya"
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
