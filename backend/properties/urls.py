from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, proxy_image, property_by_slug, property_by_slug_direct

router = DefaultRouter()
router.register(r'', PropertyViewSet)

# Explicit routes for ViewSet list actions must come BEFORE the slug catch-all,
# otherwise "suburbs" and "cities" are matched as property slugs and return 404.
suburbs_view = PropertyViewSet.as_view({'get': 'suburbs'})
cities_view = PropertyViewSet.as_view({'get': 'cities'})

urlpatterns = [
    path('slug/<slug:slug>/', property_by_slug, name='property_by_slug'),
    path('suburbs/', suburbs_view, name='properties-suburbs'),
    path('cities/', cities_view, name='properties-cities'),
    path('', include(router.urls)),
    path('<slug:slug>/', property_by_slug_direct, name='property_by_slug_direct'),
    path('images/<path:image_path>', proxy_image, name='proxy_image'),
]
