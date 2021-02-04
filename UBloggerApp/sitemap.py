from django.contrib.sitemaps import Sitemap
from . import models

class BlogEngineAppSitemap(Sitemap):
    changefreq = "never"
    priority = "0.5"

    # def location(self, obj):
    #     return "b"

    def items(self):
        return models.Article.objects.filter(published=True)
        