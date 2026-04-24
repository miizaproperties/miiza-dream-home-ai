import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { articlesApi, type Article } from "@/services/api";
import { Loader2, Calendar, User, Tag, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CATEGORIES = [
  { value: 'business', label: 'Business' },
  { value: 'tech', label: 'Tech' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'updates', label: 'Updates' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'investment', label: 'Investment' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'other', label: 'Other' },
];

const containsHtml = (content: string): boolean => /<\/?[a-z][\s\S]*>/i.test(content);

const SingleArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const articleData = await articlesApi.getBySlug(slug!);
      setArticle(articleData);
      
      // Fetch related articles
      if (articleData.category) {
        try {
          const related = await articlesApi.getAll({
            category: articleData.category,
            page_size: 4,
          });
          // Filter out current article
          const filtered = related.results.filter(a => a.id !== articleData.id).slice(0, 3);
          setRelatedArticles(filtered);
        } catch (error) {
          console.error("Error fetching related articles:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Failed to load article. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/articles" className="text-blue-600 hover:text-blue-700">
            ← Back to Articles
          </Link>
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
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Articles
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {CATEGORIES.find(c => c.value === article.category)?.label || article.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
              {article.thumbnail && (
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-96 object-cover rounded-lg mb-8"
                />
              )}
            </div>

            {/* Article Content */}
            {containsHtml(article.content) ? (
              <div
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  lineHeight: '1.8',
                  color: '#374151',
                }}
              />
            ) : (
              <div
                className="prose prose-lg max-w-none mb-12 whitespace-pre-wrap break-words"
                style={{
                  lineHeight: '1.8',
                  color: '#374151',
                }}
              >
                {article.content}
              </div>
            )}

            {/* Tags */}
            {article.tags_list && article.tags_list.length > 0 && (
              <div className="flex items-center gap-2 mb-12 flex-wrap">
                <Tag className="h-5 w-5 text-gray-400" />
                {article.tags_list.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 pt-12 border-t border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    to={`/articles/${relatedArticle.slug}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {relatedArticle.thumbnail && (
                      <img
                        src={relatedArticle.thumbnail}
                        alt={relatedArticle.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SingleArticle;



















