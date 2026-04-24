import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { testimonialsApi, type Testimonial } from "@/services/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS_PER_SLIDE = 4;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialsApi.getAll();
      console.log('Testimonials fetched:', data);
      setTestimonials(data);
      if (data.length > 0) {
        setCurrentSlide(0);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]); // Ensure testimonials is set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Calculate number of slides
  const totalSlides = Math.ceil(testimonials.length / TESTIMONIALS_PER_SLIDE);

  // Get testimonials for current slide
  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * TESTIMONIALS_PER_SLIDE;
    const endIndex = startIndex + TESTIMONIALS_PER_SLIDE;
    return testimonials.slice(startIndex, endIndex);
  };

  const next = () => {
    if (totalSlides > 0) {
      setCurrentSlide((currentSlide + 1) % totalSlides);
    }
  };
  
  const prev = () => {
    if (totalSlides > 0) {
      setCurrentSlide((currentSlide - 1 + totalSlides) % totalSlides);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground">
            Real experiences from real people
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto relative">
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-accent hover:bg-accent/90 text-white rounded-full p-2 md:p-3 shadow-lg transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-accent hover:bg-accent/90 text-white rounded-full p-2 md:p-3 shadow-lg transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getCurrentTestimonials().map((testimonial, index) => (
                  <Card key={testimonial.id || index} className="p-6 shadow-card h-full flex flex-col">
                    <div className="text-center flex-1 flex flex-col">
                      {/* Profile Photo */}
                      {testimonial.image && (
                        <motion.img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        />
                      )}
                      
                      {/* Name */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.1 }}
                        className="font-bold text-lg text-foreground mb-1"
                      >
                        {testimonial.name}
                      </motion.p>
                      
                      {/* Position/Role */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="text-sm text-muted-foreground mb-1"
                      >
                        {testimonial.role}
                      </motion.p>
                      
                      {/* Company */}
                      {testimonial.company && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="text-xs text-muted-foreground mb-4"
                        >
                          {testimonial.company}
                        </motion.p>
                      )}
                      
                      {/* Testimonial Content */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                        className="text-sm md:text-base text-center text-foreground leading-relaxed flex-1"
                      >
                        "{testimonial.content}"
                      </motion.p>

                      {/* Rating Stars */}
                      {testimonial.rating && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className="flex justify-center gap-1 mt-4"
                        >
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < (testimonial.rating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-8 bg-accent"
                      : "w-2 bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
