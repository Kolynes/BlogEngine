import os
from threading import Thread
from time import sleep, time
import datetime

from django.contrib.auth import authenticate, login, logout
from django.core.files import File
from django.core.mail import send_mail
from django.core.paginator import Paginator
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.conf import settings

from django.db import IntegrityError
from django.views.decorators.csrf import ensure_csrf_cookie

from utils.code_generator import generate_code, generate_number_code
from utils.decorators import ensure_signed_in, ensure_superuser
from utils.shortcuts import json_response

from . import models

def ensure_blog_admin(func):
    def wrapper(request):
        if request.user.blog_admin:
            return func(request)
        return json_response(False, error={"admin": "You are not a blog admin"})

class AdminController:

    @ensure_csrf_cookie
    @staticmethod
    def index(request):
        """
            This function loads the appropriate template. 
        """
        if settings.DEBUG:
            return render(request, "BlogEngineApp/debug.html")
        return render(request, "BlogEngineApp/index.html")

    @ensure_blog_admin
    @staticmethod
    def ping(request):
        """
            Returns necessary data for the current session
        """
        data = request.user.blog_admin.get_dict()
        data["articleCount"] = models.Article.objects.count()
        data["eventCount"] = models.Event.objects.count()
        data["galleryCount"] = models.GalleryImage.objects.count()
        return json_response(True, data=data)

#
# Admin Profile
#
    @ensure_blog_admin
    @staticmethod
    def update_profile(request):
        """
            Update the user's profile
        """
        name = request.POST["name"]
        request.user.first_name = name[:name.rindex(" ")]
        request.user.last_name = name[name.rindex(" ") + 1:]
        request.user.__dict__[models.User.get_email_field_name()] = request.POST["email"]
        request.user.admin.description = request.POST["description"]
        request.user.admin.save()
        request.user.save()
        return json_response(True)

    @ensure_blog_admin
    @staticmethod
    def change_profile_picture(request):
        """
            changes the admin's profile picture
        """
        if request.user.admin.profile_picture:
            try:
                os.remove(request.user.admin.profile_picture.path)
            except:
                pass
        request.user.admin.profile_picture = request.FILES["picture"]
        request.user.admin.save()
        return json_response(True)

    @ensure_blog_admin
    @staticmethod
    def remove_profile_picture(request):
        """
            removes the admin's profile picture
        """
        if bool(request.user.admin.profile_picture):
            try:
                os.remove(request.user.admin.profile_picture.path)
            except:
                pass
            request.user.admin.profile_picture = None
            request.user.admin.save()
        return json_response(True)


#
# Administration
#
    @ensure_blog_admin
    @staticmethod
    def admins(request):
        """
            return the complete list of admin accounts
        """
        admins_list = []
        for admin in models.Admin.objects.all():
            admins_list.append(admin.values())
        return json_response(True, data={"admins": admins_list})

    @ensure_blog_admin
    @staticmethod
    def create_admin(request):
        """
            creates a new admin account.
        """
        if not request.user.is_superuser:
            return json_response(False, error="You are not authorized to carry out this operation.")
        else:
            try:
                name = request.POST["name"]
                try:
                    first_name, last_name = name[:name.rindex(" ")].title(), name[name.rindex(" ") + 1:]
                except ValueError:
                    first_name, last_name = name, ""
                admin = models.Admin(
                    username=request.POST["username"].title(),
                    first_name= first_name,
                    last_name= last_name,
                    email=request.POST["email"],
                )
                admin.is_superuser = request.POST["superuser"] == "true"
                admin.set_password(request.POST["password"])
                admin.save()
                return json_response(True)
            except IntegrityError:
                return json_response(False, error="This username is not available")

    @ensure_blog_admin
    @staticmethod
    def delete_admin(request):
        """
            deletes an account, only superuser admins can delete account.
        """
        if not request.user.is_superuser:
            return json_response(False, error="You are not authorized to carry out this operation.")
        admin = models.Admin.objects.get(username=request.POST["username"])
        for article in admin.article_set.all():
            article.by = request.user
            article.save()
        admin.delete()
        return json_response(True)

   

#
# Articles
#
    @ensure_blog_admin
    @staticmethod
    def save_article(request):
        data = json.loads(request.body.decode("utf8"))
        operation = request.GET.get("o", "save")
        if not data["article"].get("pk", None):
            article = models.Article(
                by=models.Admin.objects.get(username=request.user.username),
                title=data["article"]["title"],
                body=data["article"]["body"],
                raw_body = data["article"]["rawBody"],
                published=(operation == "publish"),
                category=models.Category.objects.get_or_create(name=data["article"]["category"].title())[0],
                cover_photo=data["article"]["coverPhoto"],
                hash=generate_code(20)
            )
            article.save()
        else:
            article = models.Article.objects.get(pk=data["article"]["pk"])
            article.body = data["article"]["body"]
            article.raw_body = data["article"],
            article.title = data["article"]["title"]
            article.category = models.Category.objects.get_or_create(name=data["article"]["category"].title())[0]
            article.published = (operation =="publish")
            article.cover_photo = data["article"]["coverPhoto"]
        for tag in data["article"]['tags']:
            article.tags.add(models.Tag.objects.get_or_create(name=tag.lower())[0])
        article.save()
        return JsonResponse({
            "status": True,
            "articleCount": models.Article.objects.count(),
            "articlePk": article.pk
        })

    @ensure_blog_admin
    @staticmethod
    def delete_article(request):
        data = json.loads(request.body.decode("utf8"))
        models.Article.objects.get(pk=data["pk"]).delete()
        return JsonResponse({
            "status": True,
            "articleCount": models.Article.objects.count()
        })


#
# Comments
#
    @ensure_blog_admin
    @staticmethod
    def delete_comment(request):
        data = json.loads(request.body.decode("utf8"))
        models.Comment.objects.get(pk=data["pk"]).delete()
        return JsonResponse({
            "status": True
        })


#
# Tags
#
    @ensure_blog_admin
    @staticmethod
    def tags(request):
        data = json.loads(request.body.decode("utf8"))
        tags_list = models.Tag.objects.all()
        results = []
        for tag in tags_list:
            if data["searchString"] in tag.name:
                if request.GET.get("details", None):
                    results.append({
                        "name": tag.name,
                        "articles": tag.article_set.count()
                    })
                else:
                    results.append(tag.name)
        return JsonResponse({
            "status": True,
            "searchResults": results
        })

    @ensure_blog_admin
    @staticmethod
    def delete_tag(request):
        data = json.loads(request.body.decode("utf8"))
        models.Tag.objects.get(name=data["name"]).delete()
        return JsonResponse({
            "status": True
        })

    @ensure_blog_admin
    @staticmethod
    def edit_tag(request):
        data = json.loads(request.body.decode("utf8"))
        tag = models.Tag.objects.get(name=data["name"])
        tag.name = data["newName"]
        tag.save()
        return JsonResponse({
            "status": True
        })    

    @ensure_blog_admin
    @staticmethod
    def create_tag(request):
        data = json.loads(request.body.decode("utf8"))
        models.Tag(
            name=data["name"]
        ).save()
        return JsonResponse({
            "status": True
        })  


#
# Categories
#
    @ensure_blog_admin
    @staticmethod
    def categories(request):
        categories_list = models.Category.objects.all()
        results = []
        for category in categories_list:
            if request.GET.get("details", None):
                results.append({
                    "name": category.name,
                    "articles": category.article_set.count()
                })
            else:
                results.append(category.name)
        return JsonResponse({
            "status": True,
            "searchResults": results
        })

    @ensure_blog_admin
    @staticmethod
    def delete_category(request):
        data = json.loads(request.body.decode("utf8"))
        category = models.Category.objects.get(name=data["name"])
        for article in category.article_set.all():
            article.category = models.Category.objects.get_or_create(name="Others")[0]
            article.save()
        category.delete()
        return JsonResponse({
            "status": True
        })

    @ensure_blog_admin
    @staticmethod
    def edit_category(request):
        data = json.loads(request.body.decode("utf8"))
        category = models.Category.objects.get(name=data["name"])
        category.name = data["newName"].title()
        category.save()
        return JsonResponse({
            "status": True
        })   

    @ensure_blog_admin
    @staticmethod
    def create_category(request):
        data = json.loads(request.body.decode("utf8"))
        models.Category(
            name=data["name"].title()
        ).save()
        return JsonResponse({
            "status": True
        }) 


#
# Gallery Images
#
    @ensure_blog_admin
    @staticmethod
    def save_gallery_image(request):
        data = json.loads(request.body.decode("utf8"))
        if data.get("pk"):
            gallery_entry = models.GalleryImage.objects.get(pk=data["pk"])
        else:
            gallery_entry = models.GalleryImage()
        gallery_entry.image = pk=data["image"]
        gallery_entry.text = data["text"]
        gallery_entry.save()
        return JsonResponse({
            "status": True,
            "galleryCount": models.GalleryImage.objects.count()
        }) 

    @ensure_blog_admin
    @staticmethod
    def delete_gallery_image(request):
        models.GalleryImage.objects.get(pk=request.GET["pk"]).delete()
        return JsonResponse({
            "status": True,
            "galleryCount": models.GalleryImage.objects.count()
        })


#
# Events
#
    @ensure_blog_admin
    @staticmethod
    def save_event(request):
        if request.POST.get("pk"):
            event = models.Event.objects.get(pk=request.POST["pk"])
        else:
            event = models.Event()
        date = request.POST["date"].split("-")
        for i in range(3):
            date[i] = int(date[i])
        event.name = request.POST["name"]
        event.notes = request.POST["notes"]
        event.date = datetime.datetime(*date)
        if request.POST["picture"].isnumeric():
            event.picture = models.FileLikeObject.objects.get(pk=request.POST["picture"])
        else:
            event.picture = None
        event.save()
        return json_response(True, data={"eventCount": models.Event.objects.count()})

    @ensure_blog_admin
    @staticmethod
    def delete_event(request):
        models.Event.objects.get(pk=request.GET["pk"]).delete()
        return json_response(True, data={"eventCount": models.Event.objects.count()})