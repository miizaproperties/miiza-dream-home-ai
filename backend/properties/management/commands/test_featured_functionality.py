from django.core.management.base import BaseCommand
from properties.models import Property


class Command(BaseCommand):
    help = 'Test featured property functionality'

    def handle(self, *args, **options):
        # Test 1: Check if we have featured properties
        featured_count = Property.objects.filter(featured=True).count()
        self.stdout.write(f"Current featured properties count: {featured_count}")
        
        # Test 2: Get a non-featured property and mark it as featured
        non_featured = Property.objects.filter(featured=False).first()
        if non_featured:
            self.stdout.write(f"\nTesting with property: ID {non_featured.id} - {non_featured.title}")
            self.stdout.write(f"Before update - Featured: {non_featured.featured}")
            
            # Mark as featured
            non_featured.featured = True
            non_featured.save()
            
            # Verify the update
            non_featured.refresh_from_db()
            self.stdout.write(f"After update - Featured: {non_featured.featured}")
            
            # Test 3: Check if it appears in featured properties
            featured_properties = Property.objects.filter(featured=True).order_by('-created_at')
            self.stdout.write(f"\nFeatured properties after update: {featured_properties.count()}")
            
            # Check if our test property is in the list
            is_in_featured = featured_properties.filter(id=non_featured.id).exists()
            self.stdout.write(f"Test property in featured list: {is_in_featured}")
            
            # Test 4: Simulate unfeaturing
            self.stdout.write(f"\nTesting unfeaturing...")
            non_featured.featured = False
            non_featured.save()
            non_featured.refresh_from_db()
            self.stdout.write(f"After unfeaturing - Featured: {non_featured.featured}")
            
            final_featured_count = Property.objects.filter(featured=True).count()
            self.stdout.write(f"Final featured properties count: {final_featured_count}")
            
        else:
            self.stdout.write("No non-featured properties found for testing.")
        
        self.stdout.write("\n✅ Featured property functionality test completed!")
