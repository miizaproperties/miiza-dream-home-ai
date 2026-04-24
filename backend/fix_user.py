#!/usr/bin/env python
"""
Script to verify and fix a Django user account
This will check if the user exists and ensure it has the correct permissions
Usage: python fix_user.py <username> or <email>
Or edit the USERNAME/EMAIL below and run: python fix_user.py
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
# EDIT THESE TO MATCH THE USER TO FIX
# ========================================
USERNAME = "admin"
EMAIL = "Miizarealtors@gmail.com"
PASSWORD = "Miiza@2025@!"  # Set this to the desired password
# ========================================

def fix_user(username=None, email=None, password=None):
    User = get_user_model()
    
    # Use command line args if provided
    if len(sys.argv) > 1:
        identifier = sys.argv[1]
        # Try to find by username first, then email
        try:
            user = User.objects.get(username=identifier)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=identifier)
            except User.DoesNotExist:
                print(f"❌ User not found with username or email: {identifier}")
                return False
    else:
        # Use the constants defined above
        user = None
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                pass
        
        if not user and email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        
        if not user:
            print(f"❌ User not found!")
            if username:
                print(f"   Tried username: {username}")
            if email:
                print(f"   Tried email: {email}")
            print(f"\n💡 Would you like to create this user? (y/n): ", end="")
            create = input().strip().lower()
            if create == 'y':
                if not password:
                    password = input("Enter password: ").strip()
                try:
                    user = User.objects.create_superuser(
                        username=username or email.split('@')[0],
                        email=email,
                        password=password,
                        is_staff=True,
                        is_superuser=True,
                        is_active=True
                    )
                    print(f"✅ User created successfully!")
                except Exception as e:
                    print(f"❌ Error creating user: {e}")
                    return False
            else:
                return False
    
    # Display current user info
    print(f"\n📋 Current User Information:")
    print(f"   ID: {user.id}")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Is Superuser: {user.is_superuser}")
    print(f"   Is Staff: {user.is_staff}")
    print(f"   Is Active: {user.is_active}")
    
    # Fix user settings
    needs_fix = False
    if not user.is_superuser:
        print(f"\n⚠️  User is not a superuser - fixing...")
        user.is_superuser = True
        needs_fix = True
    
    if not user.is_staff:
        print(f"⚠️  User is not staff - fixing...")
        user.is_staff = True
        needs_fix = True
    
    if not user.is_active:
        print(f"⚠️  User is not active - fixing...")
        user.is_active = True
        needs_fix = True
    
    # Update password if provided
    if password:
        print(f"\n🔑 Updating password...")
        user.set_password(password)
        needs_fix = True
    
    if needs_fix:
        user.save()
        print(f"\n✅ User fixed successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Active: {user.is_active}")
        if password:
            print(f"   Password: Updated")
        return True
    else:
        print(f"\n✅ User is already correctly configured!")
        return True

if __name__ == '__main__':
    print("Verifying and fixing user...")
    print(f"Username: {USERNAME}")
    print(f"Email: {EMAIL}")
    print()
    fix_user(USERNAME, EMAIL, PASSWORD)














