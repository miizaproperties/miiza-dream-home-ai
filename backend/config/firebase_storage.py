"""
Firebase Storage utility functions for uploading and managing files
"""
import os
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile

# Lazy import of firebase_admin to avoid import errors at module load time
def _get_firebase_admin():
    """Lazy import of firebase_admin"""
    try:
        import firebase_admin
        from firebase_admin import credentials, storage
        return firebase_admin, credentials, storage
    except ImportError:
        raise ImportError(
            "firebase-admin is not installed. Please install it with: pip install firebase-admin"
        )

# Global flag to track if Firebase is initialized
_firebase_initialized = False


def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized"""
    global _firebase_initialized
    
    firebase_admin, credentials, storage = _get_firebase_admin()
    
    if not _firebase_initialized and not firebase_admin._apps:
        # Get credentials path from settings or environment
        cred_path_env = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
        
        # If path is absolute, use it directly; otherwise join with BASE_DIR
        if os.path.isabs(cred_path_env):
            cred_path = cred_path_env
        else:
            cred_path = os.path.join(settings.BASE_DIR, cred_path_env)
        
        if os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                bucket_name = os.environ.get('FIREBASE_STORAGE_BUCKET', 'automotive-5f3b5.firebasestorage.app')
                firebase_admin.initialize_app(cred, {
                    'storageBucket': bucket_name
                })
                _firebase_initialized = True
            except Exception as e:
                raise Exception(f"Failed to initialize Firebase: {str(e)}")
        else:
            raise FileNotFoundError(
                f"Firebase credentials file not found at {cred_path}. "
                f"Please download your service account JSON from Firebase Console and save it as 'firebase-credentials.json' in the backend directory."
            )


def upload_file_to_firebase(file, destination_path, make_public=True):
    """
    Upload a file to Firebase Storage
    
    Args:
        file: Django UploadedFile object or file-like object
        destination_path: Path in Firebase Storage (e.g., 'properties/image.jpg')
        make_public: Whether to make the file publicly accessible (default: True)
    
    Returns:
        Public URL of the uploaded file
    """
    firebase_admin, credentials, storage_module = _get_firebase_admin()
    initialize_firebase()
    
    bucket = storage_module.bucket()
    blob = bucket.blob(destination_path)
    
    # Set content type if available
    if hasattr(file, 'content_type') and file.content_type:
        blob.content_type = file.content_type
    
    # Upload file
    if isinstance(file, UploadedFile):
        # For Django UploadedFile, use upload_from_file
        file.seek(0)  # Reset file pointer
        blob.upload_from_file(file, content_type=file.content_type)
    else:
        # For other file-like objects
        file.seek(0)
        blob.upload_from_file(file)
    
    # Make the file publicly accessible if requested
    if make_public:
        blob.make_public()
    
    # Return public URL
    return blob.public_url


def delete_file_from_firebase(file_path):
    """
    Delete a file from Firebase Storage
    
    Args:
        file_path: Path in Firebase Storage (e.g., 'properties/image.jpg')
    
    Returns:
        True if deleted, False if file doesn't exist
    """
    try:
        firebase_admin, credentials, storage_module = _get_firebase_admin()
        initialize_firebase()
        
        bucket = storage_module.bucket()
        blob = bucket.blob(file_path)
        
        if blob.exists():
            blob.delete()
            return True
        return False
    except Exception as e:
        print(f"Error deleting file from Firebase: {str(e)}")
        return False


def get_file_url(file_path):
    """
    Get the public URL for a file in Firebase Storage
    
    Args:
        file_path: Path in Firebase Storage (e.g., 'properties/image.jpg')
    
    Returns:
        Public URL of the file
    """
    from urllib.parse import quote
    
    bucket_name = os.environ.get('FIREBASE_STORAGE_BUCKET', 'automotive-5f3b5.firebasestorage.app')
    # Properly URL encode the path
    encoded_path = quote(file_path, safe='')
    return f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}?alt=media"


def file_exists_in_firebase(file_path):
    """
    Check if a file exists in Firebase Storage
    
    Args:
        file_path: Path in Firebase Storage (e.g., 'properties/image.jpg')
    
    Returns:
        True if file exists, False otherwise
    """
    try:
        firebase_admin, credentials, storage_module = _get_firebase_admin()
        initialize_firebase()
        
        bucket = storage_module.bucket()
        blob = bucket.blob(file_path)
        return blob.exists()
    except Exception:
        return False

