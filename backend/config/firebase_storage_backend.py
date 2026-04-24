"""
Custom Django Storage Backend for Firebase Storage
"""
import os
from django.core.files.storage import Storage
from django.core.files.base import File
from django.utils.deconstruct import deconstructible
from django.conf import settings
from .firebase_storage import upload_file_to_firebase, delete_file_from_firebase, get_file_url


@deconstructible
class FirebaseStorage(Storage):
    """
    Custom Django storage backend that stores files in Firebase Storage
    """
    
    def __init__(self, location=None, base_url=None):
        self.location = location or ''
        self.base_url = base_url or ''
    
    def _normalize_path(self, name):
        """
        Normalize the file path, avoiding duplication of location prefix.
        Also handles cases where the path already has duplicate prefixes.
        
        Args:
            name: The file path/name (may already include location prefix)
        
        Returns:
            Normalized Firebase Storage path
        """
        # Ensure the path uses forward slashes
        name = name.replace('\\', '/').lstrip('/')
        
        # If location is set, normalize the path
        if self.location:
            location_normalized = self.location.strip('/')
            
            # Remove any duplicate location prefixes
            # e.g., "properties/properties/properties/file.jpg" -> "properties/file.jpg"
            parts = name.split('/')
            if len(parts) > 1 and parts[0] == location_normalized:
                # Check if there are duplicate prefixes
                duplicate_count = 1
                for i in range(1, len(parts)):
                    if parts[i] == location_normalized:
                        duplicate_count += 1
                    else:
                        break
                
                # Reconstruct path with only one location prefix
                if duplicate_count > 1:
                    name = '/'.join(parts[duplicate_count - 1:])
            
            # Check if name already starts with location prefix (after cleanup)
            if name.startswith(f"{location_normalized}/"):
                # Already has location prefix, return as is
                return name
            elif name == location_normalized:
                # Name is exactly the location, return as is
                return name
            else:
                # Add location prefix if not present
                return f"{location_normalized}/{name}"
        
        return name
    
    def _open(self, name, mode='rb'):
        """
        Not used for Firebase Storage as files are accessed via URLs
        """
        raise NotImplementedError("Firebase Storage doesn't support opening files directly")
    
    def _save(self, name, content):
        """
        Save file to Firebase Storage
        
        Args:
            name: The file path/name
            content: The file content (Django File object)
        
        Returns:
            The path/name of the saved file
        """
        # Normalize path to avoid duplication
        firebase_path = self._normalize_path(name)
        
        # Upload to Firebase
        try:
            # Upload the file
            public_url = upload_file_to_firebase(content, firebase_path, make_public=True)
            
            # Return the Firebase path (not the URL) so Django can store it
            # We'll store the Firebase path in the database
            return firebase_path
            
        except Exception as e:
            raise IOError(f"Failed to upload file to Firebase: {str(e)}")
    
    def delete(self, name):
        """
        Delete file from Firebase Storage
        
        Args:
            name: The file path/name in Firebase Storage
        """
        from .firebase_storage import file_exists_in_firebase
        
        try:
            # Try the stored path first
            name_normalized = name.replace('\\', '/').lstrip('/')
            if file_exists_in_firebase(name_normalized):
                delete_file_from_firebase(name_normalized)
                return
            
            # If not found, try the normalized path
            firebase_path = self._normalize_path(name)
            if firebase_path != name_normalized and file_exists_in_firebase(firebase_path):
                delete_file_from_firebase(firebase_path)
        except Exception as e:
            # Don't raise exception if file doesn't exist
            print(f"Error deleting file from Firebase: {str(e)}")
    
    def exists(self, name):
        """
        Check if file exists in Firebase Storage
        
        Args:
            name: The file path/name in Firebase Storage
        
        Returns:
            True if file exists, False otherwise
        """
        from .firebase_storage import file_exists_in_firebase
        
        try:
            # Try the stored path first (for backward compatibility with old duplicated paths)
            name_normalized = name.replace('\\', '/').lstrip('/')
            if file_exists_in_firebase(name_normalized):
                return True
            
            # If not found, try the normalized path (for new files)
            firebase_path = self._normalize_path(name)
            if firebase_path != name_normalized:
                return file_exists_in_firebase(firebase_path)
            
            return False
        except:
            return False
    
    def url(self, name):
        """
        Return the public URL for the file in Firebase Storage
        
        Args:
            name: The file path/name in Firebase Storage
        
        Returns:
            Public URL of the file
        """
        # If name is already a full URL, return it
        if name.startswith('http://') or name.startswith('https://'):
            return name
        
        # Try the stored path first (for backward compatibility with old duplicated paths)
        name_normalized = name.replace('\\', '/').lstrip('/')

        # Build URL directly to avoid per-item existence checks during list serialization.
        # Firebase will handle not-found responses if the file path is invalid.
        if name_normalized:
            return get_file_url(name_normalized)

        firebase_path = self._normalize_path(name)
        return get_file_url(firebase_path)
    
    def path(self, name):
        """
        Not applicable for Firebase Storage (files are in the cloud)
        """
        raise NotImplementedError("Firebase Storage doesn't support local file paths")
    
    def size(self, name):
        """
        Get file size from Firebase Storage
        
        Args:
            name: The file path/name in Firebase Storage
        
        Returns:
            File size in bytes
        """
        try:
            from .firebase_storage import initialize_firebase, _get_firebase_admin
            
            firebase_admin, credentials, storage = _get_firebase_admin()
            initialize_firebase()
            
            # Normalize path to avoid duplication
            firebase_path = self._normalize_path(name)
            
            bucket = storage.bucket()
            blob = bucket.blob(firebase_path)
            
            if blob.exists():
                blob.reload()
                return blob.size
            return 0
        except:
            return 0

