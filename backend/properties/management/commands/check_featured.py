from django.core.management.base import BaseCommand
from properties.models import Property


class Command(BaseCommand):
    help = 'Check featured properties in the database'

    def handle(self, *args, **options):
        # Get all properties
        all_properties = Property.objects.all()
        featured_properties = Property.objects.filter(featured=True)
        
        self.stdout.write(f"Total properties in database: {all_properties.count()}")
        self.stdout.write(f"Featured properties count: {featured_properties.count()}")
        
        if featured_properties.exists():
            self.stdout.write("\nFeatured properties:")
            for prop in featured_properties:
                self.stdout.write(f"- ID: {prop.id}, Title: {prop.title}, Featured: {prop.featured}")
        else:
            self.stdout.write("\nNo properties are marked as featured.")
            
            # Show first few properties and their featured status
            self.stdout.write("\nSample properties and their featured status:")
            for prop in all_properties[:5]:
                self.stdout.write(f"- ID: {prop.id}, Title: {prop.title}, Featured: {prop.featured}")
