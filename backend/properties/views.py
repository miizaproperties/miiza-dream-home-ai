import re
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Q
from django.http import HttpResponse
from django.views.decorators.cache import cache_control
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
import requests
from .models import Property
from .serializers import PropertySerializer, PropertyListSerializer


def _slug_matches(slug_from_request, title):
    """Match request slug against both Django slugify and frontend-style slug (e.g. 23-4 from '2,3 & 4')."""
    if not title:
        return False
    django_slug = slugify(title).strip('-')
    if django_slug == slug_from_request:
        return True
    # Frontend: remove [^\w\s-], then replace spaces with -, then strip hyphens
    frontend_slug = re.sub(r'[-\s]+', '-', re.sub(r'[^\w\s-]', '', title.lower().strip())).strip('-')
    return bool(frontend_slug and frontend_slug == slug_from_request)


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    filter_backends = [filters.OrderingFilter]  # Removed SearchFilter - using custom search instead
    ordering_fields = ['price', 'rental_price_per_night', 'created_at', 'bedrooms', 'bathrooms']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Property.objects.all()
        # Optimize read queries: list uses lightweight serializer, retrieve needs images.
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('images')
        
        # Enhanced search filter - search across multiple fields
        search_query = self.request.query_params.get('search', None)
        if search_query:
            query_lower = search_query.lower().strip()
            # Build search query for multiple fields (case-insensitive)
            search_q = (
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(address__icontains=search_query) |
                Q(city__icontains=search_query) |
                Q(country__icontains=search_query) |
                Q(status__icontains=search_query) |
                Q(development_type__icontains=search_query) |
                # Search in JSON amenities field - PostgreSQL/SQLite JSON search
                Q(amenities__icontains=search_query)
            )
            queryset = queryset.filter(search_q)
        
        # Property type filter
        property_type = self.request.query_params.get('property_type', None)
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        
        # Status filter
        prop_status = self.request.query_params.get('status', None)
        if prop_status:
            queryset = queryset.filter(status=prop_status)
        
        # Sale/Rent filter
        is_for_sale = self.request.query_params.get('is_for_sale', None)
        if is_for_sale is not None:
            queryset = queryset.filter(is_for_sale=is_for_sale.lower() == 'true')
        
        is_for_rent = self.request.query_params.get('is_for_rent', None)
        if is_for_rent is not None:
            queryset = queryset.filter(is_for_rent=is_for_rent.lower() == 'true')
        
        # Location filters
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        country = self.request.query_params.get('country', None)
        if country:
            queryset = queryset.filter(country__icontains=country)
        
        # Featured filter
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(featured=featured.lower() == 'true')
            # When filtering by featured, order by featured first, then by created_at
            queryset = queryset.order_by('-featured', '-created_at')
        else:
            # Default ordering: featured first, then by created_at
            queryset = queryset.order_by('-featured', '-created_at')
        
        # Bedroom filter
        bedrooms = self.request.query_params.get('bedrooms', None)
        if bedrooms:
            try:
                # Handle both single integer and comma-separated values
                if ',' in bedrooms:
                    # If it's comma-separated, check if property has any of these bedroom counts
                    bedroom_values = [int(b.strip()) for b in bedrooms.split(',')]
                    bedroom_q = Q()
                    for value in bedroom_values:
                        bedroom_q |= Q(bedrooms__contains=str(value))
                    queryset = queryset.filter(bedroom_q)
                else:
                    # Single value
                    queryset = queryset.filter(bedrooms__contains=str(int(bedrooms)))
            except ValueError:
                pass
        
        min_bedrooms = self.request.query_params.get('min_bedrooms', None)
        if min_bedrooms:
            try:
                min_value = int(min_bedrooms)
                # Filter properties that have at least the minimum number of bedrooms
                filtered_q = Q()
                for i in range(min_value, 21):  # Reasonable upper limit
                    filtered_q |= Q(bedrooms__contains=str(i))
                queryset = queryset.filter(filtered_q)
            except ValueError:
                pass
        
        # Bathroom filter
        min_bathrooms = self.request.query_params.get('min_bathrooms', None)
        if min_bathrooms:
            try:
                min_value = int(min_bathrooms)
                # Filter properties that have at least the minimum number of bathrooms
                filtered_q = Q()
                for i in range(min_value, 21):  # Reasonable upper limit
                    filtered_q |= Q(bathrooms__contains=str(i))
                queryset = queryset.filter(filtered_q)
            except ValueError:
                pass
        
        # Price range filters
        min_price = self.request.query_params.get('min_price', None)
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        
        max_price = self.request.query_params.get('max_price', None)
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Guest capacity filter
        min_guests = self.request.query_params.get('min_guests', None)
        if min_guests:
            try:
                queryset = queryset.filter(max_guests__gte=int(min_guests))
            except ValueError:
                pass
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        return PropertySerializer
    
    @method_decorator(cache_page(60 * 2))
    def list(self, request, *args, **kwargs):
        """Override list to handle limit parameter"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Handle limit parameter
        limit = request.query_params.get('limit', None)
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @method_decorator(cache_page(60 * 5))
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured properties"""
        featured_properties = Property.objects.filter(featured=True).order_by('-created_at')
        limit = request.query_params.get('limit', None)
        if limit:
            try:
                featured_properties = featured_properties[:int(limit)]
            except ValueError:
                pass
        serializer = PropertyListSerializer(featured_properties, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search with multiple criteria"""
        queryset = self.get_queryset()
        
        # Get search query
        query = request.query_params.get('q', None)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(city__icontains=query) |
                Q(address__icontains=query)
            )
        
        serializer = PropertyListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """Get properties grouped by location"""
        city = request.query_params.get('city', None)
        if not city:
            return Response(
                {'error': 'City parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        properties = self.get_queryset().filter(city__iexact=city)
        serializer = PropertyListSerializer(properties, many=True)
        return Response(serializer.data)
    
    @method_decorator(cache_page(60 * 10))
    @action(detail=False, methods=['get'])
    def cities(self, request):
        """Get unique cities from all properties"""
        cities = list(Property.objects
                      .filter(city__isnull=False)
                      .exclude(city__exact='')
                      .values_list('city', flat=True)
                      .distinct()
                      .order_by('city'))
        return Response(cities)
    
    @method_decorator(cache_page(60 * 10))
    @action(detail=False, methods=['get'])
    def suburbs(self, request):
        """Get unique suburbs/neighbourhoods from all properties"""
        suburbs = set()
        
        # Get suburbs from state field
        state_suburbs = Property.objects.filter(
            state__isnull=False
        ).exclude(state__exact='').values_list('state', flat=True).distinct()
        suburbs.update(state_suburbs)
        
        # Get suburbs from address field (take first part before comma)
        for property in Property.objects.filter(
            address__isnull=False
        ).exclude(address__exact=''):
            if property.address:
                # Extract suburb from address (usually first part before comma)
                suburb = property.address.split(',')[0].strip()
                if suburb:
                    suburbs.add(suburb)
        
        # Convert to sorted list
        sorted_suburbs = sorted(list(suburbs))
        return Response(sorted_suburbs)


@api_view(['GET'])
@cache_control(max_age=3600)  # Cache for 1 hour
def proxy_image(request, image_path):
    """
    Proxy Firebase Storage images to avoid CORS issues
    """
    from urllib.parse import quote, unquote
    import os
    
    try:
        # Django URL routing decodes the path parameter, so we need to re-encode it for Firebase
        # Decode first to handle any double-encoding, then encode properly for Firebase
        decoded_path = unquote(image_path)
        # Re-encode for Firebase Storage URL (Firebase expects URL-encoded paths)
        encoded_path = quote(decoded_path, safe='')
        
        # Construct Firebase Storage URL
        bucket_name = os.environ.get('FIREBASE_STORAGE_BUCKET', 'automotive-5f3b5.firebasestorage.app')
        firebase_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}?alt=media"
        
        # Fetch the image from Firebase
        response = requests.get(firebase_url, timeout=10, stream=True, allow_redirects=True)
        
        if response.status_code == 200:
            # Set CORS headers
            http_response = HttpResponse(
                response.content,
                content_type=response.headers.get('Content-Type', 'image/jpeg')
            )
            http_response['Access-Control-Allow-Origin'] = '*'
            http_response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            http_response['Access-Control-Allow-Headers'] = 'Content-Type'
            http_response['Cache-Control'] = 'public, max-age=3600'
            return http_response
        else:
            return HttpResponse(f'Image not found (Status: {response.status_code})', status=404)
    except requests.exceptions.RequestException as e:
        return HttpResponse(f'Error loading image: {str(e)}', status=500)
    except Exception as e:
        return HttpResponse(f'Error: {str(e)}', status=500)


@api_view(['GET'])
@cache_page(60 * 5)
def property_by_slug(request, slug):
    """
    Get property by slug (DB slug field, with fallback to slugified title match).
    """
    try:
        prop = Property.objects.filter(slug=slug).first()
        if not prop:
            # Fallback: match by slugified title (Django or frontend-style slug)
            for p in Property.objects.only('id', 'title').all():
                if _slug_matches(slug, p.title):
                    prop = Property.objects.get(pk=p.id)
                    break
        if prop:
            serializer = PropertySerializer(prop)
            return Response(serializer.data)
        return Response(
            {'error': 'Property not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@cache_page(60 * 5)
def property_by_slug_direct(request, slug):
    """
    Get property by slug (DB slug field, with fallback to slugified title and numeric pk).
    """
    try:
        prop = Property.objects.filter(slug=slug).first()
        if not prop and slug.isdigit():
            prop = Property.objects.filter(pk=int(slug)).first()
        if not prop:
            # Fallback: match by slugified title (Django or frontend-style slug)
            for p in Property.objects.only('id', 'title').all():
                if _slug_matches(slug, p.title):
                    prop = Property.objects.get(pk=p.id)
                    break
        if prop:
            serializer = PropertySerializer(prop)
            return Response(serializer.data)
        return Response(
            {'error': 'Property not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
