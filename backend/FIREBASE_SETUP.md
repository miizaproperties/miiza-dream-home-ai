# Firebase Storage Setup Guide

This guide explains how to set up and use Firebase Storage for file uploads in the MiiZA Realtors backend.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Firebase Storage bucket: `automotive-5f3b5.firebasestorage.app`
3. Service account credentials JSON file

## Step 1: Install Dependencies

The `firebase-admin` package is already added to `requirements.txt`. Install it:

```bash
python -m pip install firebase-admin
```

Or if using a virtual environment:
```bash
pip install -r requirements.txt
```

## Step 2: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Save it as `firebase-credentials.json` in the `backend/` directory

**⚠️ Important:** Never commit this file to version control! It's already added to `.gitignore`.

## Step 3: Configure Environment Variables

Add these to your `.env` file (or create one from `env.example`):

```env
# Firebase Configuration
FIREBASE_STORAGE_BUCKET=automotive-5f3b5.firebasestorage.app
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
```

## Step 4: Firebase Storage Security Rules

Configure Firebase Storage rules in the Firebase Console:

1. Go to **Storage** → **Rules**
2. Update the rules to allow public read access and authenticated write:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{allPaths=**} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Only authenticated users can write
    }
    match /profiles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 5: Using Firebase Storage in Your Code

### Basic Usage

```python
from config.firebase_storage import upload_file_to_firebase, delete_file_from_firebase, get_file_url

# Upload a file
file = request.FILES.get('image')
destination_path = f'properties/{property_id}/main_image.jpg'
public_url = upload_file_to_firebase(file, destination_path)

# Get file URL
file_url = get_file_url('properties/123/main_image.jpg')

# Delete a file
delete_file_from_firebase('properties/123/main_image.jpg')
```

### Example: Upload Property Images

```python
from config.firebase_storage import upload_file_to_firebase
import uuid

# In your create_property view
main_image = request.FILES.get('main_image')
if main_image:
    # Generate unique filename
    file_extension = main_image.name.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    destination = f'properties/{property_obj.id}/main_{unique_filename}'
    
    # Upload to Firebase
    firebase_url = upload_file_to_firebase(main_image, destination)
    
    # Store the URL in your model (if you have a URL field)
    property_obj.main_image_url = firebase_url
    property_obj.save()
```

## Step 6: Optional - Custom Django Storage Backend

If you want to use Firebase as a Django storage backend, you can create a custom storage class. See the example in the main implementation guide.

## Troubleshooting

### Error: "Firebase credentials file not found"

- Ensure `firebase-credentials.json` exists in the `backend/` directory
- Check that `FIREBASE_CREDENTIALS_PATH` in `.env` points to the correct file

### Error: "Failed to initialize Firebase"

- Verify your service account JSON is valid
- Check that the JSON file has proper permissions
- Ensure the bucket name matches your Firebase project

### Files not publicly accessible

- Check Firebase Storage security rules
- Ensure `make_public=True` is set in `upload_file_to_firebase()`
- Verify bucket permissions in Firebase Console

## Testing

Test the Firebase integration:

```python
# In Django shell: python manage.py shell
from config.firebase_storage import initialize_firebase, get_file_url

# Initialize Firebase
initialize_firebase()

# Test getting a URL
url = get_file_url('properties/test/image.jpg')
print(url)
```

## Migration from Local Storage

If you're migrating from local file storage to Firebase:

1. Upload existing files to Firebase
2. Update your models to store Firebase URLs
3. Update serializers to return Firebase URLs
4. Update frontend to use Firebase URLs directly

## Best Practices

1. **Organize files**: Use folder structure like `properties/{id}/`, `profiles/{id}/`
2. **Unique filenames**: Use UUIDs to avoid filename conflicts
3. **Error handling**: Always wrap Firebase operations in try-except blocks
4. **Cleanup**: Delete old files when updating/deleting properties
5. **Monitoring**: Monitor Firebase Storage usage and costs

## Cost Considerations

Firebase Storage has free tier limits:
- 5 GB storage
- 1 GB/day downloads
- 20,000 operations/day

Monitor usage in Firebase Console → Usage and Billing.

## Support

For issues or questions:
- Firebase Documentation: https://firebase.google.com/docs/storage
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

