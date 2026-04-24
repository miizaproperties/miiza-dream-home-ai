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
    
    RENTAL_DURATION_CHOICES = [\n        ('short_term', 'Short-term (1-30 days)'),\n        ('long_term', 'Long-term (30+ days)'),\n        ('both', 'Both Short & Long-term'),\n    ]\n    \n    title = models.CharField(max_length=200)
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
    is_for_rent = models.BooleanField(default=False)\n    rental_duration = models.CharField(\n        max_length=20,\n        choices=RENTAL_DURATION_CHOICES,\n        blank=True,\n        null=True,\n        help_text=\"Rental duration type for Airbnb properties\"\n    )
    
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
            self.slug = slugify(self.title).strip('-')
        super().save(*args, **kwargs)
    
    def get_bedroom_list(self):
        """Return bedrooms as a list of integers"""
        if not self.bedrooms:
            return []
        try:
            return [int(b.strip()) for b in self.bedrooms.split(',') if b.strip().isdigit()]
        except (ValueError, AttributeError):
            return []
    
    def get_bathroom_list(self):
        """Return bathrooms as a list of integers"""
        if not self.bathrooms:
            return []
        try:
            return [int(b.strip()) for b in self.bathrooms.split(',') if b.strip().isdigit()]
        except (ValueError, AttributeError):
            return []
    
    def get_min_bedrooms(self):
        """Return minimum number of bedrooms"""
        bedroom_list = self.get_bedroom_list()
        return min(bedroom_list) if bedroom_list else 0
    
    def get_max_bedrooms(self):
        """Return maximum number of bedrooms"""
        bedroom_list = self.get_bedroom_list()
        return max(bedroom_list) if bedroom_list else 0
    
    def get_min_bathrooms(self):
        """Return minimum number of bathrooms"""
        bathroom_list = self.get_bathroom_list()
        return min(bathroom_list) if bathroom_list else 0
    
    def get_max_bathrooms(self):
        """Return maximum number of bathrooms"""
        bathroom_list = self.get_bathroom_list()
        return max(bathroom_list) if bathroom_list else 0
    
    def get_display_bedrooms(self):
        """Return formatted bedrooms string for display"""
        bedroom_list = self.get_bedroom_list()
        if not bedroom_list:
            return "0"
        if len(bedroom_list) == 1:
            return str(bedroom_list[0])
        return f"{min(bedroom_list)}-{max(bedroom_list)}"
    
    def get_display_bathrooms(self):
        """Return formatted bathrooms string for display"""
        bathroom_list = self.get_bathroom_list()
        if not bathroom_list:
            return "0"
        if len(bathroom_list) == 1:
            return str(bathroom_list[0])
        return f"{min(bathroom_list)}-{max(bathroom_list)}"
    
    def get_display_price(self):
        """Return formatted price string for frontend"""
        if self.is_for_rent and self.rental_price_per_night:
            return f"{self.currency} {self.rental_price_per_night:.0f} /night"
        return f"{self.currency} {self.price:.0f}"
    
    def get_price_range_category(self):
        """Categorize property by price for filtering"""
        price_ksh = self.price if self.currency == 'KSH' else self.price * 130  # Rough conversion
        if price_ksh < 10000000:
            return "under_10m"
        elif price_ksh < 25000000:
            return "10_25m"
        elif price_ksh < 50000000:
            return "25_50m"
        else:
            return "50m_plus"


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to='properties/images/'
    )
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Image for {self.property.title}"
