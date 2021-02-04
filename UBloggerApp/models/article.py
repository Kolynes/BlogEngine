from django.db import models
from urllib import parse

class Article(models.Model):
    class Meta:
        ordering = ["-published_on"]

    url = models.TextField(primary_key=True)
    title = models.CharField(max_length=1000)
    description = models.TextField(null=True, blank=True)
    body = models.TextField()
    tags = models.ManyToManyField("Tag")
    views = models.IntegerField(default=0)
    by = models.ForeignKey("BlogAdmin", on_delete=models.SET_NULL, null=True)
    published = models.BooleanField(default=False)
    published_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    cover_photo = models.ForeignKey("FileLikeObject", on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey("Category", on_delete=models.SET_NULL, null=True)
    
    def get_dict(self):
        return {
            "url": self.url, 
            "title": self.title,
            "by": self.by.name if self.by else "Anonymous",
            "views": self.views,
            "published": self.published,
            "publishedOn": self.published_on.timestamp() * 1000,
            "lastModified": self.last_modified.timestamp() * 1000,
            "coverPhoto": self.cover_photo.file.name if self.cover_photo else None,
            "category": self.category.name if self.category else "",
            "tags": [tag.name for tag in self.tags.all()]
        }

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.url:
            self.url = parse.quote(self.title, self="")
        super().save(*args, **kwargs)

