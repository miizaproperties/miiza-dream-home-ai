import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import heroImage1 from "@/assets/hero-property-1.jpg";
import heroImage2 from "@/assets/hero-property-2.jpg";
import heroImage3 from "@/assets/hero-property-3.jpg";

// Static hero images
const heroImages = [heroImage1, heroImage2, heroImage3];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };


  return (
    <section id="home" className="relative h-[100vh] w-full overflow-hidden">
      <AnimatePresence custom={direction} initial={false}>
        {heroImages.map((image, index) => (
          index === currentSlide && (
            <motion.div
              key={`${index}-${image}`}
              custom={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.9, 
                ease: [0.43, 0.13, 0.23, 0.96] // Smooth custom easing
              }}
              className="absolute inset-0"
            >
              <motion.img
                src={image}
                alt={`Hero image ${index + 1}`}
                className="w-full h-full object-cover"
                initial={{ scale: 1.05, x: direction === 0 ? 0 : (direction > 0 ? 30 : -30) }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 1.05, x: direction > 0 ? -30 : 30 }}
                transition={{ 
                  duration: 1.1, 
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
                style={{ willChange: 'transform, opacity' }}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </motion.div>
          )
        ))}
      </AnimatePresence>

      <AnimatePresence custom={direction} initial={false}>
        {heroImages.map((_, index) => (
          index === currentSlide && (
            <motion.div
              key={`content-${index}`}
              custom={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.7, 
                ease: [0.43, 0.13, 0.23, 0.96],
                delay: 0.1
              }}
              className="relative z-10 h-full flex items-center justify-center"
            >
              <div className="container mx-auto px-4 sm:px-6 text-center text-primary-foreground">
                <motion.h1
                  key={`title-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
                >
                  Nairobi Real Estate Experts<br className="hidden sm:block" />
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Find Your Dream Property</span>
                </motion.h1>
                <motion.p
                  key={`desc-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                  Premium apartments, homes & rentals across Nairobi. Flexible leasing options with expert property management services.
                </motion.p>
                <motion.div
                  key={`button-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
                >
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 shadow-accent w-full sm:w-auto"
                    onClick={() => navigate('/properties')}
                  >
                    Explore Properties
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {heroImages.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-6 sm:w-8 bg-accent"
                  : "w-2 bg-primary-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
