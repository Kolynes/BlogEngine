from django.db import models

class FileLikeObject(models.Model):
    name = models.CharField(max_length=512)
    type = models.CharField(max_length=50)
    file = models.FileField(upload_to="files", null=True)
    uploaded_on = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, related_name="children")

    def get_dict(self):
        return {
            "name": self.name,
            "type": self.type,
            "uploadedOn": self.uploaded.timestamp() * 1000,
            "size": self.file.size if self.type != "directory" else 0,
            "items": len(self.filelikeobject_set.all()),
            "path": self.get_absolute_path(),
            "pk": self.pk
        }

    def get_children(self):
        return [child.get_dict() for child in self.children.all()]

    def get_absolute_path(self):
        parent = self.parent
        path = self.name
        while parent is not None:
            path = "%s/%s" %(parent.name, path)
            parent = parent.parent
        return path

    def __str__(self):
        return self.name
        
    @staticmethod
    def get_by_path(path):
        """
            returns an object by its 'absolute path'
        """
        breadcrumbs = path.split("/")
        file_like_object = None
        for breadcrumb in breadcrumbs:
            if breadcrumb != "":
                try:
                    file_like_object = file_like_object.filelikeobject_set.get(name=breadcrumb) if file_like_object else FileLikeObject.objects.get(name=breadcrumb)
                except FileLikeObject.DoesNotExist:
                    return None
        return file_like_object
