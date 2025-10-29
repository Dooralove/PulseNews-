from celery import shared_task
from newspaper import Article as NPArticle
from .models import Article

@shared_task
def parse_and_create_article(url):
    try:
        a = NPArticle(url)
        a.download()
        a.parse()
        title = a.title or 'Без названия'
        content = a.text or ''
        slug = title.lower().replace(' ', '-')[:200]
        art, created = Article.objects.get_or_create(
            source_url=url,
            defaults={'title': title, 'content': content, 'slug': slug}
        )
        return f"created: {created}"
    except Exception as e:
        return str(e)
