"""
URL configuration for miizarealtors project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/properties/', include('properties.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/contacts/', include('contacts.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/pages/', include('pages.urls')),
    path('api/news/', include('news.urls')),
    path('api/jobs/', include('careers.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
