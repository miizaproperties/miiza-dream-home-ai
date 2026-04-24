from django.contrib import admin
from .models import Event, EventMedia


class EventMediaInline(admin.TabularInline):
    """Inline admin for EventMedia"""
    model = EventMedia
    extra = 1
    fields = ['media_type', 'file', 'title', 'description', 'order']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_date', 'event_time', 'location', 'is_published', 'is_featured', 'created_at']
    list_filter = ['is_published', 'is_featured', 'event_date', 'created_at']
    search_fields = ['title', 'description', 'location']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']
    inlines = [EventMediaInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'content')
        }),
        ('Event Details', {
            'fields': ('event_date', 'event_time', 'location', 'location_url')
        }),
        ('Media', {
            'fields': ('featured_image',)
        }),
        ('Publishing', {
            'fields': ('is_published', 'is_featured')
        }),
        ('Contact & Registration', {
            'fields': ('contact_email', 'contact_phone', 'registration_url'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(EventMedia)
class EventMediaAdmin(admin.ModelAdmin):
    list_display = ['event', 'title', 'media_type', 'order', 'created_at']
    list_filter = ['media_type', 'created_at']
    search_fields = ['event__title', 'title', 'description']

