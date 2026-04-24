from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.db.models import Count, Sum, Avg, Min, Max, Q
from django.utils import timezone
from datetime import timedelta
from properties.models import Property, PropertyImage
from contacts.models import Contact, ViewingRequest
from accounts.models import User, Agent
from pages.models import Page
from news.models import Article as NewsArticle
from announcements.models import Announcement
from testimonials.models import Testimonial
from events.models import Event, EventMedia


# Helper function to parse boolean values from request data
def parse_boolean(value, default=False):
    """Parse boolean value from request data - handles both boolean and string values"""
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    return str(value).lower() in ('true', '1', 'yes', 'on')


# Custom authentication class that doesn't require CSRF
class CSRFExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Skip CSRF check


@csrf_exempt
def dashboard_login(request):
    """Login endpoint for dashboard - supports both admin and agents"""
    if request.method != 'POST':
        return JsonResponse(
            {'error': 'Method not allowed'},
            status=405
        )
    
    import json
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {'error': 'Invalid JSON'},
            status=400
        )
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return JsonResponse(
            {'error': 'Username and password are required'},
            status=400
        )
    
    # Try to authenticate with username first
    user = authenticate(request, username=username, password=password)
    
    # If authentication fails, try with email (in case user provided email instead of username)
    if user is None:
        try:
            # Try to find user by email
            try:
                user_by_email = User.objects.get(email=username)
                # Try authenticating with email as username
                user = authenticate(request, username=user_by_email.username, password=password)
            except User.DoesNotExist:
                pass
        except Exception as e:
            logger.error(f"Error during email-based authentication: {e}")
    
    if user is None:
        # Check if user exists but password is wrong, or user doesn't exist
        try:
            try:
                existing_user = User.objects.get(username=username)
                if not existing_user.is_active:
                    return JsonResponse(
                        {'error': 'Account is inactive. Please contact administrator.'},
                        status=401
                    )
                # User exists and is active, but password is wrong
                logger.warning(f"Failed login attempt for username: {username}")
            except User.DoesNotExist:
                # Try checking by email
                try:
                    existing_user = User.objects.get(email=username)
                    if not existing_user.is_active:
                        return JsonResponse(
                            {'error': 'Account is inactive. Please contact administrator.'},
                            status=401
                        )
                    logger.warning(f"Failed login attempt for email: {username}")
                except User.DoesNotExist:
                    logger.warning(f"Login attempt for non-existent user: {username}")
        except Exception as e:
            logger.error(f"Error checking user existence: {e}")
        
        return JsonResponse(
            {'error': 'Invalid username or password'},
            status=401
        )
    
    # Check if user is active
    if not user.is_active:
        return JsonResponse(
            {'error': 'Account is inactive. Please contact administrator.'},
            status=401
        )
    
    # Allow access if user is superuser (for admin dashboard) OR is an agent (for agent dashboard)
    if not (user.is_superuser or user.is_agent):
        return JsonResponse(
            {'error': 'You do not have permission to access the dashboard. Admin dashboard requires superuser privileges.'},
            status=403
        )
    
    login(request, user)
    
    # Check if password change is required
    must_change_password = getattr(user, 'must_change_password', False)
    
    response = JsonResponse({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_agent': user.is_agent,
        },
        'must_change_password': must_change_password
    })
    
    # Ensure CORS headers are set for credentials
    # django-cors-headers should handle this, but we ensure it's explicit
    response['Access-Control-Allow-Credentials'] = 'true'
    
    # Ensure session cookie is set with correct attributes for cross-origin
    # Django's login() should handle this, but we ensure the session is saved
    request.session.save()
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def dashboard_logout(request):
    """Logout endpoint for dashboard"""
    logout(request)
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([AllowAny])  # Check auth in view so we can return 401 vs 403
@authentication_classes([CSRFExemptSessionAuthentication])
def get_current_user(request):
    """Get current authenticated user. Returns 401 if not logged in, 403 if not allowed."""
    # 401: not authenticated (no/invalid session cookie)
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    # 403: authenticated but not allowed (must be staff, superuser, or agent)
    if not (request.user.is_superuser or request.user.is_staff or getattr(request.user, 'is_agent', False)):
        return Response(
            {
                'error': 'You do not have permission to access the dashboard. '
                         'Dashboard requires staff, superuser, or agent privileges.'
            },
            status=status.HTTP_403_FORBIDDEN
        )
    
    must_change_password = getattr(request.user, 'must_change_password', False)
    
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
        'is_agent': request.user.is_agent,
        'must_change_password': must_change_password
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def dashboard_stats(request):
    """Get overall dashboard statistics - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    total_properties = Property.objects.count()
    available_properties = Property.objects.filter(status='available').count()
    sold_properties = Property.objects.filter(status='sold').count()
    rented_properties = Property.objects.filter(status='rented').count()
    featured_properties = Property.objects.filter(featured=True).count()
    
    total_contacts = Contact.objects.count()
    pending_viewings = ViewingRequest.objects.filter(status='pending').count()
    confirmed_viewings = ViewingRequest.objects.filter(status='confirmed').count()
    
    total_agents = Agent.objects.count()
    total_users = User.objects.count()
    
    # Revenue calculations
    total_sale_value = Property.objects.filter(
        is_for_sale=True, status='sold'
    ).aggregate(total=Sum('price'))['total'] or 0
    
    monthly_rental_revenue = Property.objects.filter(
        is_for_rent=True, status='rented'
    ).aggregate(total=Sum('rental_price_per_night'))['total'] or 0
    
    # Time-based stats
    this_month = timezone.now().replace(day=1)
    properties_this_month = Property.objects.filter(
        created_at__gte=this_month
    ).count()
    
    contacts_this_month = Contact.objects.filter(
        created_at__gte=this_month
    ).count()
    
    # Growth calculation
    last_month = this_month - timedelta(days=30)
    properties_last_month = Property.objects.filter(
        created_at__gte=last_month,
        created_at__lt=this_month
    ).count()
    
    property_growth = ((properties_this_month - properties_last_month) / 
                      max(properties_last_month, 1)) * 100 if properties_last_month > 0 else 0
    
    return Response({
        'properties': {
            'total': total_properties,
            'available': available_properties,
            'sold': sold_properties,
            'rented': rented_properties,
            'featured': featured_properties,
            'this_month': properties_this_month,
            'growth_percentage': round(property_growth, 2)
        },
        'contacts': {
            'total': total_contacts,
            'this_month': contacts_this_month,
            'pending_viewings': pending_viewings,
            'confirmed_viewings': confirmed_viewings
        },
        'users': {
            'total': total_users,
            'agents': total_agents
        },
        'revenue': {
            'total_sales': float(total_sale_value),
            'monthly_rentals': float(monthly_rental_revenue)
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def property_analytics(request):
    """Get property analytics data - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Property type distribution
    property_types = Property.objects.values('property_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Status distribution
    status_distribution = Property.objects.values('status').annotate(
        count=Count('id')
    )
    
    # Properties by city
    properties_by_city = Property.objects.values('city').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Properties by country
    properties_by_country = Property.objects.values('country').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Price statistics
    price_stats = Property.objects.aggregate(
        avg_price=Avg('price'),
        min_price=Min('price'),
        max_price=Max('price')
    )
    
    # Monthly property creation trend (last 12 months)
    monthly_trend = []
    for i in range(11, -1, -1):
        month_start = (timezone.now() - timedelta(days=30*i)).replace(day=1)
        if month_start.day != 1:
            month_start = month_start.replace(day=1)
        try:
            month_end = (month_start + timedelta(days=32)).replace(day=1)
        except:
            month_end = month_start + timedelta(days=32)
        count = Property.objects.filter(
            created_at__gte=month_start,
            created_at__lt=month_end
        ).count()
        monthly_trend.append({
            'month': month_start.strftime('%Y-%m'),
            'count': count
        })
    
    return Response({
        'property_types': list(property_types),
        'status_distribution': list(status_distribution),
        'by_city': list(properties_by_city),
        'by_country': list(properties_by_country),
        'price_stats': {
            'avg_price': float(price_stats['avg_price'] or 0),
            'min_price': float(price_stats['min_price'] or 0),
            'max_price': float(price_stats['max_price'] or 0),
        },
        'monthly_trend': monthly_trend
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def recent_activity(request):
    """Get recent activity feed - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    recent_properties = Property.objects.order_by('-created_at')[:10]
    recent_contacts = Contact.objects.order_by('-created_at')[:10]
    recent_viewings = ViewingRequest.objects.select_related('property').order_by('-created_at')[:10]
    
    return Response({
        'properties': [
            {
                'id': p.id,
                'title': p.title,
                'city': p.city,
                'status': p.status,
                'created_at': p.created_at.isoformat()
            } for p in recent_properties
        ],
        'contacts': [
            {
                'id': c.id,
                'name': c.name,
                'email': c.email,
                'subject': c.subject,
                'created_at': c.created_at.isoformat()
            } for c in recent_contacts
        ],
        'viewings': [
            {
                'id': v.id,
                'property_title': v.property.title if v.property else 'N/A',
                'preferred_date': str(v.preferred_date) if v.preferred_date else None,
                'status': v.status,
                'created_at': v.created_at.isoformat()
            } for v in recent_viewings
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def top_performers(request):
    """Get top performing properties and agents - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Top featured properties
    top_properties = Property.objects.filter(
        featured=True
    ).order_by('-created_at')[:5]
    
    # Top agents by property count (if agent relationship exists)
    # For now, we'll return all agents
    top_agents = Agent.objects.all()[:5]
    
    return Response({
        'top_properties': [
            {
                'id': p.id,
                'title': p.title,
                'city': p.city,
                'price': float(p.price),
                'status': p.status
            } for p in top_properties
        ],
        'top_agents': [
            {
                'id': a.id,
                'name': f"{a.user.first_name} {a.user.last_name}" if a.user.first_name or a.user.last_name else a.user.username,
                'email': a.user.email,
                'specialization': a.specialization
            } for a in top_agents
        ]
    })


@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def update_property(request, property_id):
    """Update an existing property - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to update properties'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        property_obj = Property.objects.get(id=property_id)
        
        # Update property fields
        if 'title' in request.data:
            property_obj.title = request.data.get('title')
        if 'description' in request.data:
            property_obj.description = request.data.get('description', '')
        if 'property_type' in request.data:
            property_obj.property_type = request.data.get('property_type')
        if 'status' in request.data:
            new_status = request.data.get('status')
            old_status = property_obj.status
            property_obj.status = new_status
            # Auto-set default development_type when status is changed to 'development'
            if new_status == 'development' and not property_obj.development_type:
                property_obj.development_type = 'new_development'  # Default value
            # Clear development_type when status is changed away from 'development'
            elif old_status == 'development' and new_status != 'development':
                property_obj.development_type = None
        if 'development_type' in request.data:
            development_type = request.data.get('development_type')
            # Only set development_type if status is 'development'
            if property_obj.status == 'development':
                property_obj.development_type = development_type if development_type else None
            else:
                property_obj.development_type = None
        if 'address' in request.data:
            property_obj.address = request.data.get('address')
        if 'city' in request.data:
            property_obj.city = request.data.get('city')
        if 'state' in request.data:
            property_obj.state = request.data.get('state', '')
        if 'zip_code' in request.data:
            property_obj.zip_code = request.data.get('zip_code', '')
        if 'country' in request.data:
            property_obj.country = request.data.get('country', 'Kenya')
        if 'bedrooms' in request.data:
            property_obj.bedrooms = request.data.get('bedrooms', '0')
        if 'bathrooms' in request.data:
            property_obj.bathrooms = request.data.get('bathrooms', '0')
        if 'square_feet' in request.data:
            square_feet = request.data.get('square_feet')
            if square_feet:
                try:
                    property_obj.square_feet = int(square_feet)
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'Invalid value for square_feet. Must be a number.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                property_obj.square_feet = None
        if 'max_guests' in request.data:
            try:
                property_obj.max_guests = int(request.data.get('max_guests', 2))
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid value for max_guests. Must be a number.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if 'price' in request.data:
            try:
                property_obj.price = float(request.data.get('price', 0))
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid value for price. Must be a number.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if 'rental_price_per_night' in request.data:
            rental_price = request.data.get('rental_price_per_night')
            if rental_price:
                try:
                    property_obj.rental_price_per_night = float(rental_price)
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'Invalid value for rental_price_per_night. Must be a number.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                property_obj.rental_price_per_night = None
        if 'currency' in request.data:
            property_obj.currency = request.data.get('currency', 'KSH')
        if 'is_for_sale' in request.data:
            property_obj.is_for_sale = parse_boolean(request.data.get('is_for_sale', True))
        if 'is_for_rent' in request.data:
            property_obj.is_for_rent = parse_boolean(request.data.get('is_for_rent', False))
        if 'featured' in request.data:
            property_obj.featured = parse_boolean(request.data.get('featured', False))
        if 'rental_duration' in request.data:
            property_obj.rental_duration = request.data.get('rental_duration', None)
        
        # Handle amenities
        if 'amenities' in request.data:
            amenities = []
            if hasattr(request.data, 'getlist'):
                amenities = request.data.getlist('amenities')
            else:
                amenities_data = request.data.get('amenities', [])
                if isinstance(amenities_data, list):
                    amenities = amenities_data
                elif isinstance(amenities_data, str):
                    import json
                    try:
                        amenities = json.loads(amenities_data)
                    except:
                        amenities = [amenities_data] if amenities_data else []
            property_obj.amenities = amenities
        
        # Handle main image
        main_image = request.FILES.get('main_image')
        if main_image:
            property_obj.main_image = main_image
        
        property_obj.save()
        
        # Handle image deletions
        import logging
        logger = logging.getLogger(__name__)
        
        # Log all available data
        logger.info(f"Request data keys: {list(request.data.keys())}")
        logger.info(f"Request data type: {type(request.data)}")
        logger.info(f"Has getlist method: {hasattr(request.data, 'getlist')}")
        
        images_to_delete = []
        
        # First try to get the raw value
        images_data = request.data.get('images_to_delete', [])
        logger.info(f"Got images_to_delete raw: {images_data} (type: {type(images_data)})")
        
        if isinstance(images_data, list) and len(images_data) > 0:
            # If it's a list, use it directly
            images_to_delete = images_data
            logger.info(f"Used as list: {images_to_delete}")
        elif isinstance(images_data, str) and images_data:
            # If it's a JSON string, parse it
            import json
            try:
                images_to_delete = json.loads(images_data)
                logger.info(f"Parsed JSON: {images_to_delete}")
            except Exception as e:
                logger.error(f"JSON parse error: {e}")
                images_to_delete = [images_data] if images_data else []
                logger.info(f"Fallback to single item: {images_to_delete}")
        elif hasattr(request.data, 'getlist'):
            # Fallback to getlist if available (but this usually doesn't work for FormData JSON values)
            images_to_delete = request.data.getlist('images_to_delete')
            logger.info(f"Got images_to_delete via getlist: {images_to_delete}")
        
        # Handle case where getlist returns empty but the field contains a JSON string
        if not images_to_delete and hasattr(request.data, 'getlist'):
            # Try to get the first value from getlist and parse it as JSON
            getlist_result = request.data.getlist('images_to_delete')
            if getlist_result and len(getlist_result) > 0:
                first_value = getlist_result[0]
                if isinstance(first_value, str):
                    import json
                    try:
                        images_to_delete = json.loads(first_value)
                        logger.info(f"Parsed JSON from getlist first value: {images_to_delete}")
                    except Exception as e:
                        logger.error(f"Failed to parse JSON from getlist first value: {e}")
                        images_to_delete = getlist_result
                        logger.info(f"Using getlist result as-is: {images_to_delete}")
                else:
                    images_to_delete = getlist_result
                    logger.info(f"Using getlist result directly: {images_to_delete}")
        
        logger.info(f"Final images to delete: {images_to_delete}")
        
        from django.db import transaction
        deleted_count = 0
        
        with transaction.atomic():
            for image_id in images_to_delete:
                try:
                    int_id = int(image_id)
                    
                    # Check if image exists before deletion
                    exists_before = PropertyImage.objects.filter(id=int_id, property=property_obj).exists()
                    logger.info(f"Image {int_id} exists before deletion: {exists_before}")
                    
                    if exists_before:
                        deleted_objects = PropertyImage.objects.filter(id=int_id, property=property_obj).delete()
                        deleted_count += deleted_objects[0]
                        logger.info(f"Deleted image with ID {image_id}, deleted count: {deleted_objects[0]}")
                        
                        # Verify deletion
                        exists_after = PropertyImage.objects.filter(id=int_id, property=property_obj).exists()
                        logger.info(f"Image {int_id} exists after deletion: {exists_after}")
                    else:
                        logger.warning(f"Image {int_id} not found for deletion")
                        
                except (ValueError, TypeError) as e:
                    logger.error(f"Invalid image ID {image_id}: {e}")
                except Exception as e:
                    logger.error(f"Failed to delete image {image_id}: {e}")
        
        logger.info(f"Total images deleted: {deleted_count}")
        
        # Handle additional images
        images = request.FILES.getlist('images')
        for index, image in enumerate(images):
            PropertyImage.objects.create(
                property=property_obj,
                image=image,
                alt_text=f"{property_obj.title} - Image {index + 1}",
                order=PropertyImage.objects.filter(property=property_obj).count()
            )
        
        # Re-fetch property from database to ensure we have fresh data including related objects
        property_obj = Property.objects.get(id=property_id)
        
        # Return updated property
        from properties.serializers import PropertySerializer
        serializer = PropertySerializer(property_obj)
        
        return Response({
            'success': True,
            'property': serializer.data
        })
        
    except Property.DoesNotExist:
        return Response(
            {'error': 'Property not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError as e:
        return Response(
            {'error': f'Invalid data format: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        import traceback
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating property {property_id}: {str(e)}\n{traceback.format_exc()}")
        return Response(
            {'error': f'An error occurred while updating the property: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def list_properties(request):
    """List all properties - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to view properties'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from properties.serializers import PropertySerializer
    properties = Property.objects.all().order_by('-created_at')
    serializer = PropertySerializer(properties, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def get_property(request, property_id):
    """Get a single property - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to view properties'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        property_obj = Property.objects.get(id=property_id)
        from properties.serializers import PropertySerializer
        serializer = PropertySerializer(property_obj)
        return Response(serializer.data)
    except Property.DoesNotExist:
        return Response(
            {'error': 'Property not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def create_property(request):
    """Create a new property with images - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to create properties'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Extract property data
        property_data = {
            'title': request.data.get('title'),
            'description': request.data.get('description', ''),
            'property_type': request.data.get('property_type'),
            'status': request.data.get('status', 'available'),
            'development_type': request.data.get('development_type') or None,
            'address': request.data.get('address'),
            'city': request.data.get('city'),
            'state': request.data.get('state', ''),
            'zip_code': request.data.get('zip_code', ''),
            'country': request.data.get('country', 'Kenya'),
            'bedrooms': request.data.get('bedrooms', '0'),
            'bathrooms': request.data.get('bathrooms', '0'),
            'square_feet': int(request.data.get('square_feet', 0)) if request.data.get('square_feet') else None,
            'max_guests': int(request.data.get('max_guests', 2)),
            'price': float(request.data.get('price', 0)),
            'rental_price_per_night': float(request.data.get('rental_price_per_night', 0)) if request.data.get('rental_price_per_night') else None,
            'currency': request.data.get('currency', 'KSH'),
        }
        
        # Handle boolean fields - support both boolean and string values
        property_data['is_for_sale'] = parse_boolean(request.data.get('is_for_sale', True))
        property_data['is_for_rent'] = parse_boolean(request.data.get('is_for_rent', False))
        property_data['featured'] = parse_boolean(request.data.get('featured', False))
        property_data['rental_duration'] = request.data.get('rental_duration', None)
        
        # Handle amenities - FormData sends them as multiple fields with same name
        amenities = []
        if 'amenities' in request.data:
            # Django QueryDict has getlist method for multiple values
            if hasattr(request.data, 'getlist'):
                amenities = request.data.getlist('amenities')
            else:
                amenities_data = request.data.get('amenities', [])
                if isinstance(amenities_data, list):
                    amenities = amenities_data
                elif isinstance(amenities_data, str):
                    import json
                    try:
                        amenities = json.loads(amenities_data)
                    except:
                        amenities = [amenities_data] if amenities_data else []
        
        property_data['amenities'] = amenities
        
        # Auto-set default development_type when status is 'development'
        if property_data.get('status') == 'development' and not property_data.get('development_type'):
            property_data['development_type'] = 'new_development'  # Default value
        
        # Handle main image
        main_image = request.FILES.get('main_image')
        if main_image:
            property_data['main_image'] = main_image
        
        # Create property
        property_obj = Property.objects.create(**property_data)
        
        # Handle multiple images
        images = request.FILES.getlist('images')
        for index, image in enumerate(images):
            PropertyImage.objects.create(
                property=property_obj,
                image=image,
                alt_text=f"{property_obj.title} - Image {index + 1}",
                order=index
            )
        
        # Return created property
        from properties.serializers import PropertySerializer
        serializer = PropertySerializer(property_obj)
        
        return Response({
            'success': True,
            'property': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def delete_property(request, property_id):
    """Delete a property - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to delete properties'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        property_obj = Property.objects.get(id=property_id)
        property_obj.delete()
        
        return Response({
            'success': True,
            'message': 'Property deleted successfully'
        })
        
    except Property.DoesNotExist:
        return Response(
            {'error': 'Property not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def create_agent(request):
    """Create a new agent with temporary password and send welcome email"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You must be a staff member to create agents'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from django.contrib.auth import get_user_model
        from accounts.utils import generate_temporary_password, send_agent_welcome_email
        User = get_user_model()
        
        # Create user first
        user_data = {
            'username': request.data.get('username'),
            'email': request.data.get('email'),
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'phone_number': request.data.get('phone_number', ''),
            'is_agent': True,
            'must_change_password': True,  # Require password change on first login
        }
        
        # Check if user already exists
        if User.objects.filter(username=user_data['username']).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=user_data['email']).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate temporary password
        temporary_password = generate_temporary_password()
        
        # Create user with temporary password
        user = User.objects.create_user(
            password=temporary_password,
            **user_data
        )
        
        # Create agent profile
        agent = Agent.objects.create(
            user=user,
            license_number=request.data.get('license_number', ''),
            years_experience=int(request.data.get('years_experience', 0)),
            specialization=request.data.get('specialization', ''),
        )
        
        # Send welcome email with temporary password
        email_sent = send_agent_welcome_email(user, temporary_password)
        
        from accounts.serializers import AgentSerializer
        serializer = AgentSerializer(agent)
        
        return Response({
            'success': True,
            'agent': serializer.data,
            'email_sent': email_sent,
            'message': 'Agent created successfully. Welcome email sent.' if email_sent else 'Agent created but email failed to send.'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def update_agent(request, agent_id):
    """Update an existing agent"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You must be a staff member to update agents'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        agent = Agent.objects.get(id=agent_id)
        user = agent.user
        
        # Update user fields
        if 'email' in request.data:
            user.email = request.data['email']
        if 'first_name' in request.data:
            user.first_name = request.data.get('first_name', '')
        if 'last_name' in request.data:
            user.last_name = request.data.get('last_name', '')
        if 'phone_number' in request.data:
            user.phone_number = request.data.get('phone_number', '')
        user.save()
        
        # Update agent fields
        if 'license_number' in request.data:
            agent.license_number = request.data.get('license_number', '')
        if 'years_experience' in request.data:
            agent.years_experience = int(request.data.get('years_experience', 0))
        if 'specialization' in request.data:
            agent.specialization = request.data.get('specialization', '')
        agent.save()
        
        from accounts.serializers import AgentSerializer
        serializer = AgentSerializer(agent)
        
        return Response({
            'success': True,
            'agent': serializer.data
        })
        
    except Agent.DoesNotExist:
        return Response(
            {'error': 'Agent not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def delete_agent(request, agent_id):
    """Delete an agent - only superusers can delete agents"""
    # Check if user is authenticated
    if not request.user or not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Only superusers can delete agents
    if not request.user.is_superuser:
        return Response(
            {'error': 'You must be a superuser to delete agents'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        agent = Agent.objects.get(id=agent_id)
        user = agent.user
        
        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response(
                {'error': 'You cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent.delete()
        user.delete()  # Also delete the associated user
        
        return Response({
            'success': True,
            'message': 'Agent deleted successfully'
        })
        
    except Agent.DoesNotExist:
        return Response(
            {'error': 'Agent not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """Create a new user"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You must be a staff member to create users'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email, and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            phone_number=request.data.get('phone_number', ''),
            is_agent=parse_boolean(request.data.get('is_agent', False)),
            is_staff=parse_boolean(request.data.get('is_staff', False)),
            is_superuser=parse_boolean(request.data.get('is_superuser', False)),
        )
        
        from accounts.serializers import UserSerializer
        serializer = UserSerializer(user)
        
        return Response({
            'success': True,
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """Update an existing user"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You must be a staff member to update users'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        
        # Update user fields
        if 'email' in request.data:
            # Check if email is already taken by another user
            if User.objects.filter(email=request.data['email']).exclude(id=user_id).exists():
                return Response(
                    {'error': 'Email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = request.data['email']
        
        if 'first_name' in request.data:
            user.first_name = request.data.get('first_name', '')
        if 'last_name' in request.data:
            user.last_name = request.data.get('last_name', '')
        if 'phone_number' in request.data:
            user.phone_number = request.data.get('phone_number', '')
        if 'is_agent' in request.data:
            user.is_agent = parse_boolean(request.data.get('is_agent', False))
        if 'is_staff' in request.data:
            user.is_staff = parse_boolean(request.data.get('is_staff', False))
        if 'is_superuser' in request.data:
            user.is_superuser = parse_boolean(request.data.get('is_superuser', False))
        
        # Update password if provided
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])
        
        user.save()
        
        from accounts.serializers import UserSerializer
        serializer = UserSerializer(user)
        
        return Response({
            'success': True,
            'user': serializer.data
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """Delete a user"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You must be a staff member to delete users'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        
        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response(
                {'error': 'You cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.delete()
        
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def change_password(request):
    """Change password for authenticated user (especially for agents with temporary password)"""
    try:
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not new_password or not confirm_password:
            return Response(
                {'error': 'New password and confirmation are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        
        # If user must change password, don't require old password
        if getattr(user, 'must_change_password', False):
            user.set_password(new_password)
            user.must_change_password = False
            user.save()
            # Re-authenticate user to keep session valid after password change
            update_session_auth_hash(request, user)
            # Determine dashboard route based on user role
            if user.is_agent and not (user.is_staff or user.is_superuser):
                dashboard_route = '/admin/agent'
            else:
                dashboard_route = '/admin'
            return Response({
                'success': True,
                'message': 'Password changed successfully.',
                'redirect_to_dashboard': True,
                'dashboard_route': dashboard_route,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_agent': user.is_agent,
                    'must_change_password': False
                }
            })
        
        # Otherwise, require old password
        if not old_password:
            return Response(
                {'error': 'Old password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify old password
        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        # Re-authenticate user to keep session valid after password change
        update_session_auth_hash(request, user)
        
        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def agent_analytics(request):
    """Get analytics data for agents - accessible by superusers and agents"""
    if not (request.user.is_superuser or request.user.is_agent):
        return Response(
            {'error': 'You do not have permission to access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # If user is an agent, show only their data
    # If user is staff/admin, show all data
    
    if request.user.is_agent:
        # Agent-specific analytics
        # For now, show general property analytics
        # In the future, you can filter by agent if you add agent_id to Property model
        total_properties = Property.objects.count()
        available_properties = Property.objects.filter(status='available').count()
        sold_properties = Property.objects.filter(status='sold').count()
        rented_properties = Property.objects.filter(status='rented').count()
        
        # Price statistics
        price_stats = Property.objects.aggregate(
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price')
        )
        
        # Property type distribution
        property_types = Property.objects.values('property_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Properties by city
        properties_by_city = Property.objects.values('city').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'properties': {
                'total': total_properties,
                'available': available_properties,
                'sold': sold_properties,
                'rented': rented_properties,
            },
            'price_stats': {
                'avg_price': float(price_stats['avg_price'] or 0),
                'min_price': float(price_stats['min_price'] or 0),
                'max_price': float(price_stats['max_price'] or 0),
            },
            'property_types': list(property_types),
            'by_city': list(properties_by_city),
        })
    else:
        # Admin/staff - return full analytics (same as property_analytics)
        return property_analytics(request)


# Page Management Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pages(request):
    """List all pages - accessible by superusers only"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view pages'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from pages.serializers import PageSerializer
    pages = Page.objects.all().order_by('order', 'title')
    serializer = PageSerializer(pages, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_page(request, page_id):
    """Get a single page"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view pages'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        page = Page.objects.get(id=page_id)
        from pages.serializers import PageSerializer
        serializer = PageSerializer(page)
        return Response(serializer.data)
    except Page.DoesNotExist:
        return Response(
            {'error': 'Page not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def create_page(request):
    """Create a new page with support for type-specific fields and file uploads"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to create pages'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from pages.serializers import PageSerializer
        import json
        
        # Handle both FormData (with files) and JSON
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Parse JSON fields if they come as strings
        if 'faq_items' in data:
            if isinstance(data['faq_items'], str):
                try:
                    data['faq_items'] = json.loads(data['faq_items'])
                except:
                    data['faq_items'] = []
        
        # Handle related_pages (can come as multiple form fields or list)
        if 'related_pages' in data:
            if isinstance(data['related_pages'], list):
                # Already a list, convert to integers
                try:
                    data['related_pages'] = [int(x) for x in data['related_pages'] if x]
                except:
                    data['related_pages'] = []
            elif isinstance(data['related_pages'], str):
                # Single value as string
                try:
                    data['related_pages'] = [int(data['related_pages'])]
                except:
                    data['related_pages'] = []
            else:
                # Single value
                try:
                    data['related_pages'] = [int(data['related_pages'])] if data['related_pages'] else []
                except:
                    data['related_pages'] = []
        
        # Convert boolean strings to actual booleans
        if 'is_published' in data:
            if isinstance(data['is_published'], str):
                data['is_published'] = data['is_published'].lower() == 'true'
        if 'allow_comments' in data:
            if isinstance(data['allow_comments'], str):
                data['allow_comments'] = data['allow_comments'].lower() == 'true'
        
        # Convert empty strings to None for date fields
        date_fields = ['application_deadline', 'effective_date', 'expiry_date']
        for field in date_fields:
            if field in data and data[field] == '':
                data[field] = None
        
        serializer = PageSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            page = serializer.save()
            
            # If this is a careers page, automatically create a Job entry
            if page.page_type == 'careers' and page.job_title:
                try:
                    from careers.models import Job
                    from django.utils import timezone
                    
                    # Map Page fields to Job fields
                    job_data = {
                        'title': page.job_title,
                        'department': page.department or 'General',  # Use default if not provided
                        'location': page.location or '',
                        'job_type': page.job_type or 'Full-Time',
                        'description': page.content or page.excerpt or '',
                        'responsibilities': page.content or page.excerpt or '',
                        'requirements': page.content or page.excerpt or '',
                    }
                    
                    # Convert application_deadline from DateField to DateField for Job
                    if page.application_deadline:
                        job_data['deadline'] = page.application_deadline
                    
                    # Create the Job entry
                    Job.objects.create(**job_data)
                except Exception as job_error:
                    # Log the error but don't fail the page creation
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to create Job entry for careers page: {str(job_error)}")
            
            return Response({
                'success': True,
                'page': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        return Response(
            {'error': str(e), 'traceback': traceback.format_exc()},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def update_page(request, page_id):
    """Update an existing page with support for type-specific fields and file uploads"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to update pages'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        page = Page.objects.get(id=page_id)
        from pages.serializers import PageSerializer
        import json
        
        # Handle both FormData (with files) and JSON
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Parse JSON fields if they come as strings
        if 'faq_items' in data:
            if isinstance(data['faq_items'], str):
                try:
                    data['faq_items'] = json.loads(data['faq_items'])
                except:
                    data['faq_items'] = []
        
        # Handle related_pages (can come as multiple form fields or list)
        if 'related_pages' in data:
            if isinstance(data['related_pages'], list):
                # Already a list, convert to integers
                try:
                    data['related_pages'] = [int(x) for x in data['related_pages'] if x]
                except:
                    data['related_pages'] = []
            elif isinstance(data['related_pages'], str):
                # Single value as string
                try:
                    data['related_pages'] = [int(data['related_pages'])]
                except:
                    data['related_pages'] = []
            else:
                # Single value
                try:
                    data['related_pages'] = [int(data['related_pages'])] if data['related_pages'] else []
                except:
                    data['related_pages'] = []
        
        # Convert boolean strings to actual booleans
        if 'is_published' in data:
            if isinstance(data['is_published'], str):
                data['is_published'] = data['is_published'].lower() == 'true'
        if 'allow_comments' in data:
            if isinstance(data['allow_comments'], str):
                data['allow_comments'] = data['allow_comments'].lower() == 'true'
        
        # Convert empty strings to None for date fields
        date_fields = ['application_deadline', 'effective_date', 'expiry_date']
        for field in date_fields:
            if field in data and data[field] == '':
                data[field] = None
        
        serializer = PageSerializer(page, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'page': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Page.DoesNotExist:
        return Response(
            {'error': 'Page not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        return Response(
            {'error': str(e), 'traceback': traceback.format_exc()},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def delete_page(request, page_id):
    """Delete a page"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to delete pages'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        page = Page.objects.get(id=page_id)
        page.delete()
        return Response({
            'success': True,
            'message': 'Page deleted successfully'
        })
    except Page.DoesNotExist:
        return Response(
            {'error': 'Page not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


# Announcement Management Endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def list_announcements(request):
    """List all active announcements - public endpoint"""
    try:
        from announcements.serializers import AnnouncementListSerializer
        
        now = timezone.now()
        announcements = Announcement.objects.filter(
            is_active=True
        ).filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now)
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        ).order_by('-created_at')
        
        serializer = AnnouncementListSerializer(announcements, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_major_announcements(request):
    """Get active major announcements for banner display below navbar - public endpoint"""
    try:
        from announcements.serializers import AnnouncementSerializer
        
        now = timezone.now()
        announcements = Announcement.objects.filter(
            is_major=True,
            is_active=True
        ).filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now)
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        ).order_by('-created_at')
        
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_announcements(request):
    """List all announcements for admin management"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view announcements'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from announcements.serializers import AnnouncementSerializer
        announcements = Announcement.objects.all().order_by('-created_at')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_announcement(request, announcement_id):
    """Get a single announcement"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view announcements'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
        from announcements.serializers import AnnouncementSerializer
        serializer = AnnouncementSerializer(announcement)
        return Response(serializer.data)
    except Announcement.DoesNotExist:
        return Response(
            {'error': 'Announcement not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def create_announcement(request):
    """Create a new announcement"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to create announcements'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from announcements.serializers import AnnouncementSerializer
        from django.utils.dateparse import parse_datetime
        
        # Extract data from request (handles both JSON and FormData)
        title = request.data.get('title')
        message = request.data.get('message')
        url = request.data.get('url')
        is_major = request.data.get('is_major', 'false')
        is_active = request.data.get('is_active', 'true')
        display_duration = request.data.get('display_duration', '5')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        image_file = request.FILES.get('image')
        
        # Convert string booleans to actual booleans
        is_major = str(is_major).lower() == 'true' if is_major else False
        is_active = str(is_active).lower() == 'true' if is_active else True
        
        # Convert display_duration to int
        try:
            display_duration = int(display_duration) if display_duration else 5
        except (ValueError, TypeError):
            display_duration = 5
        
        # Parse datetime strings if provided
        parsed_start_date = None
        if start_date:
            try:
                parsed_start_date = parse_datetime(start_date)
            except:
                pass
        
        parsed_end_date = None
        if end_date:
            try:
                parsed_end_date = parse_datetime(end_date)
            except:
                pass
        
        # Prepare data for serializer
        serializer_data = {
            'title': title,
            'message': message,
            'is_major': is_major,
            'is_active': is_active,
            'display_duration': display_duration,
            'created_by': request.user.id,
        }
        
        if url:
            serializer_data['url'] = url
        
        if parsed_start_date:
            serializer_data['start_date'] = parsed_start_date
        if parsed_end_date:
            serializer_data['end_date'] = parsed_end_date
        
        serializer = AnnouncementSerializer(data=serializer_data)
        if serializer.is_valid():
            announcement = serializer.save()
            
            # Handle image upload
            if image_file:
                announcement.image = image_file
                announcement.save()
            
            return Response({
                'success': True,
                'announcement': AnnouncementSerializer(announcement).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def update_announcement(request, announcement_id):
    """Update an existing announcement"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to update announcements'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
        from announcements.serializers import AnnouncementSerializer
        from django.utils.dateparse import parse_datetime
        
        # Extract data from request (handles both JSON and FormData)
        title = request.data.get('title')
        message = request.data.get('message')
        is_major = request.data.get('is_major')
        is_active = request.data.get('is_active')
        display_duration = request.data.get('display_duration')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        image_file = request.FILES.get('image')
        
        # Prepare data for serializer (only include fields that are provided)
        serializer_data = {}
        
        if title is not None:
            serializer_data['title'] = title
        if message is not None:
            serializer_data['message'] = message
        if is_major is not None:
            serializer_data['is_major'] = str(is_major).lower() == 'true'
        if is_active is not None:
            serializer_data['is_active'] = str(is_active).lower() == 'true'
        if display_duration is not None:
            try:
                serializer_data['display_duration'] = int(display_duration)
            except (ValueError, TypeError):
                pass
        
        # Parse datetime strings if provided
        if start_date is not None:
            if start_date == '':
                serializer_data['start_date'] = None
            else:
                try:
                    parsed_start_date = parse_datetime(start_date)
                    if parsed_start_date:
                        serializer_data['start_date'] = parsed_start_date
                except:
                    pass
        
        if end_date is not None:
            if end_date == '':
                serializer_data['end_date'] = None
            else:
                try:
                    parsed_end_date = parse_datetime(end_date)
                    if parsed_end_date:
                        serializer_data['end_date'] = parsed_end_date
                except:
                    pass
        
        serializer = AnnouncementSerializer(announcement, data=serializer_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Handle image upload
            if image_file:
                announcement.image = image_file
                announcement.save()
            elif 'image' in request.data and request.data.get('image') == '':
                # Remove image if empty string is sent
                announcement.image = None
                announcement.save()
            
            return Response({
                'success': True,
                'announcement': AnnouncementSerializer(announcement).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Announcement.DoesNotExist:
        return Response(
            {'error': 'Announcement not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def delete_announcement(request, announcement_id):
    """Delete an announcement"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to delete announcements'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
        announcement.delete()
        return Response({
            'success': True,
            'message': 'Announcement deleted successfully'
        })
    except Announcement.DoesNotExist:
        return Response(
            {'error': 'Announcement not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
# ==================== TESTIMONIALS ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_testimonials(request):
    """List all active testimonials - public endpoint"""
    try:
        from testimonials.serializers import TestimonialListSerializer
        testimonials = Testimonial.objects.filter(is_active=True).order_by('-created_at')
        serializer = TestimonialListSerializer(testimonials, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_testimonials(request):
    """List all testimonials for admin management"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view testimonials'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from testimonials.serializers import TestimonialSerializer
        testimonials = Testimonial.objects.all().order_by('-created_at')
        serializer = TestimonialSerializer(testimonials, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_testimonial(request, testimonial_id):
    """Get a single testimonial"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view testimonials'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        testimonial = Testimonial.objects.get(id=testimonial_id)
        from testimonials.serializers import TestimonialSerializer
        serializer = TestimonialSerializer(testimonial, context={'request': request})
        return Response(serializer.data)
    except Testimonial.DoesNotExist:
        return Response(
            {'error': 'Testimonial not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def create_testimonial(request):
    """Create a new testimonial"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to create testimonials'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from testimonials.serializers import TestimonialSerializer
        
        # Extract data from request (handles both JSON and FormData)
        name = request.data.get('name')
        role = request.data.get('role')
        content = request.data.get('content')
        rating = request.data.get('rating', '5')
        is_active = request.data.get('is_active', 'true')
        company = request.data.get('company', '')
        image_file = request.FILES.get('image')
        
        # Convert string booleans to actual booleans
        is_active = str(is_active).lower() == 'true' if is_active else True
        
        # Convert rating to int
        try:
            rating = int(rating) if rating else 5
            if rating < 1 or rating > 5:
                rating = 5
        except (ValueError, TypeError):
            rating = 5
        
        # Validate required fields
        if not name or not role or not content:
            return Response(
                {'error': 'Name, role, and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create testimonial
        testimonial = Testimonial.objects.create(
            name=name,
            role=role,
            content=content,
            rating=rating,
            is_active=is_active,
            company=company,
            created_by=request.user
        )
        
        # Handle image upload
        if image_file:
            testimonial.image = image_file
            testimonial.save()
        
        serializer = TestimonialSerializer(testimonial, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def update_testimonial(request, testimonial_id):
    """Update an existing testimonial"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to update testimonials'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        testimonial = Testimonial.objects.get(id=testimonial_id)
        from testimonials.serializers import TestimonialSerializer
        
        # Extract data from request (handles both JSON and FormData)
        name = request.data.get('name')
        role = request.data.get('role')
        content = request.data.get('content')
        rating = request.data.get('rating')
        is_active = request.data.get('is_active')
        company = request.data.get('company')
        image_file = request.FILES.get('image')
        
        # Update fields if provided
        if name is not None:
            testimonial.name = name
        if role is not None:
            testimonial.role = role
        if content is not None:
            testimonial.content = content
        if rating is not None:
            try:
                rating_int = int(rating)
                if 1 <= rating_int <= 5:
                    testimonial.rating = rating_int
            except (ValueError, TypeError):
                pass
        if is_active is not None:
            testimonial.is_active = str(is_active).lower() == 'true'
        if company is not None:
            testimonial.company = company
        
        # Handle image upload
        if image_file:
            testimonial.image = image_file
        
        # Handle image removal (if empty string is sent)
        if 'image' in request.data and request.data['image'] == '':
            testimonial.image = None
        
        testimonial.save()
        
        serializer = TestimonialSerializer(testimonial, context={'request': request})
        return Response(serializer.data)
        
    except Testimonial.DoesNotExist:
        return Response(
            {'error': 'Testimonial not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_testimonial(request, testimonial_id):
    """Delete a testimonial"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to delete testimonials'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        testimonial = Testimonial.objects.get(id=testimonial_id)
        testimonial.delete()
        return Response({
            'success': True,
            'message': 'Testimonial deleted successfully'
        })
    except Testimonial.DoesNotExist:
        return Response(
            {'error': 'Testimonial not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

# Event Management Endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def list_events(request):
    """List all published events - public endpoint"""
    try:
        from events.serializers import EventListSerializer
        events = Event.objects.filter(is_published=True).order_by('event_date', 'event_time')
        serializer = EventListSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_events(request):
    """List all events for admin management"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view events'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from events.serializers import EventSerializer
        events = Event.objects.all().order_by('-event_date', '-event_time')
        serializer = EventSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_event(request, event_id):
    """Get a single event by ID - public endpoint"""
    try:
        event = Event.objects.get(id=event_id, is_published=True)
        from events.serializers import EventSerializer
        serializer = EventSerializer(event, context={'request': request})
        return Response(serializer.data)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_event_admin(request, event_id):
    """Get a single event for admin"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view events'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        event = Event.objects.get(id=event_id)
        from events.serializers import EventSerializer
        serializer = EventSerializer(event, context={'request': request})
        return Response(serializer.data)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def create_event(request):
    """Create a new event"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to create events'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from events.serializers import EventSerializer
        from django.utils.dateparse import parse_date, parse_time
        
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Parse dates
        if 'event_date' in data and data['event_date']:
            if isinstance(data['event_date'], str):
                try:
                    parsed_date = parse_date(data['event_date'])
                    if parsed_date:
                        data['event_date'] = parsed_date
                except:
                    pass
        
        if 'event_time' in data and data['event_time']:
            if isinstance(data['event_time'], str):
                try:
                    parsed_time = parse_time(data['event_time'])
                    if parsed_time:
                        data['event_time'] = parsed_time
                except:
                    pass
        
        # Automatically set is_published to True for all events
        data['is_published'] = True
        data['is_featured'] = False
        
        data['created_by'] = request.user.id
        
        serializer = EventSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            event = serializer.save()
            
            if 'featured_image' in request.FILES:
                event.featured_image = request.FILES['featured_image']
                event.save()
            
            return Response({
                'success': True,
                'event': EventSerializer(event, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        return Response(
            {'error': str(e), 'traceback': traceback.format_exc()},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def update_event(request, event_id):
    """Update an existing event"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to update events'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        event = Event.objects.get(id=event_id)
        from events.serializers import EventSerializer
        from django.utils.dateparse import parse_date, parse_time
        
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Parse dates
        if 'event_date' in data and data['event_date']:
            if isinstance(data['event_date'], str):
                try:
                    parsed_date = parse_date(data['event_date'])
                    if parsed_date:
                        data['event_date'] = parsed_date
                except:
                    pass
        
        if 'event_time' in data and data['event_time']:
            if isinstance(data['event_time'], str):
                try:
                    parsed_time = parse_time(data['event_time'])
                    if parsed_time:
                        data['event_time'] = parsed_time
                except:
                    pass
        
        # Automatically set is_published to True for all events
        data['is_published'] = True
        data['is_featured'] = False
        
        serializer = EventSerializer(event, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            event = serializer.save()
            
            if 'featured_image' in request.FILES:
                event.featured_image = request.FILES['featured_image']
                event.save()
            elif 'featured_image' in data and data['featured_image'] == '':
                event.featured_image = None
                event.save()
            
            return Response({
                'success': True,
                'event': EventSerializer(event, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        return Response(
            {'error': str(e), 'traceback': traceback.format_exc()},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def delete_event(request, event_id):
    """Delete an event"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to delete events'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        event = Event.objects.get(id=event_id)
        event.delete()
        return Response({
            'success': True,
            'message': 'Event deleted successfully'
        })
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


# ==================== ARTICLE MANAGEMENT ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_articles(request):
    """List all articles for admin dashboard"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view articles'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from news.serializers import ArticleListSerializer
        articles = NewsArticle.objects.all().order_by('-created_at')
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_article(request, article_id):
    """Get a single article by ID"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to view articles'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        article = NewsArticle.objects.get(id=article_id)
        from news.serializers import ArticleSerializer
        serializer = ArticleSerializer(article, context={'request': request})
        return Response(serializer.data)
    except NewsArticle.DoesNotExist:
        return Response(
            {'error': 'Article not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def create_article(request):
    """Create a new article"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to create articles'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from news.serializers import ArticleSerializer
        
        # Extract data from request (handles both JSON and FormData)
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Handle thumbnail file upload
        thumbnail_file = request.FILES.get('thumbnail')
        
        # Convert published string to boolean
        if 'published' in data:
            if isinstance(data['published'], str):
                data['published'] = data['published'].lower() == 'true'
        
        # Prepare data for serializer
        serializer_data = {
            'title': data.get('title'),
            'author': data.get('author'),
            'category': data.get('category', 'other'),
            'content': data.get('content'),
            'excerpt': data.get('excerpt'),
            'tags': data.get('tags', ''),
            'published': data.get('published', False),
        }
        
        # Handle slug if provided
        if 'slug' in data and data['slug']:
            serializer_data['slug'] = data['slug']
        
        serializer = ArticleSerializer(data=serializer_data, context={'request': request})
        if serializer.is_valid():
            article = serializer.save()
            
            # Handle thumbnail upload
            if thumbnail_file:
                article.thumbnail = thumbnail_file
                article.save()
            
            return Response({
                'success': True,
                'article': ArticleSerializer(article, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        return Response(
            {'error': str(e), 'traceback': traceback.format_exc()},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def update_article(request, article_id):
    """Update an existing article"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to update articles'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        article = NewsArticle.objects.get(id=article_id)
        from news.serializers import ArticleSerializer
        
        # Extract data from request
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        thumbnail_file = request.FILES.get('thumbnail')
        
        # Convert published string to boolean if provided
        if 'published' in data:
            if isinstance(data['published'], str):
                data['published'] = data['published'].lower() == 'true'
        
        serializer = ArticleSerializer(article, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            
            # Handle thumbnail upload
            if thumbnail_file:
                article.thumbnail = thumbnail_file
                article.save()
            elif 'thumbnail' in data and data.get('thumbnail') == '':
                # Remove thumbnail if empty string is sent
                article.thumbnail = None
                article.save()
            
            return Response({
                'success': True,
                'article': ArticleSerializer(article, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except NewsArticle.DoesNotExist:
        return Response(
            {'error': 'Article not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([CSRFExemptSessionAuthentication])
def delete_article(request, article_id):
    """Delete an article"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'You do not have permission to delete articles'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        article = NewsArticle.objects.get(id=article_id)
        article.delete()
        return Response({
            'success': True,
            'message': 'Article deleted successfully'
        })
    except NewsArticle.DoesNotExist:
        return Response(
            {'error': 'Article not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

