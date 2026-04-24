from django.db import models
from django.core.validators import MinValueValidator
from django.utils.text import slugify
from config.firebase_storage_backend import FirebaseStorage


class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('airbnb', 'Airbnb'),
        ('commercial', 'Commercial'),
        ('office', 'Office'),
        ('traditional_home', 'Traditional Home'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
        ('pending', 'Pending'),
        ('development', 'Development'),
    ]
    
    DEVELOPMENT_TYPE_CHOICES = [
        ('new_development', 'New Development'),
        ('off_plan', 'Off-Plan'),
        ('pre_launch', 'Pre-Launch'),
        ('under_construction', 'Under Construction'),
        ('completed', 'Completed'),
        ('gated_community', 'Gated Community'),
        ('mixed_use_development', 'Mixed-Use Development'),
    ]
    
    CURRENCY_CHOICES = [
        ('KSH', 'Kenyan Shilling'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
    ]
    
    RENTAL_DURATION_CHOICES = [
        ('short_term', 'Short-term (1-30 days)'),
        ('long_term', 'Long-term (30+ days)'),
        ('both', 'Both Short & Long-term'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    development_type = models.CharField(
        max_length=30,
        choices=DEVELOPMENT_TYPE_CHOICES,
        blank=True,
        null=True,
        help_text="Type of development (only applicable when status is 'development')"
    )
    
    # Location
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='Kenya')
    
    # Property details
    bedrooms = models.CharField(max_length=100, help_text="Number of bedrooms (comma-separated for multiple units)")
    bathrooms = models.CharField(max_length=100, help_text="Number of bathrooms (comma-separated for multiple units)")
    square_feet = models.IntegerField(validators=[MinValueValidator(0)], blank=True, null=True)
    max_guests = models.IntegerField(validators=[MinValueValidator(1)], default=2, help_text="Maximum number of guests")
    
    # Pricing
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], help_text="Sale price or base price")
    rental_price_per_night = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], null=True, blank=True, help_text="Nightly rental rate")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='KSH')
    is_for_sale = models.BooleanField(default=True)
    is_for_rent = models.BooleanField(default=False)
    rental_duration = models.CharField(
        max_length=20,
        choices=RENTAL_DURATION_CHOICES,
        blank=True,
        null=True,
        help_text="Rental duration type for Airbnb properties"
    )
    
    # Amenities (stored as JSON)
    amenities = models.JSONField(default=list, blank=True, help_text="List of amenities like ['WiFi', 'Pool', 'Parking']")
    
    # Images - Using Local Storage (temporarily for development)
    main_image = models.ImageField(
        upload_to='properties/',
        blank=True,
        null=True
    )
    
    # Metadata
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Auto-generate slug from title if not provided
        if not self.slug:
            # Use same logic as frontend generateSlug function
            # Remove non-alphanumeric characters, convert to lowercase, replace spaces with hyphens
            clean_title = ''.join(char if char.isalnum() or char.isspace() else '' for char in self.title.lower())
            slug_candidate = clean_title.strip().replace(' ', '-')
            # Remove multiple consecutive hyphens
            while '--' in slug_candidate:
                slug_candidate = slug_candidate.replace('--', '-')
            # Remove leading/trailing hyphens
            slug_candidate = slug_candidate.strip('-')
            
            # Check if this slug already exists
            base_slug = slug_candidate
            counter = 1
            while Property.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
                slug_candidate = f"{base_slug}-{counter}"
                counter += 1
                
            self.slug = slug_candidate
            
        super().save(*args, **kwargs)
    
    def get_display_bedrooms(self):
        """Return formatted bedrooms display."""
        if not self.bedrooms:
            return "—"
        
        # Handle comma-separated values
        if ',' in self.bedrooms:
            values = [v.strip() for v in self.bedrooms.split(',') if v.strip()]
            if len(set(values)) == 1:
                return values[0]
            else:
                return f"{min(values)}-{max(values)}"
        
        return self.bedrooms
    
    def get_display_bathrooms(self):
        """Return formatted bathrooms display."""
        if not self.bathrooms:
            return "—"
        
        # Handle comma-separated values  
        if ',' in self.bathrooms:
            values = [v.strip() for v in self.bathrooms.split(',') if v.strip()]
            if len(set(values)) == 1:
                return values[0]
            else:
                return f"{min(values)}-{max(values)}"
        
        return self.bathrooms
    
    def get_display_price(self):
        """Return formatted price for display"""
        try:
            # Format price with currency
            if self.currency == 'KSH':
                return f"KSh {self.price:,.0f}"
            elif self.currency == 'USD':
                return f"${self.price:,.0f}"
            elif self.currency == 'EUR':
                return f"€{self.price:,.0f}"
            elif self.currency == 'GBP':
                return f"£{self.price:,.0f}"
            else:
                return f"{self.currency} {self.price:,.0f}"
        except:
            return f"{self.currency} {self.price}"


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to='properties/',
        blank=True,
        null=True
    )
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.property.title} - Image {self.order + 1}"