from django.contrib import admin
from .models import Contact, ViewingRequest


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'property', 'is_read', 'created_at']
    list_filter = ['subject', 'is_read', 'created_at']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['created_at']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected contacts as read"
    actions = [mark_as_read]


@admin.register(ViewingRequest)
class ViewingRequestAdmin(admin.ModelAdmin):
    list_display = ['property_title_display', 'property_location_display', 'contact', 'preferred_date_display', 'preferred_time_display', 'status', 'reference_number', 'created_at']
    list_filter = ['status', 'preferred_date', 'created_at']
    search_fields = ['reference_number', 'contact__name', 'contact__email', 'property__title', 'property__city', 'property__address']
    readonly_fields = ['created_at', 'reference_number']
    
    def preferred_date_display(self, obj):
        """Display preferred date or 'Flexible' if not set"""
        return obj.preferred_date.strftime('%Y-%m-%d') if obj.preferred_date else "Flexible"
    preferred_date_display.short_description = 'Preferred Date'
    preferred_date_display.admin_order_field = 'preferred_date'
    
    def preferred_time_display(self, obj):
        """Display preferred time or 'Flexible' if not set"""
        return obj.preferred_time.strftime('%H:%M') if obj.preferred_time else "Flexible"
    preferred_time_display.short_description = 'Preferred Time'
    preferred_time_display.admin_order_field = 'preferred_time'
    
    def property_title_display(self, obj):
        """Display property title or 'General Viewing' if no property"""
        if obj.property:
            return obj.property.title
        return "General Viewing"
    property_title_display.short_description = 'Property'
    property_title_display.admin_order_field = 'property__title'
    
    def property_location_display(self, obj):
        """Display property location - matches PropertySerializer format"""
        if obj.property:
            # Build location from available fields (address, city, state, country)
            location_parts = []
            if obj.property.address:
                location_parts.append(obj.property.address)
            if obj.property.city:
                location_parts.append(obj.property.city)
            if obj.property.state:
                location_parts.append(obj.property.state)
            
            if location_parts:
                # Return full address with city, or just city, country format
                if len(location_parts) > 1:
                    return ", ".join(location_parts)
                else:
                    # If only city, use city, country format
                    return f"{obj.property.city}, {obj.property.country}"
            # Fallback to city, country format
            if obj.property.city:
                return f"{obj.property.city}, {obj.property.country}"
        return "—"
    property_location_display.short_description = 'Location'
    property_location_display.admin_order_field = 'property__city'
