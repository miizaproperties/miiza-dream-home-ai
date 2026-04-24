import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PropertyRentalsPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Residential Rentals",
      description: "Find your perfect home with our extensive selection of apartments, houses, and villas available for rent across Kenya."
    },
    {
      title: "Commercial Leasing",
      description: "Flexible commercial space leasing options for offices, retail shops, warehouses, and industrial properties."
    },
    {
      title: "Short-Term Rentals",
      description: "Serviced apartments and furnished rentals perfect for temporary stays, corporate housing, or relocation."
    },
    {
      title: "Lease Negotiation",
      description: "Expert negotiation to secure favorable lease terms, rental rates, and conditions that work for you."
    },
    {
      title: "Tenant Screening",
      description: "Comprehensive tenant screening and verification services for property owners."
    },
    {
      title: "Lease Management",
      description: "Full lease management services including renewals, modifications, and compliance."
    }
  ];

  const benefits = [
    "Wide selection of verified properties",
    "Transparent pricing with no hidden fees",
    "Flexible lease terms to suit your needs",
    "Quick tenant placement for landlords",
    "Professional property documentation",
    "Ongoing support throughout your tenancy"
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Property Rentals & Leasing
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Find the perfect rental property or lease your property to qualified tenants. Flexible solutions for all your rental needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => navigate('/properties')}
                >
                  View Available Rentals
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/contact')}
                >
                  List Your Property
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
                Rental Solutions for Everyone
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're looking to rent or lease out your property, we have the right solution for you.
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
                  className="bg-card p-6 rounded-lg border-l-4 border-green-600 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                  Why Choose Our Rental Services?
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 bg-card p-5 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mt-1">
                      ✓
                    </div>
                    <p className="text-lg text-foreground">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Start Your Rental Journey Today
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Browse available properties or get in touch to list your property for rent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100"
                  onClick={() => navigate('/properties')}
                >
                  Browse Properties
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyRentalsPage;
