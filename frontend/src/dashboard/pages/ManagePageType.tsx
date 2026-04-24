import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { DASHBOARD_API_BASE_URL } from '../../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

interface Page {
  id: number;
  title: string;
  slug: string;
  page_type: string;
  is_published: boolean;
  content: string;
}

interface ManagePageTypeProps {
  pageType: string;
  title: string;
  icon: LucideIcon;
  description?: string;
}

export const ManagePageType: React.FC<ManagePageTypeProps> = ({ 
  pageType, 
  title, 
  icon: Icon,
  description = `Manage ${title.toLowerCase()} pages`
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/pages/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filter for specific page type
        const filteredPages = data.filter((page: Page) => page.page_type === pageType);
        setPages(filteredPages);
      } else {
        toast.error('Failed to load pages');
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/pages/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Page deleted successfully');
        fetchPages();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete page');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading {title.toLowerCase()} pages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        <button
          onClick={() => navigate(`/admin/pages/add?type=${pageType}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No {title.toLowerCase()} pages found</p>
          <button
            onClick={() => navigate(`/admin/pages/add?type=${pageType}`)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Create your first {title.toLowerCase()} page
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{page.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {page.is_published ? (
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
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

