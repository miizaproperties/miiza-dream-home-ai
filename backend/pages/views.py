from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Page, Article
from .serializers import PageSerializer, ArticleSerializer, ArticleListSerializer


class PageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Page model - read-only for public"""
    queryset = Page.objects.filter(is_published=True)
    serializer_class = PageSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = Page.objects.filter(is_published=True)
        page_type = self.request.query_params.get('page_type', None)
        if page_type:
            queryset = queryset.filter(page_type=page_type)
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get pages by type"""
        page_type = request.query_params.get('type', None)
        if not page_type:
            return Response(
                {'error': 'Type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pages = self.get_queryset().filter(page_type=page_type)
        serializer = self.get_serializer(pages, many=True)
        return Response(serializer.data)


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Article model - read-only for public"""
    queryset = Article.objects.filter(is_published=True)
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleSerializer
    
    def get_queryset(self):
        queryset = Article.objects.filter(is_published=True)
        category = self.request.query_params.get('category', None)
        tag = self.request.query_params.get('tag', None)
        search = self.request.query_params.get('search', None)
        
        if category:
            queryset = queryset.filter(category__icontains=category)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(excerpt__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured articles (most recent)"""
        articles = self.get_queryset().order_by('-published_at')[:6]
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get articles by category"""
        category = request.query_params.get('category', None)
        if not category:
            return Response(
                {'error': 'Category parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        articles = self.get_queryset().filter(category__icontains=category)
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)
