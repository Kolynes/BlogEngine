from django.db import models

class Comment(models.Model):
    class Meta:
        ordering = ["-pk"]

    name = models.CharField(max_length=100)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    reference = models.ForeignKey("self", null=True, on_delete=models.SET_NULL)
    article = models.ForeignKey("Article", on_delete=models.CASCADE)

    def get_dict(self):
        return {
            "name": self.name,
            "text": self.text,
            "date": self.date.timestamp() * 1000,
            "reference": {"name": self.reference.name, "text": self.reference.text, "pk": self.reference.pk} if self.reference else None,
            "pk": self.pk
        }

