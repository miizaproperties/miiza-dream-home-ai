from rest_framework import serializers
from .models import Event, EventMedia


class EventMediaSerializer(serializers.ModelSerializer):
    """Serializer for EventMedia model"""
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = EventMedia
        fields = [
            'id', 'media_type', 'file', 'file_url', 'title', 'description', 'order', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_file_url(self, obj):
        """Return the full URL for the media file"""
        if obj.file:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.file.url)
                return obj.file.url
            except:
                return str(obj.file)
        return None


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model"""
    featured_image_url = serializers.SerializerMethodField()
    media_files = EventMediaSerializer(many=True, read_only=True)
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'description', 'content',
            'event_date', 'event_time', 'location', 'location_url',
            'featured_image', 'featured_image_url', 'is_published', 'is_featured',
            'contact_email', 'contact_phone', 'registration_url',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'media_files', 'is_upcoming', 'is_past'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'slug']
    
    def get_featured_image_url(self, obj):
        """Return the full URL for the featured image"""
        if obj.featured_image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.featured_image.url)
                return obj.featured_image.url
            except:
                return str(obj.featured_image)
        return None
    
    def get_created_by_name(self, obj):
        """Return the name of the user who created the event"""
        if obj.created_by:
            if obj.created_by.first_name and obj.created_by.last_name:
                return f"{obj.created_by.first_name} {obj.created_by.last_name}"
            return obj.created_by.username
        return None


class EventListSerializer(serializers.ModelSerializer):
    """Simplified serializer for event lists"""
    featured_image_url = serializers.SerializerMethodField()
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'description',
            'event_date', 'event_time', 'location',
            'featured_image_url', 'is_published', 'is_featured',
            'is_upcoming', 'is_past'
        ]
    
    def get_featured_image_url(self, obj):
        """Return the full URL for the featured image"""
        if obj.featured_image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.featured_image.url)
                return obj.featured_image.url
            except:
                return str(obj.featured_image)
        return None

