import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { pagesApi, type Page } from '@/services/api';

import { DASHBOARD_API_BASE_URL, BACKEND_BASE_URL } from '../../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

export const ManagePages: React.FC = () => {
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
        setPages(data);
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

  const getPageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      careers: 'Careers',
      articles: 'Articles & News',
      legal: 'Legal Notice',
      help_center: 'Help Center',
      faq: 'FAQ',
      forum: 'Forum',
      custom: 'Custom',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Pages</h1>
          <p className="text-gray-600 mt-1">Create and manage website pages</p>
        </div>
        <button
          onClick={() => navigate('/admin/pages/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Page
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No pages found. Create your first page to get started.</p>
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                    {page.excerpt && (
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {page.excerpt}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPageTypeLabel(page.page_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    /{page.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {page.is_published ? (
                      <span className="flex items-center text-green-600">
                        <Eye className="w-4 h-4 mr-1" />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-400">
                        <EyeOff className="w-4 h-4 mr-1" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 p-2"
                        title="View page"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 p-2"
                        title="Edit page"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:text-red-900 p-2"
                        title="Delete page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can also manage pages from{' '}
          <a
            href={`${BACKEND_BASE_URL}/admin/pages/page/`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            Django Admin
          </a>
          {' '}for more advanced editing options.
        </p>
      </div>
    </div>
  );
};

