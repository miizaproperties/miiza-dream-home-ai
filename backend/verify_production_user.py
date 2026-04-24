#!/usr/bin/env python
"""
Script to verify and fix admin user in production database
Run this on your production server or with production database connection
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password

User = get_user_model()

def verify_and_fix_admin():
    """Verify admin user exists and fix if needed"""
    username = "admin"
    email = "miizarealtors@gmail.com"
    password = "Miiza@2025@!"
    
    print(f"\n🔍 Verifying admin user in PRODUCTION database...")
    print("=" * 60)
    
    # Check if user exists
    try:
        user = User.objects.get(username=username)
        print(f"✅ User '{username}' found in database!")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Is Active: {user.is_active}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Superuser: {user.is_superuser}")
        
        # Test password
        print(f"\n🔐 Testing password...")
        if user.check_password(password):
            print(f"✅ Password is CORRECT!")
        else:
            print(f"❌ Password is INCORRECT - Resetting password...")
            user.set_password(password)
            user.save()
            print(f"✅ Password has been reset!")
        
        # Ensure user is active and has correct permissions
        if not user.is_active:
            print(f"⚠️  User is INACTIVE - Activating...")
            user.is_active = True
            user.save()
            print(f"✅ User has been activated!")
        
        if not user.is_staff:
            print(f"⚠️  User is not staff - Granting staff privileges...")
            user.is_staff = True
            user.save()
            print(f"✅ Staff privileges granted!")
        
        if not user.is_superuser:
            print(f"⚠️  User is not superuser - Granting superuser privileges...")
            user.is_superuser = True
            user.save()
            print(f"✅ Superuser privileges granted!")
        
        # Update email if different
        if user.email != email:
            print(f"⚠️  Email mismatch - Updating email...")
            user.email = email
            user.save()
            print(f"✅ Email updated!")
        
        # Final authentication test
        print(f"\n🔑 Testing authentication...")
        authenticated_user = authenticate(username=username, password=password)
        if authenticated_user:
            print(f"✅ Authentication SUCCESSFUL!")
            print(f"\n✅ Admin user is ready for login!")
        else:
            print(f"❌ Authentication FAILED!")
            print(f"   This is unexpected. Please check Django settings.")
        
    except User.DoesNotExist:
        print(f"❌ User '{username}' NOT FOUND in database!")
        print(f"   Creating new admin user...")
        
        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        
        print(f"✅ Admin user created successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Password: {password}")
    
    print(f"\n📝 Login credentials:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
    print(f"   URL: https://miizarealtors.com/admin/login")
    print(f"\n" + "=" * 60)

if __name__ == '__main__':
    verify_and_fix_admin()

