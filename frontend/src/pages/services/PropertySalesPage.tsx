import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PropertySalesPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Property Valuation",
      description: "Expert property valuation services to ensure you get the best price for your property or make informed purchase decisions."
    },
    {
      title: "Market Analysis",
      description: "Comprehensive market analysis to help you understand current trends and pricing in your desired location."
    },
    {
      title: "Negotiation Support",
      description: "Professional negotiation assistance to secure the best deals for both buyers and sellers."
    },
    {
      title: "Legal Guidance",
      description: "Support through all legal processes, documentation, and compliance requirements."
    },
    {
      title: "Property Viewings",
      description: "Coordinated property viewings with flexible scheduling to fit your availability."
    },
    {
      title: "Post-Sale Support",
      description: "Continued support after the sale to ensure smooth handover and transition."
    }
  ];

  const process = [
    { step: 1, title: "Initial Consultation", description: "We discuss your needs, budget, and preferences." },
    { step: 2, title: "Property Search/Listing", description: "We find suitable properties or list your property for sale." },
    { step: 3, title: "Viewing & Evaluation", description: "Organize viewings and conduct thorough property evaluations." },
    { step: 4, title: "Offer & Negotiation", description: "Facilitate offers and negotiate the best terms." },
    { step: 5, title: "Legal & Documentation", description: "Handle all legal requirements and paperwork." },
    { step: 6, title: "Completion", description: "Finalize the transaction and complete the handover." }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Property Sales & Purchases
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Expert guidance for buying or selling properties in Kenya. We make your real estate transactions smooth, transparent, and successful.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate('/contact')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/properties')}
                >
                  Browse Properties
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
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
                Our Comprehensive Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From initial consultation to final handover, we handle every aspect of your property transaction.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card p-6 rounded-lg border-l-4 border-blue-600 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Our Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A clear, step-by-step approach to ensure your property transaction is successful.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {process.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Buy or Sell?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Contact us today for expert guidance on your property transaction.
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => navigate('/contact')}
              >
                Contact Us Today
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PropertySalesPage;
