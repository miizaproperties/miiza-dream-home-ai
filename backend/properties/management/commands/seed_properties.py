from django.core.management.base import BaseCommand
from properties.models import Property, PropertyImage
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with sample property data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database with sample properties...')
        
        # Clear existing properties
        Property.objects.all().delete()
        
        # Sample properties data matching frontend expectations
        properties_data = [
            {
                'title': 'Langata Heritage House',
                'description': 'Beautiful heritage house in the heart of Langata with modern amenities and traditional charm.',
                'property_type': 'house',
                'status': 'available',
                'address': '123 Langata Road',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 3,
                'bathrooms': 2,
                'square_feet': 1800,
                'max_guests': 6,
                'price': 19500000,  # KSh 19.5M
                'rental_price_per_night': 150,
                'currency': 'USD',
                'is_for_sale': False,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Parking', 'Garden', 'Security'],
                'featured': True,
            },
            {
                'title': 'Kasarani Family Villa',
                'description': 'Spacious family villa perfect for large gatherings and extended stays.',
                'property_type': 'villa',
                'status': 'available',
                'address': '456 Kasarani Estate',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 5,
                'bathrooms': 3,
                'square_feet': 2500,
                'max_guests': 10,
                'price': 32500000,  # KSh 32.5M
                'rental_price_per_night': 200,
                'currency': 'USD',
                'is_for_sale': False,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Pool', 'Parking', 'Garden', 'Security', 'Gym'],
                'featured': True,
            },
            {
                'title': 'Westlands Business Suite',
                'description': 'Modern apartment in the business district, perfect for professionals.',
                'property_type': 'apartment',
                'status': 'available',
                'address': '789 Westlands Avenue',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 2,
                'bathrooms': 2,
                'square_feet': 1200,
                'max_guests': 4,
                'price': 15600000,  # KSh 15.6M
                'rental_price_per_night': 180,
                'currency': 'USD',
                'is_for_sale': False,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Parking', 'Security', 'Gym', 'Elevator'],
                'featured': True,
            },
            {
                'title': 'Historic Swahili House',
                'description': 'Authentic Swahili architecture with ocean views and traditional features.',
                'property_type': 'traditional_home',
                'status': 'available',
                'address': '321 Old Town',
                'city': 'Mombasa',
                'country': 'Kenya',
                'bedrooms': 3,
                'bathrooms': 2,
                'square_feet': 1600,
                'max_guests': 6,
                'price': 15600000,  # KSh 15.6M
                'rental_price_per_night': 120,
                'currency': 'USD',
                'is_for_sale': False,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Parking', 'Garden', 'Ocean View'],
                'featured': False,
            },
            {
                'title': 'Nyali Beach Villa',
                'description': 'Luxurious beachfront villa with private access to pristine beaches.',
                'property_type': 'villa',
                'status': 'available',
                'address': '555 Nyali Beach Road',
                'city': 'Mombasa',
                'country': 'Kenya',
                'bedrooms': 4,
                'bathrooms': 3,
                'square_feet': 2200,
                'max_guests': 8,
                'price': 32500000,  # KSh 32.5M
                'rental_price_per_night': 250,
                'currency': 'USD',
                'is_for_sale': False,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Pool', 'Beach Access', 'Parking', 'Security', 'BBQ'],
                'featured': True,
            },
            {
                'title': 'Umoja Wellness Retreat',
                'description': 'Peaceful retreat perfect for relaxation and wellness activities.',
                'property_type': 'house',
                'status': 'available',
                'address': '888 Umoja Estate',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 2,
                'bathrooms': 2,
                'square_feet': 1100,
                'max_guests': 4,
                'price': 13000000,  # KSh 13M
                'rental_price_per_night': 130,
                'currency': 'USD',
                'is_for_sale': False,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Garden', 'Yoga Space', 'Parking'],
                'featured': False,
            },
            {
                'title': 'Karen Luxury Estate',
                'description': 'Exclusive estate in Karen with panoramic views and premium finishes.',
                'property_type': 'villa',
                'status': 'available',
                'address': '100 Karen Road',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 5,
                'bathrooms': 4,
                'square_feet': 4200,
                'max_guests': 10,
                'price': 85000000,  # KSh 85M
                'rental_price_per_night': 500,
                'currency': 'KSH',
                'is_for_sale': True,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Pool', 'Gym', 'Cinema', 'Garden', 'Security', 'Staff Quarters'],
                'featured': True,
            },
            {
                'title': 'Kilimani Modern Apartment',
                'description': 'Contemporary 2-bedroom apartment in vibrant Kilimani neighborhood.',
                'property_type': 'apartment',
                'status': 'available',
                'address': '234 Kilimani Road',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 2,
                'bathrooms': 2,
                'square_feet': 1200,
                'max_guests': 4,
                'price': 15000000,  # KSh 15M
                'rental_price_per_night': 100,
                'currency': 'KSH',
                'is_for_sale': True,
                'is_for_rent': False,
                'amenities': ['WiFi', 'Parking', 'Security', 'Backup Generator'],
                'featured': False,
            },
            {
                'title': 'Upperhill Executive Office',
                'description': 'Premium office space in the heart of Nairobi\'s business district.',
                'property_type': 'office',
                'status': 'available',
                'address': '777 Upperhill Plaza',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 0,
                'bathrooms': 3,
                'square_feet': 3000,
                'max_guests': 20,
                'price': 45000000,  # KSh 45M
                'rental_price_per_night': 300,
                'currency': 'KSH',
                'is_for_sale': True,
                'is_for_rent': True,
                'amenities': ['WiFi', 'Parking', 'Security', 'Conference Room', 'Elevator', 'AC'],
                'featured': False,
            },
            {
                'title': 'Lavington Family Home',
                'description': 'Charming family home in the prestigious Lavington area.',
                'property_type': 'house',
                'status': 'available',
                'address': '999 Lavington Drive',
                'city': 'Nairobi',
                'country': 'Kenya',
                'bedrooms': 4,
                'bathrooms': 3,
                'square_feet': 2800,
                'max_guests': 8,
                'price': 55000000,  # KSh 55M
                'rental_price_per_night': 250,
                'currency': 'KSH',
                'is_for_sale': True,
                'is_for_rent': False,
                'amenities': ['WiFi', 'Garden', 'Parking', 'Security', 'Fireplace'],
                'featured': True,
            },
        ]
        
        created_count = 0
        for prop_data in properties_data:
            property_obj = Property.objects.create(**prop_data)
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'Created: {property_obj.title}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {created_count} properties!'))
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))

