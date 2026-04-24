import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PropertyManagementPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Day-to-Day Maintenance",
      description: "Regular property maintenance, repairs, and upkeep to keep your investment in excellent condition."
    },
    {
      title: "Rent Collection",
      description: "Efficient and timely rent collection with transparent accounting and reporting systems."
    },
    {
      title: "Tenant Relations",
      description: "Professional tenant communication, conflict resolution, and relationship management."
    },
    {
      title: "Property Inspections",
      description: "Regular property inspections to identify issues early and maintain property standards."
    },
    {
      title: "Financial Reporting",
      description: "Detailed financial reports including income, expenses, and profit analysis."
    },
    {
      title: "Legal Compliance",
      description: "Ensure your property meets all legal requirements and regulations."
    }
  ];

  const features = [
    "24/7 emergency maintenance support",
    "Online tenant portal for easy communication",
    "Automated rent collection and reminders",
    "Regular property performance reports",
    "Vendor network for quality services",
    "Dedicated property manager assigned to your property"
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Serviced Property Management
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Professional property management services that maximize your investment returns while minimizing your stress. We handle everything so you don't have to.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => navigate('/contact')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/properties')}
                >
                  View Our Managed Properties
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
                Comprehensive Management Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From maintenance to rent collection, we take care of every aspect of your property.
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
                  className="bg-card p-6 rounded-lg border-l-4 border-purple-600 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
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
                  What Makes Us Different?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our property management services are designed to give you peace of mind.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 bg-card p-5 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mt-1">
                      ✓
                    </div>
                    <p className="text-lg text-foreground">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-purple-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Let Us Manage Your Property
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Free up your time and maximize your returns with our professional property management services.
              </p>
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => navigate('/contact')}
              >
                Get a Free Consultation
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyManagementPage;
