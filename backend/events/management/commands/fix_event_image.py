import os
import shutil
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from events.models import Event


class Command(BaseCommand):
    help = 'Fix MIIZA Property Forum 2026 event image and ensure proper media setup'

    def handle(self, *args, **options):
        try:
            # Get the event
            event = Event.objects.get(slug='miiza-property-forum-2026')
            
            # Source image path (from picture directory)
            source_image = os.path.join(settings.BASE_DIR.parent, 'picture', 'PROPERTY FORUM.png')
            
            # Destination directory
            media_events_dir = os.path.join(settings.MEDIA_ROOT, 'events', 'featured')
            os.makedirs(media_events_dir, exist_ok=True)
            
            # Destination image path
            dest_image = os.path.join(media_events_dir, 'miiza-property-forum-2026.png')
            
            if os.path.exists(source_image):
                # Copy image to media directory
                shutil.copy2(source_image, dest_image)
                
                # Update event with relative path
                event.featured_image = 'events/featured/miiza-property-forum-2026.png'
                event.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully fixed event image: {event.title}')
                )
                self.stdout.write(f'Source: {source_image}')
                self.stdout.write(f'Destination: {dest_image}')
                self.stdout.write(f'Event image field: {event.featured_image}')
                
                # Verify file exists
                if os.path.exists(dest_image):
                    file_size = os.path.getsize(dest_image)
                    self.stdout.write(f'Image file size: {file_size} bytes')
                else:
                    self.stdout.write(self.style.ERROR('Image file not found after copy'))
                    
            else:
                self.stdout.write(
                    self.style.ERROR(f'Source image not found: {source_image}')
                )
                
        except Event.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Event "miiza-property-forum-2026" not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {str(e)}')
            )