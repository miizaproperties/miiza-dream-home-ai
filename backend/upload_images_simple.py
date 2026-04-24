#!/usr/bin/env python3
"""
Simplified Image Upload Script using Local Storage
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

def copy_and_resize_image(source_path, dest_dir, filename, max_width=1200, max_height=800):
    """Copy and resize image to media directory"""
    try:
        # Create destination directory if it doesn't exist
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / filename
        
        # Open and resize image
        with Image.open(source_path) as img:
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
            
            # Save as JPEG
            img.save(dest_path, format='JPEG', quality=85, optimize=True)
            
        return str(dest_path.relative_to(Path(__file__).parent / 'media'))
    
    except Exception as e:
        print(f"Error processing image {source_path}: {e}")
        return None

def upload_property_images():
    """Main function to upload all property images"""
    
    print("🖼️  Starting simplified image upload process...")
    
    # Create media directory
    media_dir = Path(__file__).parent / 'media'
    properties_dir = media_dir / 'properties'
    images_dir = media_dir / 'properties' / 'images'
    
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
    
    # Manual mapping for better matches
    manual_mappings = {
        'AYA LUXURY RSIDENCE': 'AYA LUXURY RESIDENCE',
        'EXECUTIVE SUITES': 'RIVERSIDE EXCUTIVE SUITES',
        'RIVERSIDE APARTMENTS': 'RIVERSIDE EXCUTIVE SUITES',
        'THE MARQUIS': 'MARQUIS',
        'INFINITY TOWERS': 'INFINITY TOWER',
        'GAIA BROOKSIDE': 'GAIA',
    }
    
    uploaded_count = 0
    matched_count = 0
    
    for property_obj in properties:
        print(f"\n🔍 Processing: {property_obj.title}")
        
        # Check manual mapping first
        folder_name = manual_mappings.get(property_obj.title)
        if folder_name:
            print(f"   🎯 Using manual mapping: {folder_name}")
        else:
            # Find best matching folder
            folder_name, score = find_best_match(property_obj.title, property_folders)
            if score < 0.3:  # Too low similarity
                print(f"   ❌ No good match found (best: {folder_name}, score: {score:.2f})")
                continue
            print(f"   ✅ Matched with folder: {folder_name} (score: {score:.2f})")
        
        if folder_name and folder_name in property_folders:
            matched_count += 1
            
            folder_path = os.path.join(IMAGES_BASE_DIR, folder_name)
            image_files = get_image_files(folder_path)
            
            if image_files:
                print(f"   📸 Found {len(image_files)} images")
                
                # Copy and upload images (limit to 8 per property)
                for i, image_path in enumerate(image_files[:8]):
                    try:
                        # Generate filename
                        extension = '.jpg'  # Always save as JPEG
                        filename = f"{property_obj.slug}-{i+1}{extension}"
                        
                        # Copy image to media directory
                        relative_path = copy_and_resize_image(
                            image_path, 
                            images_dir, 
                            filename
                        )
                        
                        if relative_path:
                            # Create PropertyImage record
                            property_image = PropertyImage.objects.create(
                                property=property_obj,
                                image=relative_path,
                                alt_text=f"{property_obj.title} - Image {i+1}",
                                order=i
                            )
                            
                            # Set as main image if it's the first one
                            if i == 0:
                                main_filename = f"main-{filename}"
                                main_relative_path = copy_and_resize_image(
                                    image_path,
                                    properties_dir,
                                    main_filename
                                )
                                if main_relative_path:
                                    property_obj.main_image = f"properties/{main_filename}"
                                    property_obj.save()
                            
                            uploaded_count += 1
                            print(f"     📷 Uploaded: {filename}")
                        
                    except Exception as e:
                        print(f"     ❌ Error uploading {image_path.name}: {e}")
                        continue
            
            else:
                print(f"   ⚠️  No images found in folder")
        
        else:
            print(f"   ❌ No matching folder found")
    
    print(f"\n🎉 Upload complete!")
    print(f"   📊 Properties matched: {matched_count}/{properties.count()}")
    print(f"   📸 Images uploaded: {uploaded_count}")
    
    return uploaded_count

if __name__ == '__main__':
    upload_property_images()
    print("\n✨ Image upload process complete!")
    print(f"🌐 View results at: http://localhost:8000/admin/properties/property/")
    print(f"🎯 Frontend: http://localhost:8080")