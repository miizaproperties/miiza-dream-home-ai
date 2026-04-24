import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
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

export const AddArticle: React.FC = () => {
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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
      }

      const response = await fetch(`${API_BASE_URL}/articles/create/`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Article created successfully');
        navigate('/admin/articles');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create article');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Article</h1>
          <p className="text-gray-600 mt-1">Create a new article for the news section</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/articles')}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
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
          <Input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="cursor-pointer"
          />
          {thumbnailPreview && (
            <div className="mt-2">
              <img
                src={thumbnailPreview}
                alt="Preview"
                className="max-w-full h-48 object-contain rounded-lg border border-gray-300"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setThumbnailPreview(null);
                  setFormData(prev => ({ ...prev, thumbnail: null }));
                }}
              >
                Remove Image
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
            {isSubmitting ? 'Creating...' : 'Create Article'}
          </Button>
        </div>
      </form>
    </div>
  );
};

