from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True)
    is_agent = models.BooleanField(default=False)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    must_change_password = models.BooleanField(default=False, help_text="Require user to change password on next login")
    
    def __str__(self):
        return self.username


class Agent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    license_number = models.CharField(max_length=100, blank=True)
    years_experience = models.IntegerField(default=0)
    specialization = models.CharField(max_length=200, blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Agent"
