from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from config.firebase_storage_backend import FirebaseStorage


class JobPosting(models.Model):
    """Model for managing job openings/career opportunities"""
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary'),
    ]
    
    title = models.CharField(max_length=200, help_text="Job title (e.g., 'Senior Real Estate Agent')")
    slug = models.SlugField(max_length=200, unique=True, blank=True, help_text="URL-friendly version of the title")
    department = models.CharField(max_length=100, help_text="Department (e.g., 'Sales', 'Marketing', 'Operations')")
    location = models.CharField(max_length=200, help_text="Job location (e.g., 'Nairobi, Kenya' or 'Remote')")
    
    # Employment details
    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE_CHOICES,
        default='full_time',
        help_text="Type of employment"
    )
    
    # Job description
    description = models.TextField(help_text="Detailed job description (HTML supported)")
    short_description = models.TextField(
        max_length=500,
        blank=True,
        help_text="Brief summary of the position for listings"
    )
    
    # Requirements
    requirements = models.TextField(
        help_text="Required qualifications and skills (HTML supported)",
        blank=True
    )
    responsibilities = models.TextField(
        help_text="Key responsibilities (HTML supported)",
        blank=True
    )
    
    # Compensation (optional)
    salary_range = models.CharField(
        max_length=100,
        blank=True,
        help_text="Salary range (e.g., '$50,000 - $70,000' or 'Competitive')"
    )
    
    # Application details
    application_email = models.EmailField(
        blank=True,
        help_text="Email address for applications (if different from default)"
    )
    application_url = models.URLField(
        blank=True,
        help_text="External URL for application (optional)"
    )
    
    # Publishing
    is_active = models.BooleanField(
        default=True,
        help_text="Only active job postings are displayed"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Featured jobs appear at the top of listings"
    )
    
    # Dates
    posted_date = models.DateTimeField(
        default=timezone.now,
        help_text="Date when job was posted"
    )
    application_deadline = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Application deadline (leave empty for no deadline)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_job_postings'
    )
    
    class Meta:
        ordering = ['-is_featured', '-posted_date', '-created_at']
        verbose_name = 'Job Posting'
        verbose_name_plural = 'Job Postings'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while JobPosting.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def is_currently_active(self):
        """Check if job posting should be displayed now"""
        if not self.is_active:
            return False
        
        if self.application_deadline:
            now = timezone.now()
            if now > self.application_deadline:
                return False
        
        return True
    
    def get_absolute_url(self):
        """Return the URL for this job posting"""
        return f"/careers/{self.slug}"


class Job(models.Model):
    """Model for job openings"""
    
    JOB_TYPE_CHOICES = [
        ('Full-Time', 'Full-Time'),
        ('Part-Time', 'Part-Time'),
        ('Internship', 'Internship'),
        ('Contract', 'Contract'),
    ]
    
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='Full-Time')
    description = models.TextField()
    responsibilities = models.TextField()
    requirements = models.TextField()
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Job'
        verbose_name_plural = 'Jobs'
    
    def __str__(self):
        return f"{self.title} - {self.department}"


class Application(models.Model):
    """Model for job applications"""
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=200)
    cv = models.FileField(
        upload_to='cv_uploads/',
        storage=FirebaseStorage(location='cv_uploads'),
        help_text="Upload CV/Resume (PDF, DOC, DOCX)"
    )
    cover_letter = models.TextField()
    expected_salary = models.CharField(max_length=100, blank=True)
    availability = models.CharField(max_length=200, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-applied_at']
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
    
    def __str__(self):
        return f"Application from {self.full_name} for {self.job.title}"
