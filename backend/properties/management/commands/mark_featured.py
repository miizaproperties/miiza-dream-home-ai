"""
Management command to mark properties as featured
"""
from django.core.management.base import BaseCommand
from properties.models import Property


class Command(BaseCommand):
    help = 'Mark properties as featured. Usage: python manage.py mark_featured --all or --ids 1,2,3 or --count 5'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Mark all properties as featured',
        )
        parser.add_argument(
            '--ids',
            type=str,
            help='Comma-separated list of property IDs to mark as featured (e.g., 1,2,3)',
        )
        parser.add_argument(
            '--count',
            type=int,
            help='Mark the first N properties as featured (ordered by creation date)',
        )
        parser.add_argument(
            '--unmark',
            action='store_true',
            help='Unmark properties instead of marking them',
        )

    def handle(self, *args, **options):
        featured_value = not options.get('unmark', False)
        action = 'marked as featured' if featured_value else 'unmarked from featured'
        
        if options['all']:
            properties = Property.objects.all()
            count = properties.update(featured=featured_value)
            self.stdout.write(
                self.style.SUCCESS(f'Successfully {action} {count} property(ies).')
            )
        elif options['ids']:
            try:
                ids = [int(id.strip()) for id in options['ids'].split(',')]
                properties = Property.objects.filter(id__in=ids)
                count = properties.update(featured=featured_value)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully {action} {count} property(ies) with IDs: {options["ids"]}.')
                )
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Invalid IDs format. Please use comma-separated numbers (e.g., 1,2,3).')
                )
        elif options['count']:
            properties = Property.objects.order_by('-created_at')[:options['count']]
            count = properties.update(featured=featured_value)
            self.stdout.write(
                self.style.SUCCESS(f'Successfully {action} {count} property(ies) (newest first).')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Please specify --all, --ids, or --count. Use --help for more information.')
            )

