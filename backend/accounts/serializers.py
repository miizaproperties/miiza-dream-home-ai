from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Agent

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'is_agent', 'is_staff', 'is_superuser']
        read_only_fields = ['id']


class AgentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Agent
        fields = ['id', 'user', 'license_number', 'years_experience', 'specialization']
