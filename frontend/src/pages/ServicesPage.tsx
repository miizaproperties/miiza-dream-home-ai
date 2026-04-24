import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Building,
  Home,
  Key,
  TrendingUp,
  Users,
  MessageCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const ServicesPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Property Sales & Purchases",
      description: "Expert guidance through buying and selling properties with competitive rates and professional support.",
      icon: Building,
      features: [
        "Market valuation services",
        "Property inspections",
        "Legal documentation assistance",
        "Negotiation support"
      ],
      link: "/services/sales"
    },
    {
      title: "Property Rentals & Leasing",
      description: "Complete rental solutions for landlords and tenants with transparent processes and reliable service.",
      icon: Key,
      features: [
        "Tenant screening",
        "Rental price optimization",
        "Property marketing",
        "Lease agreement preparation"
      ],
      link: "/services/rentals"
    },
    {
      title: "Property Management",
      description: "Full-service property management to maximize your investment returns and minimize your stress.",
      icon: Home,
      features: [
        "Maintenance coordination",
        "Rent collection",
        "Financial reporting",
        "24/7 emergency support"
      ],
      link: "/services/management"
    },
    {
      title: "Real Estate Marketing",
      description: "Strategic marketing solutions to showcase your property and reach the right buyers quickly.",
      icon: TrendingUp,
      features: [
        "Professional photography",
        "Digital marketing campaigns",
        "Social media promotion",
        "Virtual tours"
      ],
      link: "/services/marketing"
    },
    {
      title: "Tenant Placement",
      description: "Efficient tenant placement services ensuring quality tenants for your rental properties.",
      icon: Users,
      features: [
        "Background verification",
        "Income verification",
        "Reference checks",
        "Contract management"
      ],
      link: "/services/tenant-placement"
    },
    {
      title: "Property Advisory",
      description: "Professional consultation services to help you make informed real estate investment decisions.",
      icon: MessageCircle,
      features: [
        "Investment analysis",
        "Market research",
        "Portfolio planning",
        "Risk assessment"
      ],
      link: "/services/advisory"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Our Real Estate Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8"
            >
              Comprehensive real estate solutions tailored to meet your property needs.
              From sales to management, we've got you covered.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => navigate("/contact")}
              >
                Get Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => navigate("/properties")}
              >
                Browse Properties
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Icon className="h-6 w-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {service.description}
                        </p>
                      </div>
                      
                      <div className="flex-1">
                        <ul className="space-y-2 mb-6">
                          {service.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button
                        className="w-full mt-auto"
                        onClick={() => navigate(service.link)}
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Contact our expert team today for a free consultation and discover how we can help with your real estate needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/contact")}
              >
                Contact Us Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = "tel:+254717334422"}
              >
                Call: +254-717-334-422
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;