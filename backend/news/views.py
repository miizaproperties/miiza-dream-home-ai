from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
import logging
from .models import Article
from .serializers import ArticleSerializer, ArticleListSerializer

logger = logging.getLogger(__name__)


class ArticlePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ArticleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Article model.
    Provides list, retrieve, create, update, and delete operations.
    """
    queryset = Article.objects.all()
    pagination_class = ArticlePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'excerpt', 'tags', 'author']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = Article.objects.all()
        
        # Check if user is authenticated and is staff
        is_staff_user = self.request.user.is_authenticated and self.request.user.is_staff
        
        # Debug: Log total articles count
        total_count = queryset.count()
        published_count = queryset.filter(published=True).count()
        logger.info(f"Article queryset - Total: {total_count}, Published: {published_count}, User authenticated: {self.request.user.is_authenticated}, Is staff: {is_staff_user}")
        
        # Filter by published status
        # For public users (non-staff), only show published articles by default
        published = self.request.query_params.get('published', None)
        if published is not None:
            # If published parameter is explicitly provided, use it
            published_bool = published.lower() == 'true'
            queryset = queryset.filter(published=published_bool)
            logger.info(f"Filtering by published={published_bool} (from query param)")
        elif not is_staff_user:
            # For non-staff users (including unauthenticated), default to published only
            queryset = queryset.filter(published=True)
            logger.info("Filtering to published=True (default for non-staff)")
        else:
            logger.info("Showing all articles (staff user, no published filter)")
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
            logger.info(f"Filtering by category: {category}")
        
        # Filter by tags (comma-separated)
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            queryset = queryset.filter(
                Q(tags__icontains=tag_list[0])
            )
            for tag in tag_list[1:]:
                queryset = queryset.filter(tags__icontains=tag)
            logger.info(f"Filtering by tags: {tag_list}")
        
        final_count = queryset.count()
        logger.info(f"Final queryset count: {final_count}")
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleSerializer
    
    def list(self, request, *args, **kwargs):
        """Override list to add debugging and ensure request context is passed"""
        response = super().list(request, *args, **kwargs)
        
        # Log the response for debugging
        logger.info(f"List response - Count: {response.data.get('count', 0)}, Results: {len(response.data.get('results', []))}")
        
        return response
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'latest']:
            permission_classes = [AllowAny]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_object(self):
        """Get article by slug, with permission check"""
        obj = super().get_object()
        
        # Check if user is authenticated and is staff
        is_staff_user = self.request.user.is_authenticated and self.request.user.is_staff
        
        # Non-staff users can only see published articles
        if not is_staff_user and not obj.published:
            from django.http import Http404
            raise Http404
        
        return obj
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest 5 published articles"""
        articles = Article.objects.filter(published=True).order_by('-created_at')[:5]
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def debug_status(self, request):
        """Debug endpoint to check article status (for troubleshooting)"""
        total = Article.objects.count()
        published = Article.objects.filter(published=True).count()
        unpublished = Article.objects.filter(published=False).count()
        
        # Get sample of articles
        all_articles = Article.objects.all()[:10]
        article_status = [
            {
                'id': a.id,
                'title': a.title,
                'published': a.published,
                'created_at': a.created_at.isoformat() if a.created_at else None
            }
            for a in all_articles
        ]
        
        return Response({
            'total_articles': total,
            'published_count': published,
            'unpublished_count': unpublished,
            'sample_articles': article_status,
            'message': 'Make sure articles have published=True in admin to appear on frontend'
        })
