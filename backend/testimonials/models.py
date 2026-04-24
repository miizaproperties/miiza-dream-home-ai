from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Testimonial(models.Model):
    """Model for managing client testimonials"""
    
    name = models.CharField(max_length=200, help_text="Client name")
    role = models.CharField(
        max_length=200,
        help_text="Client role/title (e.g., Homeowner, Business Owner, Tenant)"
    )
    content = models.TextField(help_text="Testimonial content")
    rating = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Only active testimonials are displayed"
    )
    
    # Optional fields
    image = models.ImageField(
        upload_to='testimonials/',
        null=True,
        blank=True,
        help_text="Optional client photo"
    )
    company = models.CharField(
        max_length=200,
        blank=True,
        help_text="Optional company name"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_testimonials'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Testimonial'
        verbose_name_plural = 'Testimonials'
    
    def __str__(self):
        return f"{self.name} - {self.role}"
