from django.contrib import admin
from django.utils.html import format_html
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'published', 'created_at', 'thumbnail_preview']
    list_filter = ['category', 'published', 'created_at']
    search_fields = ['title', 'author', 'tags', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'thumbnail_preview']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'author', 'category')
        }),
        ('Content', {
            'fields': ('excerpt', 'content', 'thumbnail')
        }),
        ('Metadata', {
            'fields': ('tags', 'published')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def thumbnail_preview(self, obj):
        """Display thumbnail preview in admin"""
        if obj.thumbnail:
            try:
                return format_html(
                    '<img src="{}" style="max-width: 100px; max-height: 100px;" />',
                    obj.thumbnail.url
                )
            except:
                return "Image unavailable"
        return "No thumbnail"
    thumbnail_preview.short_description = 'Thumbnail'
