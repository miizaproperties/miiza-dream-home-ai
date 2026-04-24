import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { contactsApi } from "@/services/api";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contactsApi.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyType: formData.propertyType,
        message: formData.message,
      });
      
      toast.success("Thank you! We'll contact you soon.");
      setFormData({ name: "", email: "", phone: "", propertyType: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-primary text-primary-foreground p-6 sm:p-8 lg:p-12"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Let's Find Your Perfect Space</h2>
              <p className="text-primary-foreground/90 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                We're here to help you find your ideal property. Whether you're looking to rent, buy, 
                or just have questions, our team is ready to assist you.
              </p>
              
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Call Us</h3>
                  <a href="tel:+254717334422" className="text-primary-foreground/80 hover:text-white transition-colors text-sm sm:text-base">
                    +254-717-334-422
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Email Us</h3>
                  <a href="mailto:info@miizarealtors.com" className="text-primary-foreground/80 hover:text-white transition-colors text-sm sm:text-base break-all">
                    info@miizarealtors.com
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Location</h3>
                  <p className="text-primary-foreground/80 text-sm sm:text-base">Kilimani, Nairobi, Kenya</p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Website</h3>
                  <a href="https://www.miizarealtors.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-white transition-colors text-sm sm:text-base break-all">
                    www.miizarealtors.com
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-6 sm:p-8 lg:p-12"
            >
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Get In Touch</h2>
                <p className="text-muted-foreground text-sm sm:text-base">We'll get back to you within 24 hours</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="propertyType" className="text-sm font-medium">I'm interested in</Label>
                  <select
                    id="propertyType"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select property type</option>
                    <option value="residential-rent">Residential - Rent</option>
                    <option value="residential-buy">Residential - Buy</option>
                    <option value="commercial-rent">Commercial - Rent</option>
                    <option value="commercial-buy">Commercial - Buy</option>
                    <option value="office-space">Office Space</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="message" className="text-sm font-medium">How can we help you?</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your requirements, preferred locations, budget, and any specific needs..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
