from django.db import models
from utils.code_generator import generate_code
from django.utils import timezone
from utils.models import PasswordField

class Admin(models.Model):
    hashcode = models.CharField(max_length=20, primary_key=True, default=generate_code(20))
    username = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    password = PasswordField()
    last_active = models.DateTimeField(auto_now_add=True) 
    current_activity = models.DateTimeField(auto_now_add=True)
    description = models.TextField(max_length=300, null=True)
    profile_picture = models.FileField(upload_to="profile-pictures", null=True)
    immunity = models.BooleanField(default=True)

    def get_details_dict_value(self):
        return {
            "username": self.username,
            "email": self.email, 
            "description": self.description,
            "fullName": self.name,
            "lastSignedIn": timezone.localtime(self.last_active).strftime("%a, %d %b, %Y %H:%M"),
            "hashcode": self.pk,
            "immunity": self.immunity
        }

    def get_list_dict_value(self):
        return {
            "username": self.username,
            "fullName": self.name,
            "hashcode": self.pk,
            "immunity": self.immunity
        }

class Verification(models.Model):
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    
class Tag(models.Model):
    name = models.CharField(max_length=100)

class Category(models.Model):
    name = models.CharField(max_length=100)    

class Article(models.Model):
    hashcode = models.CharField(max_length=20, primary_key=True, default=generate_code(20))
    title = models.CharField(max_length=1000)
    body = models.TextField()
    raw_body = models.TextField()
    tags = models.ManyToManyField(Tag)
    views = models.IntegerField(default=0)
    by = models.ForeignKey(Admin, on_delete=models.CASCADE, null=True)
    published = models.BooleanField(default=False)
    published_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    cover_photo = models.CharField(max_length=100, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    
    def get_details_dict_value(self):
        dict_value = {
            "title": self.title,
            "by": self.by.name,
            "views": self.views,
            "pk": self.pk,
            "published": self.published,
            "publishedOn": timezone.localtime(self.published_on).strftime("%a, %d %b, %Y %H:%M"),
            "lastModified": timezone.localtime(self.last_modified).strftime("%a, %d %b, %Y %H:%M"),
            "coverPhoto": self.cover_photo,
            "category": self.category.name if self.category else "",
            "body": self.body,
            "rawBody": self.raw_body
        }
        tags = []
        for tag in self.tags.all():
            tags.append(tag.name)
        dict_value["tags"] = tags
        return dict_value

    def get_list_dict_value(self):
        return {
            "title": self.title,
            "by": self.by.name,
            "views": self.views,
            "published": self.published,
            "pk": self.pk,
            "publishedOn": timezone.localtime(self.published_on).strftime("%a, %d %b, %Y %H:%M"),
            "lastModified": timezone.localtime(self.last_modified).strftime("%a, %d %b, %Y %H:%M"),
            "coverPhoto": self.cover_photo,
            "category": self.category.name if self.category else ""
        }

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["-published_on"]

class Comment(models.Model):
    name = models.CharField(max_length=100)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    reference = models.ForeignKey("self", null=True, on_delete=models.SET_NULL)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)

    def get_dict_value(self):
        return {
            "name": self.name,
            "text": self.text,
            "date": timezone.localtime(self.date).strftime("%d/%m/%Y %H:%M"),
            "reference": self.reference.pk if self.reference else None,
        }

    class Meta:
        ordering = ["-pk"]

class VisitorCount(models.Model):
    count = models.IntegerField(default=0)
    date = models.DateField(auto_now_add=True)

    def get_dict_value(self):
        return {
            "count": self.count,
            "date": timezone.localtime(self.date).strftime("%d/%m/%Y")
        }

class FileLikeObject(models.Model):
    hashcode = models.CharField(max_length=20, primary_key=True, default=generate_code(20))    
    name = models.CharField(max_length=512)
    type = models.CharField(max_length=50)
    file = models.FileField(upload_to="files", null=True)
    uploaded = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True)

    def get_dict_value(self):
        return {
            "name": self.name,
            "type": self.type,
            "uploaded": timezone.localtime(self.uploaded).strftime("%a, %d %b, %Y %H:%M"),
            "size": self.file.size if self.type != "directory" else 0,
            "items": len(self.filelikeobject_set.all()),
            "path": self.get_absolute_path(),
            "pk": self.pk
        }

    def get_items(self):
        items = []
        if self.type == "directory":
            for item in self.filelikeobject_set.all():
                items.append(item.get_dict_value())
        return items

    def get_absolute_path(self):
        if self.parent == None:
            return self.name 
        else: 
            return self.parent.get_absolute_path() + '/' + self.name

    def __str__(self):
        return self.name

    def get_size(self):
        size = 0
        if self.type == "directory":
            for item in self.filelikeobject_set.all():
                size += item.get_size()
        else:
            size = self.file.size 
        return size
        
    @staticmethod
    def get_by_path(path):
        breadcrumbs = path.split("/")
        file_like_object = FileLikeObject.objects.get_or_create(name="root", parent=None, type="directory")[0]
        breadcrumbs.pop(0)
        for breadcrumb in breadcrumbs:
            if breadcrumb != "":
                file_like_object = file_like_object.filelikeobject_set.get(name=breadcrumb)
        return file_like_object

class Mail(models.Model):
    subject = models.CharField(max_length=1000)
    editor_content = models.TextField()
    raw_content = models.TextField()
    is_draft = models.BooleanField(default=True)
    sent_on = models.DateTimeField(null=True)
    created = models.DateTimeField(auto_now_add=True)
    by = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True)

    def get_list_dict_value(self):
        return {
            "subject": self.subject,
            "isDraft": self.is_draft,
            "sentOn": timezone.localtime(self.sent_on).strftime("%a, %d %b, %Y %H:%M") if self.sent_on else "",
            "created": timezone.localtime(self.created).strftime("%a, %d %b, %Y %H:%M"),
            "by" : self.by.name,
            "pk": self.pk
        }

    def get_details_dict_value(self):
        return {
            "subject": self.subject,
            "isDraft": self.is_draft,
            "sentOn": timezone.localtime(self.sent_on).strftime("%a, %d %b, %Y %H:%M") if self.sent_on else "",
            "editorContent": self.editor_content,
            "rawContent": self.raw_content,
            "created": timezone.localtime(self.created).strftime("%a, %d %b, %Y %H:%M"),
            "pk": self.pk,
            "by" : self.by.name
        }

    def __str__(self):
        return self.subject

class GalleryImage(models.Model):
    image = models.CharField(max_length=100, null=True)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image

    def get_dict_value(self):
        return {
            "image": self.image,
            "text": self.text,
            "pk": self.pk,
            "date": timezone.localtime(self.date).strftime("%a, %d %b, %Y")
        }

    class Meta:
        ordering = ["-date"]

class Event(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateTimeField()
    notes = models.TextField()

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.name

    def get_dict_value(self):
        return {
            "name": self.name,
            "date": timezone.localtime(self.date).strftime("%a, %d %b, %Y"),
            "notes": self.notes,
            "pk": self.pk
        }