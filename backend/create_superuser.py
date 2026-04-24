#!/usr/bin/env python
"""
Script to create a Django superuser non-interactively
Usage: python create_superuser.py <username> <email> <password>
Or run without args for interactive mode
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

def create_superuser(username=None, email=None, password=None):
    User = get_user_model()
    
    # Interactive mode
    if not username:
        username = input("Enter username: ").strip()
    if not email:
        email = input("Enter email: ").strip()
    if not password:
        password = input("Enter password: ").strip()
    
    if not username or not email or not password:
        print("Error: Username, email, and password are required!")
        return False
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"Error: User with username '{username}' already exists!")
        return False
    
    if User.objects.filter(email=email).exists():
        print(f"Error: User with email '{email}' already exists!")
        return False
    
    # Create superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print(f"\n✅ Superuser created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"\nYou can now login to the dashboard at /admin/login")
        return True
    except Exception as e:
        print(f"Error creating superuser: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) == 4:
        # Non-interactive mode
        username = sys.argv[1]
        email = sys.argv[2]
        password = sys.argv[3]
        create_superuser(username, email, password)
    else:
        # Interactive mode
        create_superuser()