from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time
from events.models import Event
from accounts.models import User


class Command(BaseCommand):
    help = 'Create MIIZA Property Forum 2026 event'

    def handle(self, *args, **options):
        # Try to get an admin user, or create a system user
        admin_user = None
        try:
            admin_user = User.objects.filter(is_staff=True, is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.filter(is_staff=True).first()
        except:
            pass

        # Check if event already exists
        existing_event = Event.objects.filter(slug='miiza-property-forum-2026').first()
        if existing_event:
            self.stdout.write(
                self.style.WARNING(f'Event already exists: {existing_event.title}')
            )
            return

        # Create the event
        event = Event.objects.create(
            title='MIIZA Property Forum 2026',
            description='Join us for an exclusive Property Forum featuring the Oak Residency portfolio—Luna Oak, Oak West, Oak Breeze, and more.',
            content="""
<p>Join us for an exclusive Property Forum featuring the Oak Residency portfolio including:</p>
<ul>
    <li>Luna Oak</li>
    <li>Oak West</li>
    <li>Oak Breeze</li>
    <li>And many more exciting properties</li>
</ul>

<p>This exclusive event will showcase premium residential properties with investment opportunities, detailed presentations, and networking with industry professionals.</p>

<p>Don't miss this opportunity to explore the future of luxury living in Nairobi.</p>
            """,
            event_date=date(2026, 4, 25),
            event_time=time(9, 0),
            location='IHIT Nairobi',
            contact_email='info@miizaproperties.com',
            contact_phone='+254 700 000 000',
            is_published=True,
            is_featured=True,
            created_by=admin_user
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created event: {event.title}')
        )
        self.stdout.write(f'Event ID: {event.id}')
        self.stdout.write(f'Event Slug: {event.slug}')
        self.stdout.write(f'Event Date: {event.event_date}')
        self.stdout.write(f'Event Time: {event.event_time}')