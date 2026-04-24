import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from "@/services/api";
import { Home, MapPin, TrendingUp, Users, Clock, Star } from "lucide-react";

const PropertyStats = () => {
  // Fetch properties to calculate stats
  const { data: allProperties = [] } = useQuery({
    queryKey: ['all', 'properties'],
    queryFn: () => propertiesApi.getAll({ limit: 1000 }), // Get all to count
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: featuredProperties = [] } = useQuery({
    queryKey: ['featured', 'count'],
    queryFn: () => propertiesApi.getFeatured(),
    staleTime: 10 * 60 * 1000,
  });

  // Calculate stats
  const totalProperties = allProperties.length;
  const forRent = allProperties.filter(p => p.is_for_rent).length;
  const forSale = allProperties.filter(p => p.is_for_sale).length;
  const featured = featuredProperties.length;
  const locations = [...new Set(allProperties.map(p => p.city).filter(Boolean))].length;

  const stats = [
    {
      icon: Home,
      value: totalProperties.toLocaleString(),
      label: "Total Properties",
      color: "from-blue-500 to-blue-600",
      description: "Available listings"
    },
    {
      icon: MapPin,
      value: locations.toString(),
      label: "Locations",
      color: "from-green-500 to-green-600",
      description: "Cities covered"
    },
    {
      icon: Star,
      value: featured.toString(),
      label: "Featured Properties",
      color: "from-purple-500 to-purple-600",
      description: "Premium selections"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Success Rate",
      color: "from-orange-500 to-orange-600",
      description: "Client satisfaction"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Support",
      color: "from-teal-500 to-teal-600",
      description: "Always available"
    },
    {
      icon: Users,
      value: "500+",
      label: "Happy Clients",
      color: "from-pink-500 to-pink-600",
      description: "Satisfied customers"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Choose MiiZA Realtors?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Your trusted partner in real estate with proven track record and comprehensive services
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  
                  <div className="text-white font-semibold mb-1">
                    {stat.label}
                  </div>
                  
                  <div className="text-blue-100 text-sm">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Find Your Dream Property?
            </h3>
            <p className="text-blue-100 mb-6">
              Join hundreds of satisfied clients who found their perfect home with MiiZA Realtors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg"
                onClick={() => window.location.href = '/properties'}
              >
                Browse Properties
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 text-white border-2 border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Agent
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertyStats;