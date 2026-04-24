#!/usr/bin/env python3
"""
Automated Property Upload Script for Miiza Real Estate
This script parses property data from the extracted text file and uploads it to Django.
"""

import os
import sys
import django
import re
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from properties.models import Property

def parse_price(price_text):
    """Extract price and currency from text"""
    # Match patterns like "5.9M", "7.5M", "$75,000", "KSH 8.8M"
    price_patterns = [
        r'(\$|USD\s*)([0-9,]+(?:\.[0-9]+)?)\s*([KMB]?)',  # $75,000 or USD 75,000
        r'(KSH?\s*)([0-9,]+(?:\.[0-9]+)?)\s*([KMB]?)',    # KSH 5.9M
        r'From\s+([A-Z]+\s*)?([0-9,]+(?:\.[0-9]+)?)\s*([KMB]?)',  # From 5.9M
        r'([0-9,]+(?:\.[0-9]+)?)\s*([KMB]?)',  # Just numbers with M/K/B
    ]
    
    currency = 'KSH'  # Default
    price = 0
    
    for pattern in price_patterns:
        match = re.search(pattern, price_text.replace(',', ''))
        if match:
            groups = match.groups()
            
            # Extract currency
            if '$' in price_text or 'USD' in price_text:
                currency = 'USD'
            elif 'KSH' in price_text or 'Ksh' in price_text:
                currency = 'KSH'
            
            # Extract price value
            price_str = groups[-2] if len(groups) > 2 else groups[-1] if len(groups) > 1 else groups[0]
            multiplier_str = groups[-1] if len(groups) > 2 else groups[1] if len(groups) > 1 else ''
            
            try:
                price = float(price_str.replace(',', ''))
                
                # Apply multiplier
                if multiplier_str.upper() == 'M':
                    price *= 1000000
                elif multiplier_str.upper() == 'K':
                    price *= 1000
                elif multiplier_str.upper() == 'B':
                    price *= 1000000000
                    
            except (ValueError, TypeError):
                continue
            
            break
    
    return currency, price

def extract_amenities(text):
    """Extract amenities from property description"""
    amenities = []
    
    # Common amenity patterns
    amenity_patterns = [
        r'🏊.*?pool',
        r'💪.*?gym',
        r'🧘.*?yoga',
        r'🚗.*?parking',
        r'⚡.*?generator',
        r'🔐.*?security',
        r'🌿.*?garden',
        r'☕.*?restaurant',
        r'🛗.*?lift',
        r'🎠.*?play\s*area',
        r'🏋️.*?fitness',
        r'💻.*?workspace',
        r'🛒.*?mart',
        r'🌇.*?rooftop',
        r'🧖.*?sauna',
        r'🛁.*?spa',
        r'🏃.*?jogging',
        r'🎬.*?theatre',
        r'📅.*?meeting',
        r'🎉.*?hall',
    ]
    
    # Extract emojis and text
    for pattern in amenity_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            # Clean up the text
            clean_amenity = re.sub(r'[🏊💪🧘🚗⚡🔐🌿☕🛗🎠🏋️💻🛒🌇🧖🛁🏃🎬📅🎉]', '', match).strip()
            if clean_amenity and len(clean_amenity) > 2:
                amenities.append(clean_amenity.title())
    
    # Standard amenities based on keywords
    keyword_amenities = {
        'pool': 'Swimming Pool',
        'gym': 'Gymnasium', 
        'fitness': 'Fitness Center',
        'security': '24/7 Security',
        'parking': 'Parking',
        'generator': 'Backup Generator',
        'garden': 'Garden',
        'yoga': 'Yoga Studio',
        'spa': 'Spa',
        'sauna': 'Sauna',
        'restaurant': 'Restaurant',
        'cafe': 'Cafe',
        'rooftop': 'Rooftop Terrace',
        'elevator': 'Elevator',
        'lift': 'Elevator',
        'balcony': 'Balcony',
        'terrace': 'Terrace',
        'play area': 'Children\'s Play Area',
        'playground': 'Children\'s Play Area',
        'workspace': 'Co-working Space',
        'mart': 'Mini Market',
        'jogging': 'Jogging Track',
        'tennis': 'Tennis Court',
        'bbq': 'BBQ Area',
        'lounge': 'Lounge',
        'concierge': 'Concierge Service',
        'laundry': 'Laundry',
        'borehole': 'Private Water Supply',
        'cctv': 'CCTV Surveillance',
        'intercom': 'Intercom System',
    }
    
    text_lower = text.lower()
    for keyword, amenity in keyword_amenities.items():
        if keyword in text_lower and amenity not in amenities:
            amenities.append(amenity)
    
    return list(set(amenities))  # Remove duplicates

def extract_bedrooms_bathrooms(text):
    """Extract bedroom and bathroom information"""
    bedrooms = []
    bathrooms = []
    
    # Patterns for bedrooms
    bedroom_patterns = [
        r'(\d+)\s*-?\s*bed',
        r'studio',
        r'(\d+)\s*bedroom',
    ]
    
    for pattern in bedroom_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if match.isdigit():
                bedrooms.append(int(match))
            elif 'studio' in text.lower():
                bedrooms.append(0)  # Studio = 0 bedrooms
    
    # Patterns for bathrooms (less common in descriptions, so estimate)
    bathroom_patterns = [
        r'(\d+)\s*bath',
        r'ensuite',
        r'en-suite',
    ]
    
    for pattern in bathroom_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if match.isdigit():
                bathrooms.append(int(match))
    
    # If no bathrooms found, estimate based on bedrooms
    if not bathrooms and bedrooms:
        max_beds = max(bedrooms)
        if max_beds == 0:  # Studio
            bathrooms = [1]
        elif max_beds <= 2:
            bathrooms = [max_beds]
        else:
            bathrooms = [max_beds - 1, max_beds]  # Usually 1 less or equal
    
    return bedrooms, bathrooms

def extract_square_feet(text):
    """Extract square footage from text"""
    patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:sqm|m²|square\s*meters?)',
        r'(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|square\s*feet)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            area = float(match.group(1))
            # Convert sqm to sq ft if needed
            if 'sqm' in text.lower() or 'm²' in text.lower():
                area *= 10.764  # Convert sqm to sq ft
            return int(area)
    
    return None

def determine_location(text, title):
    """Extract location information"""
    # Common Nairobi locations
    locations = {
        'westlands': 'Westlands, Nairobi',
        'kilimani': 'Kilimani, Nairobi', 
        'kileleshwa': 'Kileleshwa, Nairobi',
        'riverside': 'Riverside, Nairobi',
        'upperhill': 'Upperhill, Nairobi',
        'tatu city': 'Tatu City, Nairobi',
        'karen': 'Karen, Nairobi',
        'lavington': 'Lavington, Nairobi',
        'runda': 'Runda, Nairobi',
        'spring valley': 'Spring Valley, Nairobi',
    }
    
    text_lower = text.lower()
    title_lower = title.lower()
    
    for location_key, full_address in locations.items():
        if location_key in text_lower or location_key in title_lower:
            return full_address
    
    # Default fallback
    return 'Nairobi, Kenya'

def determine_property_type(text, title):
    """Determine property type based on description"""
    text_lower = (text + ' ' + title).lower()
    
    if any(word in text_lower for word in ['apartment', 'residences', 'towers', 'suites']):
        return 'apartment'
    elif any(word in text_lower for word in ['villa', 'villas', 'house']):
        return 'house'
    elif any(word in text_lower for word in ['office', 'commercial']):
        return 'office'
    else:
        return 'apartment'  # Default

def determine_development_type(text):
    """Determine development type"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['off-plan', 'off plan', 'completion']):
        return 'off_plan'
    elif 'gated' in text_lower:
        return 'gated_community'
    elif any(word in text_lower for word in ['new development', 'landmark', 'development']):
        return 'new_development'
    else:
        return 'completed'

def parse_properties():
    """Parse properties from the extracted text"""
    
    with open('/Users/omar73x/Miiza Web/miiza-dream-home-ai-main/data.txt', 'r') as f:
        content = f.read()
    
    # Split properties by bullet points
    property_sections = re.split(r'•\s+([A-Z][A-Z\s]+)\n', content)
    
    properties = []
    current_title = None
    
    for i, section in enumerate(property_sections):
        section = section.strip()
        if not section:
            continue
            
        # Check if this is a title (all caps)
        if section.isupper() and len(section.split('\n')) == 1:
            current_title = section.strip()
        elif current_title and section:
            # This is the description for the current title
            properties.append({
                'title': current_title,
                'description': section
            })
            current_title = None
    
    return properties

def upload_properties():
    """Upload all properties to Django"""
    
    print("🚀 Starting property upload process...")
    
    # Clear existing properties (optional - remove this if you want to keep existing data)
    Property.objects.all().delete()
    print("🗑️  Cleared existing properties")
    
    properties_data = parse_properties()
    print(f"📝 Found {len(properties_data)} properties to upload")
    
    uploaded_count = 0
    
    for prop_data in properties_data:
        title = prop_data['title']
        description = prop_data['description']
        
        print(f"\n📋 Processing: {title}")
        
        # Extract data
        currency, price = parse_price(description)
        amenities = extract_amenities(description)
        bedrooms, bathrooms = extract_bedrooms_bathrooms(description)
        square_feet = extract_square_feet(description)
        address = determine_location(description, title)
        property_type = determine_property_type(description, title)
        development_type = determine_development_type(description)
        
        # Convert lists to comma-separated strings
        bedrooms_str = ','.join(map(str, bedrooms)) if bedrooms else '1'
        bathrooms_str = ','.join(map(str, bathrooms)) if bathrooms else '1'
        
        try:
            # Create property
            property_obj = Property.objects.create(
                title=title,
                description=description,
                property_type=property_type,
                status='available',
                development_type=development_type,
                address=address,
                city='Nairobi',
                country='Kenya',
                bedrooms=bedrooms_str,
                bathrooms=bathrooms_str,
                square_feet=square_feet,
                price=Decimal(str(price)) if price > 0 else Decimal('1000000'),
                currency=currency,
                is_for_sale=True,
                is_for_rent=False,
                amenities=amenities,
                featured=uploaded_count < 5,  # Make first 5 featured
            )
            
            uploaded_count += 1
            print(f"✅ Successfully uploaded: {title}")
            print(f"   💰 Price: {currency} {price:,.0f}")
            print(f"   🛏️  Bedrooms: {bedrooms_str}")
            print(f"   🚿 Bathrooms: {bathrooms_str}")
            print(f"   📍 Location: {address}")
            print(f"   🏗️  Amenities: {len(amenities)} amenities")
            
        except Exception as e:
            print(f"❌ Error uploading {title}: {str(e)}")
            continue
    
    print(f"\n🎉 Upload complete! Successfully uploaded {uploaded_count} properties")
    return uploaded_count

if __name__ == '__main__':
    upload_properties()