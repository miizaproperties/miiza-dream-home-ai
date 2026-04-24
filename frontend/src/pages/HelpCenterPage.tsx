import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { pagesApi, type Page } from "@/services/api";
import { Loader2, BookOpen, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HelpCenterPage = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const fetchedPages = await pagesApi.getByType('help_center');
        // Filter only published pages
        const publishedPages = fetchedPages.filter(page => page.is_published);
        setPages(publishedPages);
      } catch (error) {
        console.error("Error fetching Help Center pages:", error);
        toast.error("Failed to load Help Center pages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Help Center...</p>
        </div>
        <Footer />
      </div>
    );
  }

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600">
              Get help and find resources to assist you
            </p>
          </motion.div>

          {pages.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Help Articles Available</h2>
              <p className="text-gray-600">Check back soon for help center articles.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <Link
                    to={`/page/${page.slug}`}
                    className="block group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {page.title}
                        </h2>
                        {page.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {page.excerpt}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 transition-colors ml-4 flex-shrink-0" />
                    </div>
                  </Link>
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

export default HelpCenterPage;

