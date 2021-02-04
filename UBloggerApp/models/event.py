from django.db import models

class Event(models.Model):
    class Meta:
        ordering = ["-pk"]

    name = models.CharField(max_length=100)
    picture = models.ForeignKey("FileLikeObject", on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField()
    notes = models.TextField()

    def __str__(self):
        return self.name

    def get_dict(self):
        return {
            "name": self.name,
            "date": self.date.timestamp() * 1000,
            "notes": self.notes,
            "picture": self.picture.file.name if self.picture else None,
            "pk": self.pk
        }