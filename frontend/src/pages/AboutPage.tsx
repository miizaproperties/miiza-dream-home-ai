import Navigation from "@/components/Navigation";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const AboutPage = () => {
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
