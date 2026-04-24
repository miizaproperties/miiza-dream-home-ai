# Data migration: populate slug for existing properties (same logic as Model.save)
# Uses raw SQL for read so we don't require the slug column to exist when 0008 wasn't applied to DB.
# Ensures slug column exists (for when migration state has 0008 but DB does not), then populates.

from django.db import migrations, connection
from django.utils.text import slugify


def ensure_slug_column_and_populate(apps, schema_editor):
    with connection.cursor() as cursor:
        # Check if slug column exists - SQLite compatible
        try:
            cursor.execute("PRAGMA table_info(properties_property)")
            columns = [row[1] for row in cursor.fetchall()]
            column_missing = 'slug' not in columns
        except:
            # Fallback for other databases
            try:
                cursor.execute("SELECT slug FROM properties_property LIMIT 1")
                column_missing = False
            except:
                column_missing = True
                
        if column_missing:
            cursor.execute("""
                ALTER TABLE properties_property
                ADD COLUMN slug VARCHAR(200) DEFAULT '' NOT NULL
            """)
        cursor.execute("SELECT id, title FROM properties_property")
        rows = cursor.fetchall()
    seen = {}
    for pk, title in rows:
        base = (slugify(title) or '').strip('-') or 'property'
        slug = base
        n = 0
        while slug in seen:
            n += 1
            slug = f"{base}-{n}"
        seen[slug] = True
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE properties_property SET slug = %s WHERE id = %s",
                [slug, pk],
            )
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS properties_property_slug_uniq
            ON properties_property (slug)
        """)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0008_property_slug'),
    ]

    operations = [
        migrations.RunPython(ensure_slug_column_and_populate, noop),
    ]
