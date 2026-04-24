#!/usr/bin/env python
"""
Script to fix/reset admin user credentials
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def fix_admin_user():
    """Fix or create admin user with correct credentials"""
    username = "admin"
    email = "miizarealtors@gmail.com"
    password = "Miiza@2025@!"
    
    print(f"\n🔧 Fixing admin user...")
    print("=" * 60)
    
    try:
        # Try to get existing user
        user = User.objects.get(username=username)
        print(f"✅ User '{username}' found!")
        
        # Update password
        user.set_password(password)
        user.email = email
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        print(f"✅ User updated successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Is Active: {user.is_active}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Password: {password}")
        
    except User.DoesNotExist:
        print(f"⚠️  User '{username}' not found. Creating new user...")
        
        # Create new superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        
        print(f"✅ User created successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Password: {password}")
    
    # Verify the fix
    print(f"\n🔍 Verifying credentials...")
    from django.contrib.auth import authenticate
    authenticated_user = authenticate(username=username, password=password)
    
    if authenticated_user:
        print(f"✅ Verification SUCCESSFUL! Login should work now.")
    else:
        print(f"❌ Verification FAILED! There may be another issue.")
    
    print(f"\n📝 You can now login with:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
    print(f"   URL: https://miizarealtors.com/admin/login")

if __name__ == '__main__':
    fix_admin_user()

