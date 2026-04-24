import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Filter, 
  TrendingUp, 
  Home, 
  Building, 
  Key, 
  DollarSign,
  ArrowRight,
  Star
} from "lucide-react";

const PropertyNavigation = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Search Properties",
      description: "Find your perfect home with advanced filters",
      icon: Search,
      action: () => navigate("/properties"),
      color: "from-blue-500 to-blue-600",
      badge: "Popular"
    },
    {
      title: "View by Location",
      description: "Browse properties by area and neighborhood",
      icon: MapPin,
      action: () => navigate("/properties?view=map"),
      color: "from-green-500 to-green-600",
      badge: "Interactive"
    },
    {
      title: "For Rent",
      description: "Explore rental properties available now",
      icon: Key,
      action: () => navigate("/properties/rent"),
      color: "from-purple-500 to-purple-600",
      badge: "New"
    },
    {
      title: "For Sale",
      description: "Discover properties for purchase",
      icon: Home,
      action: () => navigate("/properties/buy"),
      color: "from-orange-500 to-orange-600",
      badge: "Hot"
    }
  ];

  const propertyTypes = [
    {
      name: "Apartments",
      count: "120+",
      icon: Building,
      filter: "apartment",
      color: "bg-blue-100 text-blue-700"
    },
    {
      name: "Houses",
      count: "85+",
      icon: Home,
      filter: "house",
      color: "bg-green-100 text-green-700"
    },
    {
      name: "Villas",
      count: "45+",
      icon: Star,
      filter: "villa",
      color: "bg-purple-100 text-purple-700"
    },
    {
      name: "Commercial",
      count: "30+",
      icon: Building,
      filter: "commercial",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  const priceRanges = [
    {
      range: "Under 10M",
      description: "Affordable options",
      action: () => navigate("/properties?max_price=10000000")
    },
    {
      range: "10M - 25M",
      description: "Mid-range properties",
      action: () => navigate("/properties?min_price=10000000&max_price=25000000")
    },
    {
      range: "25M - 50M",
      description: "Premium properties",
      action: () => navigate("/properties?min_price=25000000&max_price=50000000")
    },
    {
      range: "50M+",
      description: "Luxury properties",
      action: () => navigate("/properties?min_price=50000000")
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Find Properties Your Way
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Multiple ways to discover your perfect property. Filter by location, price, type, or browse our curated collections.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className="p-6 h-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 cursor-pointer group hover:shadow-lg"
                  onClick={action.action}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {action.badge && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Property Types */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Browse by Property Type
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {propertyTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card
                    className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group border-2 hover:border-blue-200"
                    onClick={() => navigate(`/properties?property_type=${type.filter}`)}
                  >
                    <div className={`w-16 h-16 mx-auto rounded-full ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {type.count} available
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Price Ranges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Shop by Budget
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {priceRanges.map((range, index) => (
              <motion.div
                key={range.range}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 group border-2"
                  onClick={range.action}
                >
                  <DollarSign className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {range.range}
                  </span>
                  <span className="text-xs text-gray-600">
                    {range.description}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertyNavigation;