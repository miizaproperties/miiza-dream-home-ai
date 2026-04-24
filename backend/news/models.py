from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from config.firebase_storage_backend import FirebaseStorage


class Article(models.Model):
    CATEGORY_CHOICES = [
        ('business', 'Business'),
        ('tech', 'Tech'),
        ('real_estate', 'Real Estate'),
        ('updates', 'Updates'),
        ('market_analysis', 'Market Analysis'),
        ('investment', 'Investment'),
        ('lifestyle', 'Lifestyle'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    author = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    thumbnail = models.ImageField(
        upload_to='article_thumbnails/',
        storage=FirebaseStorage(location='article_thumbnails'),
        blank=True,
        null=True,
        help_text="Article thumbnail image"
    )
    content = models.TextField(help_text="Rich text content")
    excerpt = models.CharField(
        max_length=500,
        help_text="Short preview text"
    )
    tags = models.CharField(
        max_length=500,
        blank=True,
        help_text="Comma-separated tags (e.g., 'real estate, investment, nairobi')"
    )
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Article'
        verbose_name_plural = 'Articles'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from title if not provided"""
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure uniqueness
            original_slug = self.slug
            counter = 1
            while Article.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('article-detail', kwargs={'slug': self.slug})
    
    def get_tags_list(self):
        """Return tags as a list"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []
