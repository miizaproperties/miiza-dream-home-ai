import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { DASHBOARD_API_BASE_URL } from '../../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  category: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  thumbnail?: string | null;
}

export const ManageArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/articles/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        toast.error('Failed to load articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Article deleted successfully');
        fetchArticles();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete article');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      business: 'Business',
      tech: 'Tech',
      real_estate: 'Real Estate',
      updates: 'Updates',
      market_analysis: 'Market Analysis',
      investment: 'Investment',
      lifestyle: 'Lifestyle',
      other: 'Other',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Article & News</h1>
          <p className="text-gray-600">Manage articles and news</p>
        </div>
        <button
          onClick={() => navigate('/admin/articles/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Article
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No articles found</p>
          <button
            onClick={() => navigate('/admin/articles/add')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Create your first article
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    {article.excerpt && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">{article.excerpt}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{article.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryLabel(article.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.published ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
