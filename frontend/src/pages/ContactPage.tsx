import Navigation from "@/components/Navigation";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const ContactPage = () => {
  useSEO({
    title: "Contact MiiZA Realtors | Get in Touch with Our Real Estate Experts",
    description: "Contact MiiZA Realtors for all your real estate needs in Nairobi. Call +254-717-334-422 or email us. We're here to help you find your perfect property.",
    keywords: "contact MiiZA Realtors, real estate contact Nairobi, property inquiries Kenya"
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
