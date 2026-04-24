from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import JobPosting, Job, Application


@admin.action(description='Mark selected jobs as featured')
def make_featured(modeladmin, request, queryset):
    queryset.update(is_featured=True)
    modeladmin.message_user(request, f'{queryset.count()} job(s) marked as featured.')


@admin.action(description='Remove featured status from selected jobs')
def remove_featured(modeladmin, request, queryset):
    queryset.update(is_featured=False)
    modeladmin.message_user(request, f'{queryset.count()} job(s) removed from featured.')


@admin.action(description='Mark selected jobs as active')
def make_active(modeladmin, request, queryset):
    queryset.update(is_active=True)
    modeladmin.message_user(request, f'{queryset.count()} job(s) marked as active.')


@admin.action(description='Mark selected jobs as inactive')
def make_inactive(modeladmin, request, queryset):
    queryset.update(is_active=False)
    modeladmin.message_user(request, f'{queryset.count()} job(s) marked as inactive.')


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'department',
        'location',
        'employment_type',
        'is_active',
        'is_featured',
        'posted_date',
        'application_deadline',
        'status_indicator'
    ]
    list_filter = [
        'department',
        'employment_type',
        'is_active',
        'is_featured',
        'posted_date',
        'location'
    ]
    search_fields = [
        'title',
        'description',
        'department',
        'location',
        'short_description'
    ]
    readonly_fields = ['slug', 'created_at', 'updated_at']
    actions = [make_featured, remove_featured, make_active, make_inactive]
    list_editable = ['is_featured', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title',
                'slug',
                'department',
                'location',
                'employment_type'
            )
        }),
        ('Job Description', {
            'fields': (
                'short_description',
                'description',
                'responsibilities',
                'requirements'
            )
        }),
        ('Application Details', {
            'fields': (
                'application_email',
                'application_url',
                'salary_range',
                'application_deadline'
            )
        }),
        ('Publishing', {
            'fields': (
                'is_active',
                'is_featured',
                'posted_date'
            )
        }),
        ('Metadata', {
            'fields': (
                'created_by',
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def status_indicator(self, obj):
        """Display visual status indicator"""
        now = timezone.now()
        
        if not obj.is_active:
            return format_html(
                '<span style="background-color: #ef4444; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">● Inactive</span>'
            )
        
        if obj.application_deadline and now > obj.application_deadline:
            return format_html(
                '<span style="background-color: #f59e0b; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">⚠ Expired</span>'
            )
        
        if obj.is_featured:
            return format_html(
                '<span style="background-color: #3b82f6; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">★ Featured</span>'
            )
        
        return format_html(
            '<span style="background-color: #10b981; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">● Active</span>'
        )
    
    status_indicator.short_description = 'Status'
    status_indicator.admin_order_field = 'is_active'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        qs = super().get_queryset(request)
        return qs.select_related('created_by')
    
    def save_model(self, request, obj, form, change):
        """Set created_by on first save"""
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class ApplicationInline(admin.TabularInline):
    """Inline for viewing applications within Job admin"""
    model = Application
    extra = 0
    readonly_fields = ['full_name', 'email', 'phone', 'applied_at', 'download_cv_link']
    can_delete = False
    can_add = False
    
    def download_cv_link(self, obj):
        """Create download link for CV"""
        if obj.cv:
            return format_html('<a href="{}" target="_blank">Download CV</a>', obj.cv.url)
        return 'No CV'
    download_cv_link.short_description = 'CV'


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'location', 'job_type', 'deadline', 'created_at', 'applications_count']
    list_filter = ['department', 'job_type', 'created_at']
    search_fields = ['title', 'department', 'location', 'description']
    readonly_fields = ['created_at']
    inlines = [ApplicationInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'department', 'location', 'job_type')
        }),
        ('Job Details', {
            'fields': ('description', 'responsibilities', 'requirements')
        }),
        ('Important Dates', {
            'fields': ('deadline', 'created_at')
        }),
    )
    
    def applications_count(self, obj):
        """Display count of applications for this job"""
        count = obj.applications.count()
        if count > 0:
            url = reverse('admin:careers_application_changelist')
            return format_html('<a href="{}?job__id__exact={}">{} application(s)</a>', url, obj.id, count)
        return '0 applications'
    applications_count.short_description = 'Applications'
    
    def get_queryset(self, request):
        """Optimize queryset with applications count"""
        qs = super().get_queryset(request)
        return qs.prefetch_related('applications')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'job', 'location', 'applied_at', 'download_cv']
    list_filter = ['job', 'applied_at', 'job__department']
    search_fields = ['full_name', 'email', 'phone', 'job__title']
    readonly_fields = ['applied_at', 'cv_preview']
    
    fieldsets = (
        ('Applicant Information', {
            'fields': ('full_name', 'email', 'phone', 'location')
        }),
        ('Job Application', {
            'fields': ('job', 'cover_letter', 'expected_salary', 'availability')
        }),
        ('Documents', {
            'fields': ('cv', 'cv_preview')
        }),
        ('Application Details', {
            'fields': ('applied_at',),
            'classes': ('collapse',)
        }),
    )
    
    def download_cv(self, obj):
        """Display download CV link in list view"""
        if obj.cv:
            return format_html('<a href="{}" target="_blank">Download CV</a>', obj.cv.url)
        return 'No CV'
    download_cv.short_description = 'CV'
    
    def cv_preview(self, obj):
        """Display CV download link in detail view"""
        if obj.cv:
            return format_html(
                '<a href="{}" target="_blank" class="button">Download CV ({} KB)</a>',
                obj.cv.url,
                round(obj.cv.size / 1024, 2) if hasattr(obj.cv, 'size') else 'N/A'
            )
        return 'No CV uploaded'
    cv_preview.short_description = 'CV File'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        qs = super().get_queryset(request)
        return qs.select_related('job')
