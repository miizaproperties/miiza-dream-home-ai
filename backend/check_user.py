#!/usr/bin/env python
"""
Script to check and verify user credentials
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password

User = get_user_model()

def check_user(username, password):
    """Check if user exists and verify password"""
    print(f"\n🔍 Checking user: {username}")
    print("=" * 60)
    
    # Check if user exists
    try:
        user = User.objects.get(username=username)
        print(f"✅ User found!")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Is Active: {user.is_active}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Agent: {user.is_agent}")
        
        # Check password
        print(f"\n🔐 Checking password...")
        if user.check_password(password):
            print(f"✅ Password is CORRECT!")
        else:
            print(f"❌ Password is INCORRECT!")
            print(f"   The stored password hash does not match the provided password.")
        
        # Try authenticate
        print(f"\n🔑 Testing authentication...")
        authenticated_user = authenticate(username=username, password=password)
        if authenticated_user:
            print(f"✅ Authentication SUCCESSFUL!")
            print(f"   Authenticated user: {authenticated_user.username}")
        else:
            print(f"❌ Authentication FAILED!")
            print(f"   This is why login is not working.")
            
            # Additional diagnostics
            if not user.is_active:
                print(f"\n⚠️  ISSUE FOUND: User is INACTIVE!")
                print(f"   Django's authenticate() will return None for inactive users.")
                print(f"   Solution: Set user.is_active = True")
            
    except User.DoesNotExist:
        print(f"❌ User with username '{username}' does NOT exist!")
        print(f"   You need to create this user first.")
        return False
    
    return True

if __name__ == '__main__':
    # Check the admin user
    username = "admin"
    password = "Miiza@2025@!"
    
    check_user(username, password)
    
    # Also list all users
    print(f"\n\n📋 All users in database:")
    print("=" * 60)
    all_users = User.objects.all()
    if all_users.exists():
        for user in all_users:
            print(f"   - {user.username} ({user.email}) - Active: {user.is_active}, Superuser: {user.is_superuser}")
    else:
        print("   No users found in database!")

