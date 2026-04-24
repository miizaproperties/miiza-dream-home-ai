import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TenantPlacementPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Tenant Screening",
      description: "Comprehensive background checks including credit history, employment verification, and references."
    },
    {
      title: "Application Processing",
      description: "Efficient application processing with clear communication and timely responses."
    },
    {
      title: "Tenant Matching",
      description: "Match qualified tenants with properties based on preferences, requirements, and budget."
    },
    {
      title: "Lease Preparation",
      description: "Professional lease document preparation ensuring legal compliance and clarity."
    },
    {
      title: "Move-in Coordination",
      description: "Smooth move-in process including inspections, key handover, and documentation."
    },
    {
      title: "Tenant Support",
      description: "Ongoing support for tenants including maintenance requests and lease inquiries."
    }
  ];

  const process = [
    { step: 1, title: "Property Listing", description: "List your property with detailed information and requirements." },
    { step: 2, title: "Tenant Applications", description: "Receive and review applications from interested tenants." },
    { step: 3, title: "Screening & Verification", description: "Comprehensive screening of potential tenants." },
    { step: 4, title: "Tenant Selection", description: "Present qualified candidates for your approval." },
    { step: 5, title: "Lease Signing", description: "Facilitate lease signing and documentation." },
    { step: 6, title: "Move-in", description: "Coordinate smooth tenant move-in and handover." }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/10">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Tenant Placement Services
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Find reliable, qualified tenants quickly with our comprehensive tenant placement services. We handle the entire process from screening to move-in.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
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
                Our Tenant Placement Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From initial screening to move-in, we ensure you get reliable tenants who meet your requirements.
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
                  className="bg-card p-6 rounded-lg border-l-4 border-teal-600 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
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
                Our Placement Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A streamlined process designed to find and place qualified tenants efficiently.
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
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
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
        <section className="py-16 bg-teal-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Find Reliable Tenants Today
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Let us help you find qualified tenants quickly and efficiently.
              </p>
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TenantPlacementPage;
