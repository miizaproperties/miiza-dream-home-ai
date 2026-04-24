from rest_framework import serializers
from .models import Property, PropertyImage


class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'alt_text', 'order']
    
    def get_image(self, obj):
        """Return the full Firebase URL for the image"""
        if obj.image:
            # Use the storage backend's url() method to get Firebase URL
            try:
                return obj.image.url
            except:
                # Fallback: construct URL from the stored path
                return str(obj.image)
        return None


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()
    display_price = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    area = serializers.SerializerMethodField()
    guests = serializers.IntegerField(source='max_guests', read_only=True)
    type = serializers.SerializerMethodField()
    display_bedrooms = serializers.SerializerMethodField()
    display_bathrooms = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'description', 'property_type', 'status', 'development_type',
            'address', 'city', 'state', 'zip_code', 'country', 'location',
            'bedrooms', 'bathrooms', 'display_bedrooms', 'display_bathrooms', 'square_feet', 'area', 'max_guests', 'guests',
            'price', 'rental_price_per_night', 'currency', 'display_price',
            'is_for_sale', 'is_for_rent', 'type',
            'amenities', 'main_image', 'images',
            'featured', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_main_image(self, obj):
        """Return the full Firebase URL for the main image"""
        if obj.main_image:
            # Use the storage backend's url() method to get Firebase URL
            try:
                return obj.main_image.url
            except:
                # Fallback: construct URL from the stored path
                return str(obj.main_image)
        return None
    
    def get_display_price(self, obj):
        """Return formatted price for frontend"""
        return obj.get_display_price()
    
    def get_location(self, obj):
        """Return formatted location string"""
        return f"{obj.city}, {obj.country}"
    
    def get_area(self, obj):
        """Return formatted area string in square feet (real data from square_feet)."""
        if obj.square_feet is not None and obj.square_feet > 0:
            return f"{obj.square_feet:,} sqft"
        return "N/A"

    def get_type(self, obj):
        """Return type for frontend compatibility"""
        return 'rent' if obj.is_for_rent else 'sale'
    
    def get_display_bedrooms(self, obj):
        """Return formatted bedrooms string for frontend"""
        return obj.get_display_bedrooms()
    
    def get_display_bathrooms(self, obj):
        """Return formatted bathrooms string for frontend"""
        return obj.get_display_bathrooms()


class PropertyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    display_price = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    area = serializers.SerializerMethodField()
    guests = serializers.IntegerField(source='max_guests', read_only=True)
    type = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    main_image = serializers.SerializerMethodField()
    display_bedrooms = serializers.SerializerMethodField()
    display_bathrooms = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        """Return the full Firebase URL for the main image (alias)"""
        return self.get_main_image(obj)
    
    def get_main_image(self, obj):
        """Return the full Firebase URL for the main image"""
        if obj.main_image:
            # Use the storage backend's url() method to get Firebase URL
            try:
                return obj.main_image.url
            except:
                # Fallback: construct URL from the stored path
                return str(obj.main_image)
        return None
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'property_type', 'status', 'development_type',
            'city', 'location', 'bedrooms', 'bathrooms', 'display_bedrooms', 'display_bathrooms', 'area',
            'price', 'display_price', 'is_for_sale', 'is_for_rent', 'type',
            'image', 'main_image', 'featured', 'guests'
        ]
    
    def get_display_price(self, obj):
        return obj.get_display_price()
    
    def get_location(self, obj):
        return f"{obj.city}, {obj.country}"
    
    def get_area(self, obj):
        """Return formatted area in square feet (real data from square_feet)."""
        if obj.square_feet is not None and obj.square_feet > 0:
            return f"{obj.square_feet:,} sqft"
        return "N/A"

    def get_type(self, obj):
        return 'rent' if obj.is_for_rent else 'sale'

    def get_display_bedrooms(self, obj):
        """Return formatted bedrooms string for frontend"""
        return obj.get_display_bedrooms()
    
    def get_display_bathrooms(self, obj):
        """Return formatted bathrooms string for frontend"""
        return obj.get_display_bathrooms()
