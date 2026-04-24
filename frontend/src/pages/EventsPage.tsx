import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { eventsApi, type Event } from "@/services/api";
import { Loader2, Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await eventsApi.getAll();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    // Handle both HH:MM:SS and HH:MM formats
    const time = timeString.split(':');
    if (time.length >= 2) {
      const hours = parseInt(time[0]);
      const minutes = time[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Events...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Calendar className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Events
            </h1>
            <p className="text-xl text-gray-600">
              Join us for exciting events and activities
            </p>
          </motion.div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Events Available</h2>
              <p className="text-gray-600">Check back soon for upcoming events.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.featured_image_url && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={event.featured_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {event.title}
                    </h2>
                    {event.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTime(event.event_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    {event.location_url && (
                      <a
                        href={event.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Location
                      </a>
                    )}
                    {(event.contact_email || event.contact_phone) && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Contact:</p>
                        {event.contact_email && (
                          <p className="text-sm text-gray-700">
                            <a href={`mailto:${event.contact_email}`} className="hover:text-blue-600">
                              {event.contact_email}
                            </a>
                          </p>
                        )}
                        {event.contact_phone && (
                          <p className="text-sm text-gray-700">
                            <a href={`tel:${event.contact_phone}`} className="hover:text-blue-600">
                              {event.contact_phone}
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                    {event.registration_url && (
                      <div className="mt-4">
                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Register Now
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;

