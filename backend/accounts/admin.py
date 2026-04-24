from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Agent


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_agent', 'is_staff']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'is_agent', 'bio', 'profile_picture')}),
    )


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'years_experience', 'specialization']
    search_fields = ['user__username', 'user__email', 'license_number']
