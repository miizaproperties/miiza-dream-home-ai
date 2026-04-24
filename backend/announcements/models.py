from django.db import models
from django.utils import timezone


class Announcement(models.Model):
    """Model for managing announcements that can be displayed as banners below the navbar"""
    
    title = models.CharField(max_length=200, help_text="Announcement title")
    message = models.TextField(help_text="Announcement message/content")
    image = models.ImageField(
        upload_to='announcements/',
        null=True,
        blank=True,
        help_text="Optional image for the announcement"
    )
    url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        help_text="Optional URL to redirect users when announcement is clicked"
    )
    is_major = models.BooleanField(
        default=False,
        help_text="Major announcements appear as banners below the navbar. Non-major announcements are only shown in the announcements page."
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Only active announcements are displayed"
    )
    
    # Display settings
    display_duration = models.IntegerField(
        default=5,
        help_text="Display duration in seconds (for reference). Major announcements are displayed in a banner below the navbar until dismissed."
    )
    
    # Date settings
    start_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When to start showing this announcement (leave empty for immediate)"
    )
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When to stop showing this announcement (leave empty for no end date)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_announcements'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
    
    def __str__(self):
        return self.title
    
    def is_currently_active(self):
        """Check if announcement should be displayed now"""
        if not self.is_active:
            return False
        
        now = timezone.now()
        
        if self.start_date and now < self.start_date:
            return False
        
        if self.end_date and now > self.end_date:
            return False
        
        return True
    
    def should_display_as_banner(self):
        """Check if announcement should display as banner below navbar"""
        return self.is_major and self.is_currently_active()
    
    def should_display_as_popup(self):
        """Legacy method - kept for backward compatibility. Use should_display_as_banner instead."""
        return self.should_display_as_banner()

