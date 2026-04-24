from django.contrib import admin
from .models import Page, Article


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ['title', 'page_type', 'slug', 'is_published', 'order', 'updated_at']
    list_filter = ['page_type', 'is_published', 'published_at']
    search_fields = ['title', 'content', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'page_type', 'order')
        }),
        ('Content', {
            'fields': ('excerpt', 'content')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_at')
        }),
    )
    readonly_fields = ['published_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'is_published', 'published_at']
    list_filter = ['is_published', 'category', 'published_at']
    search_fields = ['title', 'content', 'author', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'category', 'tags')
        }),
        ('Content', {
            'fields': ('excerpt', 'content', 'featured_image')
        }),
        ('Author', {
            'fields': ('author', 'author_email')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_at')
        }),
    )
    readonly_fields = ['published_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request)
