from rest_framework import serializers
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    """Full article serializer"""
    thumbnail = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'author', 'category',
            'thumbnail', 'content', 'excerpt', 'tags', 'tags_list',
            'published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'slug']
    
    def get_thumbnail(self, obj):
        """Return the full URL for the thumbnail"""
        if obj.thumbnail:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.thumbnail.url)
                return obj.thumbnail.url
            except:
                return str(obj.thumbnail)
        return None
    
    def get_tags_list(self, obj):
        """Return tags as a list"""
        return obj.get_tags_list()


class ArticleListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    thumbnail = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'author', 'category',
            'thumbnail', 'excerpt', 'tags_list', 'created_at'
        ]
    
    def get_thumbnail(self, obj):
        """Return the full URL for the thumbnail"""
        if obj.thumbnail:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.thumbnail.url)
                return obj.thumbnail.url
            except:
                return str(obj.thumbnail)
        return None
    
    def get_tags_list(self, obj):
        """Return tags as a list"""
        return obj.get_tags_list()



















