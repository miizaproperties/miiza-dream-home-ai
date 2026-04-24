from django.db import models


class Contact(models.Model):
    SUBJECT_CHOICES = [
        ('inquiry', 'Property Inquiry'),
        ('viewing', 'Schedule Viewing'),
        ('general', 'General Question'),
        ('mortgage', 'Mortgage Information'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES, default='general')
    message = models.TextField()
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inquiries'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Contact from {self.name} - {self.subject}"


class ViewingRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='viewing_requests')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='viewing_requests', null=True, blank=True)
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.TimeField(null=True, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reference_number = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        property_title = self.property.title if self.property else "General Viewing"
        return f"Viewing request for {property_title} by {self.contact.name}"
