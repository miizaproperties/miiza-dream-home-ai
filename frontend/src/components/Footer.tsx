import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

const Footer = () => {

  return (
    <footer className="relative bg-gray-900 text-white pt-12 sm:pt-16 pb-6 sm:pb-8 overflow-hidden">
      {/* Building Outline Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Building 1 */}
          <rect x="50" y="150" width="80" height="200" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="60" y="200" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="100" y="200" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="60" y="250" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="100" y="250" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="60" y="300" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="100" y="300" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 2 */}
          <rect x="180" y="100" width="100" height="250" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="195" y="150" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="230" y="150" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="265" y="150" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="195" y="200" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="230" y="200" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="265" y="200" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="195" y="250" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="230" y="250" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="265" y="250" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 3 */}
          <rect x="330" y="180" width="70" height="170" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="340" y="220" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="370" y="220" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="340" y="260" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="370" y="260" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="340" y="300" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="370" y="300" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 4 */}
          <rect x="450" y="120" width="90" height="230" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="465" y="160" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="500" y="160" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="535" y="160" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="465" y="210" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="500" y="210" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="535" y="210" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="465" y="260" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="500" y="260" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="535" y="260" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 5 */}
          <rect x="590" y="200" width="60" height="150" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="600" y="230" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="625" y="230" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="600" y="270" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="625" y="270" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="600" y="310" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="625" y="310" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 6 */}
          <rect x="700" y="90" width="110" height="260" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="720" y="130" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="760" y="130" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="800" y="130" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="720" y="180" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="760" y="180" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="800" y="180" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="720" y="230" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="760" y="230" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="800" y="230" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="720" y="280" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="760" y="280" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="800" y="280" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 7 */}
          <rect x="860" y="160" width="75" height="190" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="875" y="200" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="905" y="200" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="875" y="250" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="905" y="250" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="875" y="300" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="905" y="300" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 8 */}
          <rect x="980" y="110" width="85" height="240" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="995" y="150" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1030" y="150" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="995" y="200" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1030" y="200" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="995" y="250" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1030" y="250" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="995" y="300" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1030" y="300" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Building 9 */}
          <rect x="1110" y="180" width="70" height="170" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="1125" y="220" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1155" y="220" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1125" y="270" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1155" y="270" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1125" y="320" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1155" y="320" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12"
        >
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <img 
              src="/Miiza-04.png" 
              alt="MIIZA REALTORS" 
              className="h-16 sm:h-24 w-auto mb-4 object-contain" 
            />
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-4 sm:mb-6 max-w-md leading-relaxed">
              MIIZA REALTORS LIMITED - Your property, our priority. A professional real estate company established in October 2022, providing reliable, innovative property solutions across Kenya.
            </p>
            <div className="flex gap-4 sm:gap-6 items-center">
              <a 
                href="https://www.facebook.com/p/Miiza-Realtors-LTD-61572617468204/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="https://x.com/Miizarealtors" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="https://www.instagram.com/miizarealtorsltd?igsh=cTJha2VzOWVxZ3Ji" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/company/miiza-realtors-ltd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@miizarealtorsltd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">Support</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Article & News
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Legal Notice
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div>
            <h3 className="text-orange-500 text-sm sm:text-base font-semibold mb-2 sm:mb-3 uppercase tracking-wide">Phone</h3>
            <a href="tel:+254717334422" className="text-white text-xl sm:text-2xl lg:text-3xl font-bold hover:text-orange-400 transition-colors block">
              +254-717-334-422
            </a>
          </div>
          <div>
            <h3 className="text-orange-500 text-sm sm:text-base font-semibold mb-2 sm:mb-3 uppercase tracking-wide">Email</h3>
            <a href="mailto:info@miizarealtors.com" className="text-white text-lg sm:text-xl lg:text-2xl font-bold hover:text-orange-400 transition-colors block break-all">
              info@miizarealtors.com
            </a>
          </div>
          <div>
            <h3 className="text-orange-500 text-sm sm:text-base font-semibold mb-2 sm:mb-3 uppercase tracking-wide">Location</h3>
            <p className="text-white text-base sm:text-lg font-semibold">
              Kilimani, Nairobi, Kenya
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            © {new Date().getFullYear()} MiiZA Realtors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;