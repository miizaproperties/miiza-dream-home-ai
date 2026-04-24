from rest_framework import serializers
from .models import Page, Article


class PageSerializer(serializers.ModelSerializer):
    """Serializer for Page model with type-specific fields"""
    featured_image_url = serializers.SerializerMethodField()
    type_specific_fields = serializers.SerializerMethodField()
    related_pages = serializers.PrimaryKeyRelatedField(many=True, queryset=Page.objects.all(), required=False)
    
    class Meta:
        model = Page
        fields = [
            'id', 'title', 'slug', 'page_type', 'content', 'excerpt',
            'is_published',
            'published_at', 'updated_at', 'order',
            # Articles & News fields
            'author', 'author_email', 'tags', 'category', 'featured_image', 'featured_image_url',
            # Careers fields
            'job_title', 'job_type', 'location', 'department', 'salary_range', 'application_email', 
            'application_url', 'application_deadline',
            # Legal Notice fields
            'document_type', 'effective_date', 'expiry_date',
            # FAQ fields
            'faq_items',
            # Help Center fields
            'related_pages',
            # Forum fields
            'forum_category', 'allow_comments',
            # Computed fields
            'type_specific_fields',
        ]
        read_only_fields = ['published_at', 'updated_at']
    
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
    
    def get_type_specific_fields(self, obj):
        """Return type-specific fields as a dictionary"""
        return obj.get_type_specific_fields()
    
    def create(self, validated_data):
        """Create page with ManyToMany relationships"""
        related_pages = validated_data.pop('related_pages', [])
        page = Page.objects.create(**validated_data)
        if related_pages:
            page.related_pages.set(related_pages)
        return page
    
    def update(self, instance, validated_data):
        """Update page with ManyToMany relationships"""
        related_pages = validated_data.pop('related_pages', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if related_pages is not None:
            instance.related_pages.set(related_pages)
        return instance


class ArticleSerializer(serializers.ModelSerializer):
    """Serializer for Article model"""
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'featured_image_url', 'author', 'author_email', 'is_published',
            'published_at', 'updated_at', 'meta_title', 'meta_description',
            'tags', 'category'
        ]
        read_only_fields = ['published_at', 'updated_at']
    
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


class ArticleListSerializer(serializers.ModelSerializer):
    """Simplified serializer for article lists"""
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image_url',
            'author', 'published_at', 'category', 'tags'
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

