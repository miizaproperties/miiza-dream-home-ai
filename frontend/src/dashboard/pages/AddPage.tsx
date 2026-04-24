import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { DASHBOARD_API_BASE_URL } from '../../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

interface PageFormData {
  title: string;
  slug: string;
  page_type: string;
  content: string;
  excerpt: string;
  is_published: boolean;
  order: number;
  // Articles & News fields
  author: string;
  author_email: string;
  tags: string;
  category: string;
  featured_image?: File | null;
  // Careers fields
  job_title: string;
  job_type: string;
  location: string;
  department: string;
  salary_range: string;
  application_email: string;
  application_url: string;
  application_deadline: string;
  // Legal Notice fields
  document_type: string;
  effective_date: string;
  expiry_date: string;
  // FAQ fields
  faq_items: Array<{ question: string; answer: string }>;
  // Help Center fields
  related_pages: number[];
  // Forum fields
  forum_category: string;
  allow_comments: boolean;
}

export const AddPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageType = searchParams.get('type') || 'custom';
  const isCareersPage = pageType === 'careers';
  
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    page_type: isCareersPage ? 'careers' : pageType,
    content: '',
    excerpt: '',
    is_published: isCareersPage ? true : true, // Always published for careers
    order: 0,
    author: '',
    author_email: '',
    tags: '',
    category: '',
    featured_image: null,
    job_title: '',
    job_type: '',
    location: '',
    department: '',
    salary_range: '',
    application_email: '',
    application_url: '',
    application_deadline: '',
    document_type: '',
    effective_date: '',
    expiry_date: '',
    faq_items: [],
    related_pages: [],
    forum_category: '',
    allow_comments: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);

  const handleChange = (field: keyof PageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && !formData.slug) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, featured_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFaqItem = () => {
    setFormData(prev => ({
      ...prev,
      faq_items: [...prev.faq_items, { question: '', answer: '' }]
    }));
  };

  const removeFaqItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq_items: prev.faq_items.filter((_, i) => i !== index)
    }));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      faq_items: prev.faq_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const hasFile = formData.featured_image !== null;
      let body: FormData | string;
      let headers: Record<string, string> = {};

      if (hasFile) {
        // Use FormData for file upload
        const fd = new FormData();
        Object.keys(formData).forEach(key => {
          const value = formData[key as keyof PageFormData];
          if (key === 'featured_image') {
            if (value) fd.append('featured_image', value as File);
          } else if (key === 'faq_items') {
            fd.append('faq_items', JSON.stringify(value));
          } else if (key === 'related_pages') {
            (value as number[]).forEach(id => fd.append('related_pages', id.toString()));
          } else if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'boolean') {
              fd.append(key, value ? 'true' : 'false');
            } else {
              fd.append(key, String(value));
            }
          }
        });
        body = fd;
      } else {
        // Use JSON
        const jsonData: any = { ...formData };
        delete jsonData.featured_image;
        if (jsonData.faq_items.length === 0) {
          jsonData.faq_items = [];
        }
        body = JSON.stringify(jsonData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}/pages/create/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body,
      });

      if (response.ok) {
        toast.success('Page created successfully');
        navigate('/admin/pages');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create page');
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.page_type) {
      case 'articles':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label htmlFor="author_email">Author Email</Label>
                <Input
                  id="author_email"
                  type="email"
                  value={formData.author_email}
                  onChange={(e) => handleChange('author_email', e.target.value)}
                  placeholder="author@example.com"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="e.g., News, Updates, Insights"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="Comma-separated tags"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>
            <div>
              <Label htmlFor="featured_image">Featured Image</Label>
              <Input
                id="featured_image"
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageChange}
                className="cursor-pointer"
              />
              {featuredImagePreview && (
                <div className="mt-2">
                  <img
                    src={featuredImagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-contain rounded-lg border border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFeaturedImagePreview(null);
                      setFormData(prev => ({ ...prev, featured_image: null }));
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
          </>
        );

      case 'careers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleChange('job_title', e.target.value)}
                placeholder="e.g., Senior Real Estate Agent"
              />
            </div>
            <div>
              <Label htmlFor="job_type">Job Type</Label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => handleChange('job_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Nairobi, Kenya"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g., Sales, Marketing, Operations"
              />
            </div>
            <div>
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) => handleChange('salary_range', e.target.value)}
                placeholder="e.g., KES 50,000 - 100,000"
              />
            </div>
            <div>
              <Label htmlFor="application_email">Application Email</Label>
              <Input
                id="application_email"
                type="email"
                value={formData.application_email}
                onChange={(e) => handleChange('application_email', e.target.value)}
                placeholder="careers@miizarealtors.com"
              />
            </div>
            <div>
              <Label htmlFor="application_url">Application URL</Label>
              <Input
                id="application_url"
                type="url"
                value={formData.application_url}
                onChange={(e) => handleChange('application_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="application_deadline">Application Deadline</Label>
              <Input
                id="application_deadline"
                type="date"
                value={formData.application_deadline}
                onChange={(e) => handleChange('application_deadline', e.target.value)}
              />
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="document_type">Document Type</Label>
              <Input
                id="document_type"
                value={formData.document_type}
                onChange={(e) => handleChange('document_type', e.target.value)}
                placeholder="e.g., Privacy Policy, Terms of Service"
              />
            </div>
            <div>
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => handleChange('effective_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
              />
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>FAQ Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaqItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ Item
              </Button>
            </div>
            {formData.faq_items.length === 0 ? (
              <p className="text-sm text-gray-500">No FAQ items added. Click "Add FAQ Item" to get started.</p>
            ) : (
              formData.faq_items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>FAQ Item {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaqItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`faq-question-${index}`}>Question</Label>
                    <Input
                      id={`faq-question-${index}`}
                      value={item.question}
                      onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                      placeholder="Enter question"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                    <Textarea
                      id={`faq-answer-${index}`}
                      value={item.answer}
                      onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                      placeholder="Enter answer"
                      rows={3}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'help_center':
        return (
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Getting Started, Account Management"
            />
          </div>
        );

      case 'forum':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="forum_category">Forum Category</Label>
              <Input
                id="forum_category"
                value={formData.forum_category}
                onChange={(e) => handleChange('forum_category', e.target.value)}
                placeholder="e.g., General Discussion, Property Questions"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow_comments"
                checked={formData.allow_comments}
                onCheckedChange={(checked) => handleChange('allow_comments', checked)}
              />
              <Label htmlFor="allow_comments" className="cursor-pointer">
                Allow Comments
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Page</h1>
          <p className="text-gray-600 mt-1">Create a new website page</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/pages')}
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
              placeholder="Page title"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              required
              placeholder="page-slug"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
          </div>

          <div>
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Display order (lower numbers appear first)</p>
          </div>
        </div>

        {/* Type-specific fields */}
        {formData.page_type !== 'custom' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Type-Specific Fields</h3>
            {renderTypeSpecificFields()}
          </div>
        )}

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            required
            placeholder="HTML content supported"
            rows={12}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">HTML content is supported</p>
        </div>

        {!isCareersPage && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => handleChange('is_published', checked)}
            />
            <Label htmlFor="is_published" className="cursor-pointer">
              Publish immediately
            </Label>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/pages')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Page'}
          </Button>
        </div>
      </form>
    </div>
  );
};