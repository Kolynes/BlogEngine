from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class BlogAdmin(User):
    user = models.OneToOneField(User, parent_link=True, related_name="blog_admin", on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to="profile-pictures", null=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField()
    last_active = models.DateTimeField()
    settings = models.TextField(null=True)

    def get_dict(self):
        return {
            "username": self.get_username(),
            "name": self.display_name,
            "email": self.__dict__[Admin.get_email_field_name()],
            "description": self.description,
            "profilePicture": self.profile_picture.name if self.profile_picture else False,
            "lastActive": self.last_active.timestamp() * 1000,
            "settings": self.settings
        }