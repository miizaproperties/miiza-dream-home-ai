from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Contact, ViewingRequest
from .serializers import (
    ContactSerializer,
    ViewingRequestSerializer,
    ViewingRequestCreateSerializer
)


# Custom authentication class that doesn't require CSRF for public endpoints
class CSRFExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Skip CSRF check


@method_decorator(csrf_exempt, name='dispatch')
class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    authentication_classes = [CSRFExemptSessionAuthentication]
    
    def get_permissions(self):
        """
        Allow anyone to create contacts (public contact form),
        but require authentication for other actions
        """
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a contact as read"""
        contact = self.get_object()
        contact.is_read = True
        contact.save()
        return Response({'success': True, 'is_read': True})


@method_decorator(csrf_exempt, name='dispatch')
class ViewingRequestViewSet(viewsets.ModelViewSet):
    queryset = ViewingRequest.objects.select_related('property', 'contact').all()
    authentication_classes = [CSRFExemptSessionAuthentication]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ViewingRequestCreateSerializer
        return ViewingRequestSerializer
    
    def get_permissions(self):
        """
        Allow anyone to create viewing requests (public form),
        but require authentication for other actions
        """
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        """Override create to return full serialized response with reference number"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            viewing_request = serializer.save()
            
            # Return full serialized response
            response_serializer = ViewingRequestSerializer(viewing_request)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            import logging
            error_details = traceback.format_exc()
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating viewing request: {e}\n{error_details}")
            # Return user-friendly error message
            return Response(
                {'error': 'Failed to create viewing request. Please try again.', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def partial_update(self, request, *args, **kwargs):
        """Allow partial updates (PATCH) for status changes"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)