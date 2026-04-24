from django.db import models
from django.utils.text import slugify
import json


class Page(models.Model):
    """Model for managing static pages like Careers, Articles, Legal Notice"""
    
    PAGE_TYPE_CHOICES = [
        ('careers', 'Careers'),
        ('articles', 'Articles & News'),
        ('legal', 'Legal Notice'),
        ('help_center', 'Help Center'),
        ('faq', 'FAQ'),
        ('forum', 'Forum'),
        ('custom', 'Custom Page'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    page_type = models.CharField(max_length=20, choices=PAGE_TYPE_CHOICES, default='custom')
    content = models.TextField(help_text="HTML content supported")
    excerpt = models.TextField(blank=True, help_text="Short description for previews")
    meta_title = models.CharField(max_length=200, blank=True, help_text="SEO meta title")
    meta_description = models.TextField(blank=True, help_text="SEO meta description")
    
    # Publishing
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Ordering
    order = models.IntegerField(default=0, help_text="Order for display in navigation")
    
    # Type-specific fields stored as JSON for flexibility
    # Articles & News fields
    author = models.CharField(max_length=100, blank=True, help_text="Author name (for articles)")
    author_email = models.EmailField(blank=True, help_text="Author email (for articles)")
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags (for articles)")
    category = models.CharField(max_length=100, blank=True, help_text="Category (for articles/help center)")
    featured_image = models.ImageField(upload_to='pages/', blank=True, null=True, help_text="Featured image (for articles)")
    
    # Careers fields
    job_title = models.CharField(max_length=200, blank=True, help_text="Job title (for careers)")
    job_type = models.CharField(max_length=50, blank=True, help_text="Job type: Full-time, Part-time, Contract (for careers)")
    location = models.CharField(max_length=200, blank=True, help_text="Job location (for careers)")
    department = models.CharField(max_length=100, blank=True, help_text="Department (for careers)")
    salary_range = models.CharField(max_length=100, blank=True, help_text="Salary range (for careers)")
    application_email = models.EmailField(blank=True, help_text="Application email (for careers)")
    application_url = models.URLField(blank=True, help_text="Application URL (for careers)")
    application_deadline = models.DateField(blank=True, null=True, help_text="Application deadline (for careers)")
    
    # Legal Notice fields
    document_type = models.CharField(max_length=100, blank=True, help_text="Document type (for legal)")
    effective_date = models.DateField(blank=True, null=True, help_text="Effective date (for legal)")
    expiry_date = models.DateField(blank=True, null=True, help_text="Expiry date (for legal)")
    
    # FAQ fields (stored as JSON)
    faq_items = models.JSONField(default=list, blank=True, help_text="FAQ items: [{'question': '', 'answer': ''}]")
    
    # Help Center fields
    related_pages = models.ManyToManyField('self', blank=True, symmetrical=False, help_text="Related pages (for help center)")
    
    # Forum fields
    forum_category = models.CharField(max_length=100, blank=True, help_text="Forum category (for forum)")
    allow_comments = models.BooleanField(default=True, help_text="Allow comments (for forum)")
    
    class Meta:
        ordering = ['order', 'title']
        verbose_name = 'Page'
        verbose_name_plural = 'Pages'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Return the URL for this page"""
        return f"/{self.slug}"
    
    def get_type_specific_fields(self):
        """Return type-specific fields as a dictionary"""
        fields = {}
        if self.page_type == 'articles':
            fields = {
                'author': self.author,
                'author_email': self.author_email,
                'tags': self.tags,
                'category': self.category,
                'featured_image': self.featured_image.url if self.featured_image else None,
            }
        elif self.page_type == 'careers':
            fields = {
                'job_title': self.job_title,
                'job_type': self.job_type,
                'location': self.location,
                'department': self.department,
                'salary_range': self.salary_range,
                'application_email': self.application_email,
                'application_url': self.application_url,
                'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            }
        elif self.page_type == 'legal':
            fields = {
                'document_type': self.document_type,
                'effective_date': self.effective_date.isoformat() if self.effective_date else None,
                'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            }
        elif self.page_type == 'faq':
            fields = {
                'faq_items': self.faq_items,
            }
        elif self.page_type == 'help_center':
            fields = {
                'category': self.category,
                'related_pages': [p.id for p in self.related_pages.all()],
            }
        elif self.page_type == 'forum':
            fields = {
                'forum_category': self.forum_category,
                'allow_comments': self.allow_comments,
            }
        return fields


class Article(models.Model):
    """Model for individual articles/news items"""
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    content = models.TextField(help_text="HTML content supported")
    excerpt = models.TextField(blank=True, help_text="Short description for previews")
    featured_image = models.ImageField(upload_to='articles/', blank=True, null=True)
    
    # Author
    author = models.CharField(max_length=100, blank=True)
    author_email = models.EmailField(blank=True)
    
    # Publishing
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    
    # Tags/Categories
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    category = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-published_at']
        verbose_name = 'Article'
        verbose_name_plural = 'Articles'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        """Return the URL for this article"""
        return f"/articles/{self.slug}"
