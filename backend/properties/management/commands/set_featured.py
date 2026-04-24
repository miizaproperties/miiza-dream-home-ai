from django.core.management.base import BaseCommand
from properties.models import Property


class Command(BaseCommand):
    help = 'Mark some properties as featured for testing'

    def handle(self, *args, **options):
        # Get first few properties and mark them as featured
        properties = Property.objects.all()[:5]  # Mark first 5 properties as featured
        
        if not properties.exists():
            self.stdout.write("No properties found in database.")
            return
        
        marked_count = 0
        for prop in properties:
            prop.featured = True
            prop.save()
            marked_count += 1
            self.stdout.write(f"Marked as featured: ID {prop.id} - {prop.title}")
        
        self.stdout.write(f"\nSuccessfully marked {marked_count} properties as featured.")
        
        # Verify the update
        featured_count = Property.objects.filter(featured=True).count()
        self.stdout.write(f"Total featured properties now: {featured_count}")
