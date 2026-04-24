import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { DASHBOARD_API_BASE_URL } from '../../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

interface ArticleFormData {
  title: string;
  author: string;
  category: string;
  content: string;
  excerpt: string;
  tags: string;
  published: boolean;
  thumbnail?: File | null;
  thumbnail_url?: string | null;
}

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

export const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    author: '',
    category: 'other',
    content: '',
    excerpt: '',
    tags: '',
    published: true,
    thumbnail: null,
    thumbnail_url: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/articles/${id}/`, {
        credentials: 'include',
      });

      if (response.ok) {
        const article = await response.json();
        setFormData({
          title: article.title || '',
          author: article.author || '',
          category: article.category || 'other',
          content: article.content || '',
          excerpt: article.excerpt || '',
          tags: article.tags || '',
          published: article.published ?? true,
          thumbnail: null,
          thumbnail_url: article.thumbnail || null,
        });
        if (article.thumbnail) {
          setThumbnailPreview(article.thumbnail);
        }
      } else {
        toast.error('Failed to load article');
        navigate('/admin/articles');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Network error. Please try again.');
      navigate('/admin/articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ArticleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('published', formData.published ? 'true' : 'false');
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      } else if (!formData.thumbnail_url) {
        // If no thumbnail and no existing thumbnail, send empty string to remove it
        formDataToSend.append('thumbnail', '');
      }

      const response = await fetch(`${API_BASE_URL}/articles/${id}/update/`, {
        method: 'PATCH',
        credentials: 'include',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Article updated successfully');
        navigate('/admin/articles');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update article');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-1">Update article details</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/articles')}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="Article title"
            />
          </div>

          <div>
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              required
              placeholder="Author name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Comma-separated tags"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas (e.g., real estate, investment, nairobi)</p>
          </div>
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            required
            placeholder="Short description for previews"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/500 characters</p>
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            required
            placeholder="Article content (HTML supported)"
            rows={12}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">HTML content is supported</p>
        </div>

        <div>
          <Label htmlFor="thumbnail">Thumbnail Image</Label>
          {thumbnailPreview && !formData.thumbnail && formData.thumbnail_url && (
            <div className="mb-2">
              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
              <img
                src={thumbnailPreview}
                alt="Current thumbnail"
                className="max-w-full h-48 object-contain rounded-lg border border-gray-300"
              />
            </div>
          )}
          <Input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="cursor-pointer"
          />
          {formData.thumbnail && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
              <img
                src={thumbnailPreview || ''}
                alt="Preview"
                className="max-w-full h-48 object-contain rounded-lg border border-gray-300"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setThumbnailPreview(formData.thumbnail_url || null);
                  setFormData(prev => ({ ...prev, thumbnail: null }));
                }}
              >
                Cancel Change
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => handleChange('published', checked)}
          />
          <Label htmlFor="published" className="cursor-pointer">
            Publish immediately
          </Label>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/articles')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Updating...' : 'Update Article'}
          </Button>
        </div>
      </form>
    </div>
  );
};

