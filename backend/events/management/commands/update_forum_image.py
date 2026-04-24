from django.core.management.base import BaseCommand
from events.models import Event
import os


class Command(BaseCommand):
    help = 'Update MIIZA Property Forum 2026 event with featured image'

    def handle(self, *args, **options):
        try:
            # Get the event
            event = Event.objects.get(slug='miiza-property-forum-2026')
            
            # Check if image file exists
            image_path = 'events/featured/miiza-property-forum-2026.png'
            full_image_path = f'/Users/omar73x/Miiza Web/miiza-dream-home-ai-main/backend/media/{image_path}'
            
            if os.path.exists(full_image_path):
                event.featured_image = image_path
                event.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully updated event image: {event.title}')
                )
                self.stdout.write(f'Image path: {event.featured_image}')
            else:
                self.stdout.write(
                    self.style.ERROR(f'Image file not found: {full_image_path}')
                )
                
        except Event.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Event "miiza-property-forum-2026" not found')
            )