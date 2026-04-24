#!/usr/bin/env python3
"""
Automated Image Upload Script for Miiza Real Estate Properties
This script matches property folders with database properties and uploads images.
"""

import os
import sys
import django
import shutil
from pathlib import Path
import re
from PIL import Image
from difflib import SequenceMatcher

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from properties.models import Property, PropertyImage
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

# Base directory for property images
IMAGES_BASE_DIR = "/Users/omar73x/Miiza Web/miiza-dream-home-ai-main/data picture's and eveything lese /OFF-PLAN PROPERTIES"

def similarity(a, b):
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_match(property_title, folder_names):
    """Find the best matching folder for a property"""
    best_match = None
    best_score = 0
    
    # Clean property title for matching
    clean_title = re.sub(r'[^a-zA-Z\s]', '', property_title).strip().lower()
    
    for folder_name in folder_names:
        clean_folder = re.sub(r'[^a-zA-Z\s]', '', folder_name).strip().lower()
        
        # Calculate similarity score
        score = similarity(clean_title, clean_folder)
        
        # Bonus points for exact word matches
        title_words = set(clean_title.split())
        folder_words = set(clean_folder.split())
        word_overlap = len(title_words.intersection(folder_words)) / len(title_words) if title_words else 0
        score += word_overlap * 0.3
        
        if score > best_score:
            best_score = score
            best_match = folder_name
    
    return best_match, best_score

def get_image_files(directory):
    """Get all image files from a directory and subdirectories"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'}
    image_files = []
    
    try:
        for root, dirs, files in os.walk(directory):
            # Skip video files and non-image directories
            dirs[:] = [d for d in dirs if not d.lower().startswith('video')]
            
            for file in files:
                file_path = Path(root) / file
                if file_path.suffix.lower() in image_extensions:
                    # Skip very small files (likely thumbnails)
                    try:
                        if file_path.stat().st_size > 10000:  # 10KB minimum
                            image_files.append(file_path)
                    except:
                        continue
        
        # Sort by file size (larger images first, likely better quality)
        image_files.sort(key=lambda x: x.stat().st_size if x.exists() else 0, reverse=True)
        
    except Exception as e:
        print(f"Error scanning directory {directory}: {e}")
    
    return image_files

def resize_image(image_path, max_width=1200, max_height=800, quality=85):
    """Resize image if it's too large, maintaining aspect ratio"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Calculate new size maintaining aspect ratio
            width, height = img.size
            if width > max_width or height > max_height:
                ratio = min(max_width / width, max_height / height)
                new_width = int(width * ratio)
                new_height = int(height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save to memory
            from io import BytesIO
            output = BytesIO()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            return output.getvalue()
    
    except Exception as e:
        print(f"Error resizing image {image_path}: {e}")
        # Return original file as fallback
        try:
            with open(image_path, 'rb') as f:
                return f.read()
        except:
            return None

def upload_property_images():
    """Main function to upload all property images"""
    
    print("🖼️  Starting automated image upload process...")
    
    # Get all property folders
    try:
        property_folders = [d for d in os.listdir(IMAGES_BASE_DIR) 
                          if os.path.isdir(os.path.join(IMAGES_BASE_DIR, d))
                          and not d.startswith('.')]
    except Exception as e:
        print(f"❌ Error reading image directory: {e}")
        return
    
    print(f"📁 Found {len(property_folders)} property folders")
    
    # Get all properties from database
    properties = Property.objects.all()
    print(f"🏠 Found {properties.count()} properties in database")
    
    # Clear existing property images
    PropertyImage.objects.all().delete()
    print("🗑️  Cleared existing property images")
    
    uploaded_count = 0
    matched_count = 0
    
    for property_obj in properties:
        print(f"\n🔍 Processing: {property_obj.title}")
        
        # Find best matching folder
        best_folder, score = find_best_match(property_obj.title, property_folders)
        
        if best_folder and score > 0.3:  # Minimum similarity threshold
            matched_count += 1
            print(f"   ✅ Matched with folder: {best_folder} (score: {score:.2f})")
            
            folder_path = os.path.join(IMAGES_BASE_DIR, best_folder)
            image_files = get_image_files(folder_path)
            
            if image_files:
                print(f"   📸 Found {len(image_files)} images")
                
                # Upload images (limit to 10 per property)
                for i, image_path in enumerate(image_files[:10]):
                    try:
                        # Resize image
                        image_data = resize_image(image_path)
                        if not image_data:
                            continue
                        
                        # Generate file name
                        file_extension = image_path.suffix.lower()
                        if file_extension == '.jpeg':
                            file_extension = '.jpg'
                        
                        file_name = f"{property_obj.slug}-{i+1}{file_extension}"
                        
                        # Create PropertyImage
                        property_image = PropertyImage(
                            property=property_obj,
                            alt_text=f"{property_obj.title} - Image {i+1}",
                            order=i
                        )
                        
                        # Save image file
                        property_image.image.save(
                            file_name,
                            ContentFile(image_data),
                            save=True
                        )
                        
                        # Set as main image if it's the first one
                        if i == 0 and not property_obj.main_image:
                            property_obj.main_image.save(
                                f"main-{file_name}",
                                ContentFile(image_data),
                                save=True
                            )
                        
                        uploaded_count += 1
                        print(f"     📷 Uploaded: {file_name}")
                        
                    except Exception as e:
                        print(f"     ❌ Error uploading {image_path.name}: {e}")
                        continue
            
            else:
                print(f"   ⚠️  No images found in folder")
        
        else:
            print(f"   ❌ No matching folder found (best: {best_folder}, score: {score:.2f})")
    
    print(f"\n🎉 Upload complete!")
    print(f"   📊 Properties matched: {matched_count}/{properties.count()}")
    print(f"   📸 Images uploaded: {uploaded_count}")
    
    return uploaded_count

def create_manual_mappings():
    """Create manual mappings for properties that didn't auto-match"""
    
    # Manual mappings for tricky property names
    manual_mappings = {
        'AYA LUXURY RSIDENCE': 'AYA LUXURY RESIDENCE',
        'LUCKYINN IVY RESIDENCE': 'LUCKYINN IVY RESIDENCE', 
        'EXECUTIVE SUITES': 'RIVERSIDE EXCUTIVE SUITES',
        'RIVERSIDE APARTMENTS': 'RIVERSIDE EXCUTIVE SUITES',
        'THE MARQUIS': 'MARQUIS',
        'INFINITY TOWERS': 'INFINITY TOWER',
        'GAIA BROOKSIDE': 'GAIA',
        'ASTANA': 'NEXT AMANI',  # If they're related
        # Add more mappings as needed
    }
    
    print("\n🔧 Applying manual mappings...")
    
    for property_title, folder_name in manual_mappings.items():
        try:
            property_obj = Property.objects.get(title=property_title)
            folder_path = os.path.join(IMAGES_BASE_DIR, folder_name)
            
            if os.path.exists(folder_path):
                print(f"   ✅ Manual mapping: {property_title} -> {folder_name}")
                
                # Clear existing images for this property
                PropertyImage.objects.filter(property=property_obj).delete()
                
                image_files = get_image_files(folder_path)
                for i, image_path in enumerate(image_files[:8]):
                    try:
                        image_data = resize_image(image_path)
                        if not image_data:
                            continue
                        
                        file_name = f"{property_obj.slug}-manual-{i+1}.jpg"
                        
                        property_image = PropertyImage(
                            property=property_obj,
                            alt_text=f"{property_obj.title} - Image {i+1}",
                            order=i
                        )
                        
                        property_image.image.save(
                            file_name,
                            ContentFile(image_data),
                            save=True
                        )
                        
                        if i == 0:
                            property_obj.main_image.save(
                                f"main-{file_name}",
                                ContentFile(image_data),
                                save=True
                            )
                        
                        print(f"     📷 Uploaded: {file_name}")
                        
                    except Exception as e:
                        print(f"     ❌ Error: {e}")
                        continue
            
        except Property.DoesNotExist:
            print(f"   ❌ Property not found: {property_title}")
        except Exception as e:
            print(f"   ❌ Error with {property_title}: {e}")

if __name__ == '__main__':
    # Run main upload
    uploaded = upload_property_images()
    
    # Run manual mappings for missed properties
    create_manual_mappings()
    
    print("\n✨ Image upload process complete!")
    print(f"🌐 View results at: http://localhost:8000/admin/properties/property/")
    print(f"🎯 Frontend: http://localhost:8080")