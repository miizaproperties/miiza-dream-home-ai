from django.contrib import admin
from django.utils.html import format_html
from .models import Property, PropertyImage


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


@admin.action(description='Mark selected properties as featured')
def make_featured(modeladmin, request, queryset):
    queryset.update(featured=True)
    modeladmin.message_user(request, f'{queryset.count()} property(ies) marked as featured.')


@admin.action(description='Remove featured status from selected properties')
def remove_featured(modeladmin, request, queryset):
    queryset.update(featured=False)
    modeladmin.message_user(request, f'{queryset.count()} property(ies) removed from featured.')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'property_type', 'status', 'city', 'price', 'rental_price_per_night', 'is_for_sale', 'is_for_rent', 'featured', 'created_at']
    list_filter = ['property_type', 'status', 'featured', 'is_for_sale', 'is_for_rent', 'city', 'currency']
    search_fields = ['title', 'description', 'address', 'city', 'country']
    inlines = [PropertyImageInline]
    readonly_fields = ['created_at', 'updated_at']
    actions = [make_featured, remove_featured]
    list_editable = ['featured']  # Allow quick editing from list view
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'property_type', 'status', 'featured')
        }),
        ('Location', {
            'fields': ('address', 'city', 'state', 'zip_code', 'country')
        }),
        ('Property Details', {
            'fields': ('bedrooms', 'bathrooms', 'square_feet', 'max_guests', 'amenities')
        }),
        ('Pricing', {
            'fields': ('price', 'rental_price_per_night', 'currency', 'is_for_sale', 'is_for_rent')
        }),
        ('Images', {
            'fields': ('main_image',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def featured_badge(self, obj):
        if obj.featured:
            return format_html(
                '<span style="background-color: #3b82f6; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">★ Featured</span>'
            )
        return format_html('<span style="color: #999;">—</span>')
    featured_badge.short_description = 'Featured'
    featured_badge.admin_order_field = 'featured'
