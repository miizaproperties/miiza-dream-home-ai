import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const RealEstateMarketingPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Digital Marketing",
      description: "Strategic online marketing including social media, SEO, and digital advertising to reach your target audience."
    },
    {
      title: "Professional Photography",
      description: "High-quality property photography and virtual tours that showcase your property's best features."
    },
    {
      title: "Listing Optimization",
      description: "Optimized property listings across multiple platforms to maximize visibility and inquiries."
    },
    {
      title: "Brand Development",
      description: "Build and strengthen your property brand with consistent messaging and visual identity."
    },
    {
      title: "Content Marketing",
      description: "Engaging content creation including blog posts, property descriptions, and marketing materials."
    },
    {
      title: "Marketing Analytics",
      description: "Track and analyze marketing performance to optimize strategies and maximize ROI."
    }
  ];

  const channels = [
    "Online property portals",
    "Social media platforms",
    "Email marketing campaigns",
    "Print advertising",
    "Real estate networks",
    "Targeted digital ads"
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Real Estate Marketing
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Maximize your property's visibility and attract the right buyers or tenants with our comprehensive marketing solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => navigate('/contact')}
                >
                  Start Marketing
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/properties')}
                >
                  See Our Work
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
                Marketing Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive marketing solutions to showcase your property and reach potential buyers or tenants.
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
                  className="bg-card p-6 rounded-lg border-l-4 border-orange-600 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Marketing Channels Section */}
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
                  Multi-Channel Marketing Approach
                </h2>
                <p className="text-lg text-muted-foreground">
                  We leverage multiple channels to ensure maximum reach and visibility for your property.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {channels.map((channel, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 bg-card p-5 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mt-1">
                      ✓
                    </div>
                    <p className="text-lg text-foreground">{channel}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-orange-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Market Your Property?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Let us create a marketing strategy that gets results and attracts the right buyers or tenants.
              </p>
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100"
                onClick={() => navigate('/contact')}
              >
                Get Marketing Consultation
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RealEstateMarketingPage;
