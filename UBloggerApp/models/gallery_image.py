from django.db import models

class GalleryImage(models.Model):
    class Meta:
        ordering = ["-pk"]

    image = models.ForeignKey("FileLikeObject", on_delete=models.CASCADE)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image

    def get_dict(self):
        return {
            "image": self.image.file.name,
            "text": self.text,
            "date": self.date.timestamp() * 1000,
            "pk": self.pk,
        }

