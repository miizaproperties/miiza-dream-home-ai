import Navigation from "@/components/Navigation";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

const ContactPage = () => {
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
