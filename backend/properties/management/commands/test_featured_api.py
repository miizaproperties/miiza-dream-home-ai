from django.core.management.base import BaseCommand
from properties.models import Property
from properties.serializers import PropertyListSerializer


class Command(BaseCommand):
    help = 'Test featured properties API'

    def handle(self, *args, **options):
        # Simulate the featured endpoint logic
        featured_properties = Property.objects.filter(featured=True).order_by('-created_at')
        serializer = PropertyListSerializer(featured_properties, many=True)
        
        self.stdout.write(f"Found {len(serializer.data)} featured properties:")
        for prop in serializer.data:
            self.stdout.write(f"- ID: {prop['id']}, Title: {prop['title']}, Featured: {prop.get('featured', False)}")
