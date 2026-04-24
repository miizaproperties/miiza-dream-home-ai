#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from properties.models import Property
from django.utils.text import slugify

print("Checking properties in database...")
print(f"Total properties: {Property.objects.count()}")

print("\nFirst 10 properties:")
for p in Property.objects.all()[:10]:
    slug = slugify(p.title)
    print(f"ID: {p.id}")
    print(f"Title: {p.title}")
    print(f"Generated Slug: {slug}")
    print(f"Status: {p.status}")
    print(f"Property Type: {p.property_type}")
    print("-" * 50)

# Check if any property matches "venus-oak"
print("\nLooking for properties that might match 'venus-oak' slug:")
venus_properties = []
for p in Property.objects.all():
    if 'venus' in p.title.lower() or 'oak' in p.title.lower():
        slug = slugify(p.title)
        venus_properties.append((p, slug))
        print(f"Found: {p.title} -> {slug}")

if not venus_properties:
    print("No properties found with 'venus' or 'oak' in title")
