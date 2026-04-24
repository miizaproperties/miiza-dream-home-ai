from rest_framework import serializers
from .models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    """Full testimonial serializer for admin use"""
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'name', 'role', 'content', 'rating', 'is_active',
            'image', 'company', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_image(self, obj):
        """Return the full URL for the image"""
        if obj.image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            except:
                return str(obj.image)
        return None


class TestimonialListSerializer(serializers.ModelSerializer):
    """Simplified serializer for public list view"""
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'role', 'content', 'rating', 'image', 'company']
    
    def get_image(self, obj):
        """Return the full URL for the image"""
        if obj.image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            except:
                return str(obj.image)
        return None

