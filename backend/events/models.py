from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Event(models.Model):
    """Model for managing events"""
    
    title = models.CharField(max_length=200, help_text="Event title")
    slug = models.SlugField(max_length=200, unique=True, blank=True, help_text="URL-friendly identifier")
    description = models.TextField(help_text="Short description of the event")
    content = models.TextField(blank=True, help_text="Full event details (HTML supported)")
    
    # Event details
    event_date = models.DateField(help_text="Date of the event")
    event_time = models.TimeField(help_text="Time of the event")
    location = models.CharField(max_length=500, help_text="Event location")
    location_url = models.URLField(max_length=500, blank=True, null=True, help_text="Google Maps or location URL")
    
    # Media
    featured_image = models.ImageField(
        upload_to='events/featured/',
        null=True,
        blank=True,
        help_text="Featured image for the event"
    )
    
    # Publishing
    is_published = models.BooleanField(
        default=True,
        help_text="Only published events are displayed"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Featured events appear prominently"
    )
    
    # Additional info
    contact_email = models.EmailField(blank=True, null=True, help_text="Contact email for event inquiries")
    contact_phone = models.CharField(max_length=20, blank=True, null=True, help_text="Contact phone for event inquiries")
    registration_url = models.URLField(max_length=500, blank=True, null=True, help_text="Event registration URL")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_events'
    )
    
    class Meta:
        ordering = ['event_date', 'event_time']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure uniqueness
            base_slug = self.slug
            counter = 1
            while Event.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{base_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
    
    def is_upcoming(self):
        """Check if event is upcoming"""
        event_datetime = timezone.datetime.combine(self.event_date, self.event_time)
        event_datetime = timezone.make_aware(event_datetime)
        return event_datetime > timezone.now()
    
    def is_past(self):
        """Check if event has passed"""
        return not self.is_upcoming()
    
    def get_absolute_url(self):
        """Return the URL for this event"""
        return f"/events/{self.slug}"


class EventMedia(models.Model):
    """Model for managing multiple media files for events"""
    
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
    ]
    
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='media_files',
        help_text="Event this media belongs to"
    )
    media_type = models.CharField(
        max_length=20,
        choices=MEDIA_TYPE_CHOICES,
        default='image',
        help_text="Type of media"
    )
    file = models.FileField(
        upload_to='events/media/',
        help_text="Media file"
    )
    title = models.CharField(
        max_length=200,
        blank=True,
        help_text="Title/name for the media"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of the media"
    )
    order = models.IntegerField(
        default=0,
        help_text="Order for display"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Event Media'
        verbose_name_plural = 'Event Media'
    
    def __str__(self):
        return f"{self.event.title} - {self.title or self.file.name}"

