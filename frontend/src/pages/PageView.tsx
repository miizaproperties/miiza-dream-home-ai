import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { pagesApi, type Page } from "@/services/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const pageData = await pagesApi.getBySlug(slug);
        setPage(pageData);
      } catch (error) {
        console.error("Error fetching page:", error);
        toast.error("Failed to load page. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading page...</p>
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
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
            {page.excerpt && (
              <p className="text-xl text-gray-600 mb-4">{page.excerpt}</p>
            )}
            <div className="text-sm text-gray-500">
              Last updated: {new Date(page.updated_at).toLocaleDateString()}
            </div>
          </div>

          {/* Page Content */}
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

export default PageView;

