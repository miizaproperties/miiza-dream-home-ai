from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for Announcement model"""
    is_currently_active = serializers.ReadOnlyField()
    should_display_as_banner = serializers.ReadOnlyField()
    should_display_as_popup = serializers.ReadOnlyField()  # Legacy field for backward compatibility
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'message', 'image', 'url', 'is_major', 'is_active',
            'display_duration', 'start_date', 'end_date',
            'created_at', 'updated_at', 'created_by',
            'is_currently_active', 'should_display_as_banner', 'should_display_as_popup'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class AnnouncementListSerializer(serializers.ModelSerializer):
    """Simplified serializer for announcement lists"""
    is_currently_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'message', 'image', 'url', 'is_major', 'is_active',
            'display_duration', 'start_date', 'end_date',
            'created_at', 'is_currently_active'
        ]

