#!/usr/bin/env python
"""
Script to delete a Django user
Usage: python delete_user.py <username> or <email>
Or edit the USERNAME/EMAIL below and run: python delete_user.py
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
# EDIT THESE TO MATCH THE USER TO DELETE
# ========================================
USERNAME = "admin"
EMAIL = "Miizarealtors@gmail.com"
# ========================================

def delete_user(username=None, email=None):
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
            return False
    
    # Display user info before deletion
    print(f"\n📋 User Information:")
    print(f"   ID: {user.id}")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Is Superuser: {user.is_superuser}")
    print(f"   Is Staff: {user.is_staff}")
    print(f"   Is Active: {user.is_active}")
    
    # Confirm deletion
    print(f"\n⚠️  WARNING: This will permanently delete the user!")
    confirm = input("Type 'DELETE' to confirm: ").strip()
    
    if confirm != 'DELETE':
        print("❌ Deletion cancelled.")
        return False
    
    # Delete the user
    try:
        username = user.username
        email = user.email
        user.delete()
        print(f"\n✅ User deleted successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        return True
    except Exception as e:
        print(f"❌ Error deleting user: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Deleting user...")
    print(f"Username: {USERNAME}")
    print(f"Email: {EMAIL}")
    print()
    delete_user(USERNAME, EMAIL)

