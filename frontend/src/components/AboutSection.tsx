import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AboutSection = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      title: "Property Sales & Purchases",
      description: "Comprehensive real estate sales and purchase services with expert guidance throughout your property transaction journey.",
    },
    {
      title: "Property Rentals & Leasing",
      description: "Flexible rental and leasing solutions for both tenants and property owners with streamlined processes.",
    },
    {
      title: "Serviced Property Management",
      description: "Professional property management services ensuring your investment is well-maintained and profitable.",
    },
    {
      title: "Real Estate Marketing",
      description: "Strategic marketing solutions to maximize property visibility and attract the right buyers or tenants.",
    },
    {
      title: "Tenant Placement Services",
      description: "Efficient tenant screening and placement to ensure reliable occupancy for property owners.",
    },
    {
      title: "Property Advisory & Consultancy",
      description: "Expert advice and consultancy services to help you make informed real estate decisions.",
    },
  ];

  const coreValues = [
    "Integrity",
    "Professionalism",
    "Customer Focus",
    "Innovation",
    "Efficiency"
  ];

  const whyChooseUs = [
    "Experienced and reliable real estate professionals",
    "Transparent and client-focused processes",
    "Strong understanding of the Kenyan property market",
    "Quick turnaround time for securing tenants and buyers",
    "Personalized solutions that fit your needs"
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
            MIIZA REALTORS LIMITED
          </h2>
          <p className="text-xl sm:text-2xl text-blue-700 dark:text-blue-400 font-semibold mb-4">
            Your property, our priority.
          </p>
        </motion.div>

        {/* About Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">About Us</h3>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Miiza Realtors Limited is a professional real estate company established on the 1st of October, 2022. 
            We at Miiza Realtors Limited provide reliable, innovative property solutions tailored to the growing needs 
            of residential and commercial clients across Kenya. Our focus is on delivering quality service through 
            transparency, professionalism, and a client-first approach.
          </p>
        </motion.div>

        {/* Our Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-foreground">Our Services</h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-card p-6 sm:p-8 rounded-lg border-l-4 border-blue-600 hover:shadow-lg transition-all duration-300"
              >
                <h4 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">{service.title}</h4>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-6 sm:p-8 rounded-xl"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">Our Mission</h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              To deliver trustworthy and value-driven real estate services that ensure client satisfaction and long-term partnerships.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-6 sm:p-8 rounded-xl"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">Our Vision</h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              To become a leading and trusted real estate company in the region, committed to excellence and modern real estate solutions.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-foreground">Our Core Values</h3>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold"
              >
                {value}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-foreground">Why Choose Us</h3>
          <div className="space-y-3 sm:space-y-4">
            {whyChooseUs.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-3 bg-card p-4 rounded-lg border-l-4 border-green-500"
              >
                <span className="text-green-600 font-bold text-lg mt-0.5">✓</span>
                <p className="text-base sm:text-lg text-muted-foreground flex-1">{point}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
              onClick={() => navigate('/properties')}
            >
              Explore Our Properties
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-blue-600 w-full sm:w-auto"
              onClick={() => navigate('/faq')}
            >
              FAQ
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;