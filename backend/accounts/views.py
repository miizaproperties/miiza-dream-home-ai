from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Agent
from .serializers import UserSerializer, AgentSerializer

User = get_user_model()


# Custom authentication class that doesn't require CSRF
class CSRFExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Skip CSRF check


@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    authentication_classes = [CSRFExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return all users including admins and regular users"""
        return User.objects.all().order_by('-date_joined')


@method_decorator(csrf_exempt, name='dispatch')
class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Agent.objects.all().select_related('user')
    serializer_class = AgentSerializer
    authentication_classes = [CSRFExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
