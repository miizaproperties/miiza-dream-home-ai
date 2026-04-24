import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { pagesApi, type Page } from "@/services/api";
import { Loader2, Newspaper } from "lucide-react";
import { toast } from "sonner";

const ArticlesPage = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const pages = await pagesApi.getByType('articles');
        if (pages.length > 0) {
          setPage(pages[0]);
        }
      } catch (error) {
        console.error("Error fetching articles page:", error);
        toast.error("Failed to load articles page. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading articles...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Articles & News</h1>
          <p className="text-gray-600 mb-8">No content available at this time.</p>
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
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
            {page.excerpt && (
              <p className="text-xl text-gray-600 mb-4">{page.excerpt}</p>
            )}
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
            style={{
              lineHeight: '1.8',
              color: '#374151',
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlesPage;

