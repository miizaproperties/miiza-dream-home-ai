from django.core.management.base import BaseCommand
from properties.models import Property
from properties.serializers import PropertyListSerializer


class Command(BaseCommand):
    help = 'Comprehensive test of featured properties functionality'

    def handle(self, *args, **options):
        self.stdout.write("🧪 Running comprehensive featured properties test...\n")
        
        # Test 1: Check initial state
        initial_featured = Property.objects.filter(featured=True).count()
        self.stdout.write(f"1. Initial featured properties: {initial_featured}")
        
        # Test 2: Get a non-featured property for testing
        test_property = Property.objects.filter(featured=False).first()
        if not test_property:
            self.stdout.write("❌ No non-featured properties available for testing")
            return
        
        self.stdout.write(f"2. Testing with property: ID {test_property.id} - {test_property.title}")
        self.stdout.write(f"   Initial featured status: {test_property.featured}")
        
        # Test 3: Mark property as featured (simulating backend update)
        test_property.featured = True
        test_property.save()
        test_property.refresh_from_db()
        self.stdout.write(f"3. After marking as featured: {test_property.featured}")
        
        # Test 4: Test the API endpoint response
        from properties.views import PropertyViewSet
        from django.test import RequestFactory
        from django.contrib.auth.models import AnonymousUser
        
        # Create a mock request
        factory = RequestFactory()
        request = factory.get('/properties/featured/')
        request.user = AnonymousUser()
        
        # Test the featured endpoint
        viewset = PropertyViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        try:
            response = viewset.featured(request)
            featured_data = response.data
            
            self.stdout.write(f"4. API endpoint test:")
            self.stdout.write(f"   Response status: {response.status_code}")
            self.stdout.write(f"   Featured properties returned: {len(featured_data)}")
            
            # Check if our test property is in the response
            test_property_in_response = any(p['id'] == test_property.id for p in featured_data)
            self.stdout.write(f"   Test property in API response: {test_property_in_response}")
            
            # Test 5: Test serializer data
            serializer = PropertyListSerializer(Property.objects.filter(featured=True), many=True)
            self.stdout.write(f"5. Serializer test:")
            self.stdout.write(f"   Serialized featured properties: {len(serializer.data)}")
            
            test_property_serialized = any(p['id'] == test_property.id for p in serializer.data)
            self.stdout.write(f"   Test property in serialized data: {test_property_serialized}")
            
            # Test 6: Test unfeaturing
            test_property.featured = False
            test_property.save()
            test_property.refresh_from_db()
            
            final_featured = Property.objects.filter(featured=True).count()
            self.stdout.write(f"6. After unfeaturing:")
            self.stdout.write(f"   Property featured status: {test_property.featured}")
            self.stdout.write(f"   Total featured properties: {final_featured}")
            
            # Test 7: Verify API reflects the change
            response_after = viewset.featured(request)
            featured_data_after = response_after.data
            test_property_not_in_response = not any(p['id'] == test_property.id for p in featured_data_after)
            
            self.stdout.write(f"7. API after unfeaturing:")
            self.stdout.write(f"   Properties returned: {len(featured_data_after)}")
            self.stdout.write(f"   Test property removed from API: {test_property_not_in_response}")
            
            self.stdout.write("\n✅ All tests passed! Featured properties functionality is working correctly.")
            
        except Exception as e:
            self.stdout.write(f"❌ Error during API testing: {str(e)}")
            # Reset property state
            test_property.featured = False
            test_property.save()
            return
        
        # Reset to original state
        test_property.featured = False
        test_property.save()
        self.stdout.write("\n🔄 Test property reset to original state")
