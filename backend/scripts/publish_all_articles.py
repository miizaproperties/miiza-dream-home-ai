"""
Script to mark all articles as published
Run this from Django shell: python manage.py shell
Then: exec(open('backend/scripts/publish_all_articles.py').read())
"""
from news.models import Article

# Get all unpublished articles
unpublished = Article.objects.filter(published=False)
count = unpublished.count()

if count > 0:
    # Mark all as published
    unpublished.update(published=True)
    print(f"✅ Successfully published {count} article(s)")
    
    # Show summary
    total = Article.objects.count()
    published_count = Article.objects.filter(published=True).count()
    print(f"📊 Total articles: {total}")
    print(f"✅ Published: {published_count}")
    print(f"📝 Unpublished: {total - published_count}")
else:
    print("ℹ️  All articles are already published")

