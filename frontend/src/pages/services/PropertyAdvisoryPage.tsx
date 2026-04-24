import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PropertyAdvisoryPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Investment Consulting",
      description: "Expert advice on property investment opportunities, market trends, and ROI analysis to help you make informed decisions."
    },
    {
      title: "Market Research",
      description: "Comprehensive market research and analysis to understand property values, trends, and opportunities in your area."
    },
    {
      title: "Financial Planning",
      description: "Strategic financial planning for property purchases, including mortgage advice and investment strategies."
    },
    {
      title: "Risk Assessment",
      description: "Detailed risk assessment to identify potential issues and opportunities in property investments."
    },
    {
      title: "Due Diligence",
      description: "Thorough due diligence including title searches, property inspections, and legal compliance checks."
    },
    {
      title: "Portfolio Strategy",
      description: "Long-term portfolio strategy development to build and manage your property investment portfolio."
    }
  ];

  const expertise = [
    "Residential property markets",
    "Commercial real estate",
    "Property valuation and pricing",
    "Investment analysis",
    "Legal and regulatory compliance",
    "Market forecasting"
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/10">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Property Advisory & Consultancy
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Expert real estate consultancy services to guide your property decisions. Get professional advice tailored to your unique needs and goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate('/contact')}
                >
                  Book Consultation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/properties')}
                >
                  Explore Opportunities
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Advisory Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive consultancy services to help you navigate the real estate market with confidence.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card p-6 rounded-lg border-l-4 border-indigo-600 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Our Expertise Areas
                </h2>
                <p className="text-lg text-muted-foreground">
                  We provide expert advice across various aspects of real estate.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expertise.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 bg-card p-5 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mt-1">
                      ✓
                    </div>
                    <p className="text-lg text-foreground">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-indigo-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Get Expert Property Advice
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Schedule a consultation with our real estate experts to discuss your property goals and get personalized advice.
              </p>
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
                onClick={() => navigate('/contact')}
              >
                Schedule Consultation
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyAdvisoryPage;
