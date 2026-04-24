import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from datetime import date, time
from events.models import Event
from accounts.models import User


class Command(BaseCommand):
    help = 'Ensure MIIZA Property Forum 2026 event is complete with image'

    def handle(self, *args, **options):
        # Get or create admin user
        admin_user = None
        try:
            admin_user = User.objects.filter(is_staff=True, is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.filter(is_staff=True).first()
        except:
            pass

        # Check if event exists, create if not
        event, created = Event.objects.get_or_create(
            slug='miiza-property-forum-2026',
            defaults={
                'title': 'MIIZA Property Forum 2026',
                'description': 'Join us for an exclusive Property Forum featuring the Oak Residency portfolio—Luna Oak, Oak West, Oak Breeze, and more.',
                'content': """
<p>Join us for an exclusive Property Forum featuring the Oak Residency portfolio including:</p>
<ul>
    <li>Luna Oak</li>
    <li>Oak West</li>
    <li>Oak Breeze</li>
    <li>And many more exciting properties</li>
</ul>

<p>This exclusive event will showcase premium residential properties with investment opportunities, detailed presentations, and networking with industry professionals.</p>

<p>Don't miss this opportunity to explore the future of luxury living in Nairobi.</p>
                """,
                'event_date': date(2026, 4, 25),
                'event_time': time(9, 0),
                'location': 'IHIT Nairobi',
                'contact_email': 'info@miizaproperties.com',
                'contact_phone': '+254 700 000 000',
                'is_published': True,
                'is_featured': True,
                'created_by': admin_user
            }
        )

        if created:
            self.stdout.write(f'Created new event: {event.title}')
        else:
            self.stdout.write(f'Event already exists: {event.title}')

        # Handle image setup
        source_image_paths = [
            os.path.join(settings.BASE_DIR.parent, 'picture', 'PROPERTY FORUM.png'),
            os.path.join(settings.BASE_DIR, '..', 'picture', 'PROPERTY FORUM.png'),
            '/tmp/property_forum.png'  # fallback
        ]
        
        # Create media directory
        media_events_dir = os.path.join(settings.MEDIA_ROOT, 'events', 'featured')
        os.makedirs(media_events_dir, exist_ok=True)
        
        dest_image = os.path.join(media_events_dir, 'miiza-property-forum-2026.png')
        
        # Try to find and copy the source image
        image_copied = False
        for source_path in source_image_paths:
            if os.path.exists(source_path):
                try:
                    shutil.copy2(source_path, dest_image)
                    image_copied = True
                    self.stdout.write(f'Copied image from: {source_path}')
                    break
                except Exception as e:
                    self.stdout.write(f'Failed to copy from {source_path}: {str(e)}')
        
        if image_copied or os.path.exists(dest_image):
            # Update event with image
            event.featured_image = 'events/featured/miiza-property-forum-2026.png'
            event.save()
            
            if os.path.exists(dest_image):
                file_size = os.path.getsize(dest_image)
                self.stdout.write(f'✅ Image successfully linked: {file_size} bytes')
            else:
                self.stdout.write('⚠️  Image field updated but file not found')
        else:
            self.stdout.write('❌ Could not find source image file')

        # Output event details for verification
        self.stdout.write(f'\n📋 Event Details:')
        self.stdout.write(f'   ID: {event.id}')
        self.stdout.write(f'   Title: {event.title}')
        self.stdout.write(f'   Slug: {event.slug}')
        self.stdout.write(f'   Date: {event.event_date}')
        self.stdout.write(f'   Time: {event.event_time}')
        self.stdout.write(f'   Published: {event.is_published}')
        self.stdout.write(f'   Featured: {event.is_featured}')
        self.stdout.write(f'   Image: {event.featured_image or "None"}')
        
        if event.featured_image:
            full_image_path = os.path.join(settings.MEDIA_ROOT, str(event.featured_image))
            self.stdout.write(f'   Image exists: {os.path.exists(full_image_path)}')