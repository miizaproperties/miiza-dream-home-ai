"""
Management command to check and fix Firebase Storage paths for properties.
This helps diagnose and fix issues with image paths that may have been duplicated.
"""
from django.core.management.base import BaseCommand
from properties.models import Property, PropertyImage
from config.firebase_storage import initialize_firebase, file_exists_in_firebase, get_file_url
from config.firebase_storage_backend import FirebaseStorage


class Command(BaseCommand):
    help = 'Check and fix Firebase Storage paths for property images'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Actually fix the paths (default: only check)',
        )
        parser.add_argument(
            '--property-id',
            type=int,
            help='Check only a specific property ID',
        )

    def handle(self, *args, **options):
        initialize_firebase()
        fix = options.get('fix', False)
        property_id = options.get('property_id')
        
        self.stdout.write(self.style.WARNING('Checking Firebase Storage paths...\n'))
        
        # Get properties to check
        if property_id:
            properties = Property.objects.filter(id=property_id)
        else:
            properties = Property.objects.all()
        
        issues_found = 0
        fixed_count = 0
        
        for property_obj in properties:
            self.stdout.write(f'\nProperty ID {property_obj.id}: {property_obj.title}')
            
            # Check main_image
            if property_obj.main_image:
                main_image_path = str(property_obj.main_image)
                self.stdout.write(f'  Main image path in DB: {main_image_path}')
                
                # Check if file exists at stored path
                exists_at_stored = file_exists_in_firebase(main_image_path)
                
                # Try normalized path
                storage = FirebaseStorage(location='properties')
                normalized_path = storage._normalize_path(main_image_path)
                exists_at_normalized = file_exists_in_firebase(normalized_path) if normalized_path != main_image_path else False
                
                if exists_at_stored:
                    self.stdout.write(self.style.SUCCESS(f'    ✓ File exists at stored path'))
                    try:
                        url = property_obj.main_image.url
                        self.stdout.write(f'    URL: {url}')
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'    ✗ Error getting URL: {e}'))
                elif exists_at_normalized:
                    self.stdout.write(self.style.WARNING(f'    ⚠ File exists at normalized path: {normalized_path}'))
                    issues_found += 1
                    if fix:
                        # Update the path in database (this is tricky - we'd need to update the FileField)
                        self.stdout.write(self.style.WARNING(f'    Note: Cannot automatically fix FileField paths. Manual update may be needed.'))
                else:
                    self.stdout.write(self.style.ERROR(f'    ✗ File does not exist at either path'))
                    self.stdout.write(f'    Tried: {main_image_path}')
                    if normalized_path != main_image_path:
                        self.stdout.write(f'    Tried: {normalized_path}')
                    issues_found += 1
            
            # Check PropertyImage objects
            for prop_image in property_obj.images.all():
                image_path = str(prop_image.image)
                self.stdout.write(f'  Image ID {prop_image.id} path in DB: {image_path}')
                
                exists_at_stored = file_exists_in_firebase(image_path)
                
                storage = FirebaseStorage(location='properties/images')
                normalized_path = storage._normalize_path(image_path)
                exists_at_normalized = file_exists_in_firebase(normalized_path) if normalized_path != image_path else False
                
                if exists_at_stored:
                    self.stdout.write(self.style.SUCCESS(f'    ✓ File exists at stored path'))
                elif exists_at_normalized:
                    self.stdout.write(self.style.WARNING(f'    ⚠ File exists at normalized path: {normalized_path}'))
                    issues_found += 1
                else:
                    self.stdout.write(self.style.ERROR(f'    ✗ File does not exist at either path'))
                    issues_found += 1
        
        self.stdout.write('\n' + '='*60)
        if issues_found > 0:
            self.stdout.write(self.style.WARNING(f'\nFound {issues_found} path issue(s)'))
            if not fix:
                self.stdout.write(self.style.WARNING('Run with --fix to attempt automatic fixes (limited)'))
        else:
            self.stdout.write(self.style.SUCCESS('\n✓ All image paths are valid!'))
        
        if fixed_count > 0:
            self.stdout.write(self.style.SUCCESS(f'\nFixed {fixed_count} path(s)'))

