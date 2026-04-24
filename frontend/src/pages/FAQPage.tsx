import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqData = [
    {
      question: "What real estate services do you offer in Nairobi?",
      answer: "At Miiza Realtors, we provide comprehensive Real Estate in Nairobi services including property sales, rentals, serviced apartments, and property management. Our team helps clients find the right residential or commercial property while helping property owners manage and market their investments effectively."
    },
    {
      question: "Do you help clients find property for rent in Nairobi?",
      answer: "Yes. Miiza Realtors specializes in helping clients find Property for Rent in Nairobi, including apartments, houses, serviced apartments, and commercial spaces. We work closely with clients to match them with properties that fit their budget, preferred location, and lifestyle."
    },
    {
      question: "What types of Nairobi real estate properties do you list?",
      answer: "Our Nairobi Real Estate listings include apartments, family homes, serviced apartments, commercial properties, and investment properties located in various neighborhoods across Nairobi."
    },
    {
      question: "Can Miiza Realtors help me sell my property in Nairobi?",
      answer: "Yes. Miiza Realtors helps property owners sell their Nairobi Real Estate through professional listings, market analysis, and targeted marketing strategies that connect sellers with qualified buyers."
    },
    {
      question: "Do you provide property management services for real estate in Nairobi?",
      answer: "Yes. Our property management services cover tenant sourcing, rent collection, maintenance coordination, and property oversight for owners with Real Estate in Nairobi who want reliable management support."
    },
    {
      question: "How can I list my property with Miiza Realtors?",
      answer: "If you own Real Estate in Nairobi and want to rent or sell it, you can contact Miiza Realtors through our website or phone. Our team will guide you through the listing process and help market your property to the right audience."
    },
    {
      question: "Do you offer serviced apartments as property for rent in Nairobi?",
      answer: "Yes. Miiza Realtors offers serviced apartments and furnished homes as Property for Rent in Nairobi, suitable for short-term stays, business travelers, and long-term residents."
    },
    {
      question: "Why choose Miiza Realtors for Nairobi real estate?",
      answer: "Miiza Realtors is committed to providing professional and transparent Nairobi Real Estate services. We help clients find the best Property for Rent in Nairobi, buy homes, sell properties, and manage investments with expert guidance."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about Nairobi Real Estate
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: openItems.includes(index) ? "auto" : 0,
                    opacity: openItems.includes(index) ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;

