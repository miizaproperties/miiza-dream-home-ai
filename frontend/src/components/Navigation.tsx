import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AnnouncementBanner } from "./AnnouncementBanner";

type NavLink = {
  name: string;
  path: string;
};

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu and services dropdown when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsPropertiesOpen(false);
  }, [location.pathname]);

  const navLinks: NavLink[] = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Properties", path: "/properties" },
    { name: "Contact", path: "/contact" },
  ];

  const propertiesDropdownLinks = [
    { name: "Buy", path: "/properties/buy" },
    { name: "Sell", path: "/properties/sell" },
    { name: "Rent", path: "/properties/rent" },
  ];

  const servicesLinks = [
    { name: "Property Sales & Purchases", path: "/services/sales" },
    { name: "Property Rentals & Leasing", path: "/services/rentals" },
    { name: "Serviced Property Management", path: "/services/management" },
    { name: "Real Estate Marketing", path: "/services/marketing" },
    { name: "Tenant Placement Services", path: "/services/tenant-placement" },
    { name: "Property Advisory & Consultancy", path: "/services/advisory" },
  ];

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsPropertiesOpen(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== "/"
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          : "bg-white/90 dark:bg-gray-900/90"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px]">
        <div className="flex h-full items-center justify-between gap-2">
          <Link to="/" onClick={handleLogoClick} className="flex h-full items-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="MIIZA REALTORS"
              className={`h-10 w-auto transition-all object-contain ${
                location.pathname === "/" 
                  ? "sm:h-11" 
                  : "sm:h-10"
              }`}
              style={{ maxWidth: "120px" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 flex-1 justify-center max-w-5xl mx-auto px-4">
            {/* Home */}
            {navLinks
              .filter((link) => link.name === "Home")
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-0 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    location.pathname === link.path
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

            {/* About Us */}
            {navLinks
              .filter((link) => link.name === "About Us")
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-0 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    location.pathname === link.path
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className={`flex items-center px-4 py-0 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  isServicesOpen || location.pathname.startsWith("/services")
                    ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Services
              </button>
              
              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50 overflow-hidden"
                  >
                    <div className="py-1">
                      {servicesLinks.map((service, index) => (
                        <motion.div
                          key={service.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                        >
                          <Link
                            to={service.path}
                            className="block px-5 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 border-l-2 border-transparent hover:border-blue-600 dark:hover:border-blue-400"
                            onClick={() => setIsServicesOpen(false)}
                          >
                            {service.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Properties Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsPropertiesOpen(true)}
              onMouseLeave={() => setIsPropertiesOpen(false)}
            >
              <Link
                to="/properties"
                className={`flex items-center px-4 py-0 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  isPropertiesOpen || location.pathname.startsWith("/properties")
                    ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Properties
              </Link>

              <AnimatePresence>
                {isPropertiesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50 overflow-hidden"
                  >
                    <div className="py-1">
                      {propertiesDropdownLinks.map((item, index) => (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                        >
                          <Link
                            to={item.path}
                            className="block px-5 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 border-l-2 border-transparent hover:border-blue-600 dark:hover:border-blue-400"
                            onClick={() => setIsPropertiesOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact Link */}
            {navLinks
              .filter((link) => link.name === "Contact")
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-0 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    location.pathname === link.path
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-0.5 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-2 pb-3 border-t border-gray-200 dark:border-gray-700"
            >
            <div className="pt-3 space-y-1">
              {/* Home */}
              {navLinks
                .filter((link) => link.name === "Home")
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-2 rounded-lg text-base font-semibold transition-all ${
                      location.pathname === link.path
                        ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
              ))}

              {/* About Us */}
              {navLinks
                .filter((link) => link.name === "About Us")
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-2 rounded-lg text-base font-semibold transition-all ${
                      location.pathname === link.path
                        ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
              ))}
              
              {/* Services Mobile */}
              <div className="px-4 py-2">
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`w-full text-left text-base font-semibold px-4 py-2 rounded-lg transition-all ${
                    isServicesOpen || location.pathname.startsWith("/services")
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Services
                </button>
                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pl-4 space-y-1">
                        {servicesLinks.map((service, index) => (
                          <motion.div
                            key={service.path}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                          >
                            <Link
                              to={service.path}
                              className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-all duration-200 border-l-2 border-transparent hover:border-blue-600 dark:hover:border-blue-400"
                              onClick={() => setIsServicesOpen(false)}
                            >
                              {service.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Properties Mobile */}
              <div className="px-4 py-2">
                <div className="flex items-center justify-between">
                  <Link
                    to="/properties"
                    className={`flex-1 text-left text-base font-semibold px-4 py-2 rounded-lg transition-all ${
                      location.pathname === "/properties"
                        ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    Properties
                  </Link>
                  <button
                    onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
                    className={`px-2 py-2 rounded-lg transition-all ${
                      isPropertiesOpen || location.pathname.startsWith("/properties/")
                        ? "text-blue-700 dark:text-blue-400"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                    aria-label="Toggle properties menu"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isPropertiesOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <AnimatePresence>
                  {isPropertiesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pl-4 space-y-1">
                        {propertiesDropdownLinks.map((item, index) => (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                          >
                            <Link
                              to={item.path}
                              className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-all duration-200 border-l-2 border-transparent hover:border-blue-600 dark:hover:border-blue-400"
                              onClick={() => setIsPropertiesOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Mobile */}
              {navLinks
                .filter((link) => link.name === "Contact")
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-2 rounded-lg text-base font-semibold transition-all ${
                      location.pathname === link.path
                        ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
              ))}
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
    {/* Global offset so page content starts below fixed nav/banner */}
    {!isAdminRoute ? <div className="h-[70px]" /> : <div className="h-[70px]" />}
    {!isAdminRoute && <AnnouncementBanner />}
    </>
  );
};

export default Navigation;