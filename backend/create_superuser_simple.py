#!/usr/bin/env python
"""
Simple script to create a Django superuser
Edit the credentials below and run: python create_superuser_simple.py
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

# ========================================
# EDIT THESE CREDENTIALS
# ========================================
USERNAME = "admin2"
EMAIL = "admin2@miizarealtors.com"
PASSWORD = "admin123"  # Change this to a secure password
# ========================================

def create_superuser():
    User = get_user_model()
    
    # Check if user already exists
    if User.objects.filter(username=USERNAME).exists():
        print(f"❌ User with username '{USERNAME}' already exists!")
        print("   Please choose a different username or delete the existing user first.")
        return False
    
    if User.objects.filter(email=EMAIL).exists():
        print(f"❌ User with email '{EMAIL}' already exists!")
        print("   Please choose a different email or delete the existing user first.")
        return False
    
    # Create superuser
    try:
        user = User.objects.create_superuser(
            username=USERNAME,
            email=EMAIL,
            password=PASSWORD,
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print(f"\n✅ Superuser created successfully!")
        print(f"   Username: {USERNAME}")
        print(f"   Email: {EMAIL}")
        print(f"   Password: {PASSWORD}")
        print(f"\n📝 You can now login to the dashboard at:")
        print(f"   URL: http://localhost:3000/admin/login")
        print(f"   or: http://localhost:8000/admin/")
        return True
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Creating superuser...")
    print(f"Username: {USERNAME}")
    print(f"Email: {EMAIL}")
    print()
    create_superuser()
