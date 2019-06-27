# import json
import os
from django.utils import timezone
from threading import Thread
from time import sleep, time

from django.core.files import File
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponseRedirect, HttpResponseNotFound, HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.mail import send_mail

from . import models
from utils.code_generator import generate_code, generate_number_code

def ensure_signed_in(func):
    def decorated_func(request):
        if request.session.get("username", None):
            return func(request)
        else:
            return HttpResponseNotFound()
    return decorated_func

@ensure_csrf_cookie
def index(request):
    if request.session.get("username", False):
        return render(request, "BlogEngineApp/account.html")
    else:
        return render(request, "BlogEngineApp/index.html")

@ensure_signed_in
def ping(request):
    data = models.Admin.objects.get(username=request.session["username"]).get_details_dict_value()
    data["articleCount"] = models.Article.objects.count()
    data["eventCount"] = models.Event.objects.count()
    data["galleryCount"] = models.GalleryImage.objects.count()
    return JsonResponse({
        "result": True,
        "data": data
    })
    
def sign_in(request):
    if models.Admin.objects.filter(username=request.POST["username"]).exists():
        admin = models.Admin.objects.get(username=request.POST["username"])
        if admin.password == request.POST["password"]:
            request.session["username"] = request.POST["username"]
            if request.POST["keepSignedIn"] == False:
                request.session.set_expiry(0)
                print("expires on browser close")                
            admin.current_actitvity = timezone.now()
            admin.save()
            return JsonResponse({
                "result": True
            })
        else:
            return JsonResponse({
                "result": False,
                "error": "The password is incorrect."
            })
    else: 
        return JsonResponse({
            "result": False,
            "error": "Account does not exist."
        })

def sign_out(request):
    admin = models.Admin.objects.get(username=request.session["username"])
    admin.last_active = admin.current_activity
    admin.current_activity = timezone.now()
    admin.save()
    try:
        del request.session["username"]
    except KeyError:
        pass
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def create_admin(request):
    this_admin = models.Admin.objects.get(username=request.session["username"])
    if not this_admin.immunity:
        return JsonResponse({
            "result": False,
            "error": "You are not authorized to carry out this operation."
        })
    elif models.Admin.objects.filter(username=request.POST["username"]).exists():
        return JsonResponse({
            "result": False,
            "error": "The username is already in use."
        })
    elif models.Admin.objects.filter(email=request.POST["email"]).exists():
        return JsonResponse({
            "result": False,
            "error": "The email is already in use."
        })
    else:
        models.Admin(
            username=request.POST["username"],
            name=request.POST["name"],
            email=request.POST["email"],
            password=request.POST["password"],
            hash=generate_code(20),
            immunity=request.POST["immunity"]
        ).save()
        return JsonResponse({
            "result": True,
        })

@ensure_signed_in
def admins(request):
    admins_list = []
    for admin in models.Admin.objects.all():
        admins_list.append(admin.get_list_dict_value())
    return JsonResponse({
        "result": True,
        "admins": admins_list
    })

def find_admin(request):
    if models.Admin.objects.filter(username=request.GET.get("q", None)).exists():
        return JsonResponse({
            "result": True,
            "admin": models.Admin.objects.get(username=request.GET["q"]).get_list_dict_value()
        })
    else:
        return JsonResponse({
            "result": False,
        })

def send_verification_code(request):
    data = json.loads(request.body.decode("utf8"))
    admin = models.Admin.objects.get(pk=data["hash"])
    if request.GET["m"] == "send":
        code = generate_number_code(6)
        verification = models.Verification.objects.get_or_create(admin=admin)[0]
        verification.code = code
        verification.save()
    else:
        code = models.Verification.objects.get(admin=admin).code
    try:
        send_mail("Account Verification", "Hello %s,\n\tYour verification code is %s" %(admin.name, code), admin.email, [admin.email])
    except Exception as e:
        print(e)
        return JsonResponse({
            "result": False,
            "error": "Failed to send email. Please try again."
        })

    return JsonResponse({
        "result": True
    })

def verify(request):
    data = json.loads(request.body.decode("utf8"))
    if models.Verification.objects.filter(admin__pk=data["hash"], code=data["code"]).exists():
        models.Verification.objects.get(admin__pk=data["hash"], code=data["code"]).delete()
        return JsonResponse({
            "result": True
        })
    else:
        return JsonResponse({
            "result": False,
            "error": "Incorrect verification code."
        })

def reset_password(request):
    data = json.loads(request.body.decode("utf8"))
    admin = models.Admin.objects.get(pk=data["hash"])
    admin.password = data["newPassword"]
    admin.save()
    return JsonResponse({
        "result": True
    })  

@ensure_signed_in
def delete_admin(request):
    data = json.loads(request.body.decode("utf8"))
    if models.Admin.objects.filter(hash=data["hash"]).exists():
        admin = models.Admin.objects.get(hash=data["hash"])
        this_admin = models.Admin.objects.get(username=request.session["username"])
        if not this_admin.immunity:
            return JsonResponse({
                "result": False,
                "error": "You are not authorized to carry out this operation."
            })
        else:
            for article in admin.article_set.all():
                article.by = this_admin
                article.save()
            admin.delete()
            return JsonResponse({
                "result": True
            })

@ensure_signed_in
def delete_comment(request):
    data = json.loads(request.body.decode("utf8"))
    models.Comment.objects.get(pk=data["pk"]).delete()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def save_article(request):
    data = json.loads(request.body.decode("utf8"))
    operation = request.GET.get("o", "save")
    if not data["article"].get("pk", None):
        article = models.Article(
            by=models.Admin.objects.get(username=request.session["username"]),
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
        "result": True,
        "articleCount": models.Article.objects.count(),
        "articlePk": article.pk
    })

@ensure_signed_in
def delete_article(request):
    data = json.loads(request.body.decode("utf8"))
    models.Article.objects.get(pk=data["pk"]).delete()
    return JsonResponse({
        "result": True,
        "articleCount": models.Article.objects.count()
    })

@ensure_signed_in
def change_password(request):
    data = json.loads(request.body.decode("utf8"))
    admin = models.Admin.objects.get(username=request.session["username"])
    if admin.password != data['oldPassword']:
        return JsonResponse({
            "result": False,
            "error": "Incorrect password."
        })
    else:
        admin.password = data["newPassword"]
        admin.save()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def change_email(request):
    data = json.loads(request.body.decode("utf8"))
    admin = models.Admin.objects.get(username=request.session["username"])
    if admin.password != data['password']:
        return JsonResponse({
            "result": False,
            "error": "Incorrect password."
        })
    elif admin.email == data["newEmail"]:
        return JsonResponse({
            "result": True,
        })
    elif models.Admin.objects.filter(email=data["newEmail"]).exists():
        return JsonResponse({
            "result": False,
            "error": "This email belongs to another account."
        })
    else:
        admin.email = data["newEmail"]
        admin.save()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def change_username(request):
    data = json.loads(request.body.decode("utf8"))
    admin = models.Admin.objects.get(username=request.session["username"])
    if admin.password != data['password']:
        return JsonResponse({
            "result": False,
            "error": "Incorrect password."
        })
    elif admin.username == data["newUsername"]:
        return JsonResponse({
            "result": True,
        })
    elif models.Admin.objects.filter(username=data["newUsername"]).exists():
        return JsonResponse({
            "result": False,
            "error": "This email belongs to another account."
        })
    else:
        admin.username = data["newUsername"]
        admin.save()
        request.session["username"] = data["newUsername"]
    return JsonResponse({
        "result": True
    })

class FileSystem:
    @staticmethod
    @ensure_signed_in
    def list_directory(request):
        return JsonResponse({
            "result": True,
            "files": models.FileLikeObject.get_by_path(request.GET["path"]).get_items()
        })

    @staticmethod    
    @ensure_signed_in
    def upload(request):
        destination = models.FileLikeObject.get_by_path(request.GET["path"])
        for filename, file in request.FILES.items():
            new_item_name = filename
            i = 1
            while destination.filelikeobject_set.filter(name=new_item_name).exists():
                new_item_name = "%s_%s%s" %(os.path.splitext(filename)[0], i + 1, os.path.splitext(filename)[1])
                i += 1
            models.FileLikeObject(
                name=new_item_name,
                hash=generate_code(20),
                file=file,
                type=file.content_type,
                parent=destination
            ).save()

        return JsonResponse({
            "result": True,
        })

    @staticmethod
    @ensure_signed_in
    def delete(request):
        data = json.loads(request.body.decode("utf8"))
        for file in data["files"]:
            try:
                file = models.FileLikeObject.objects.get(pk=file)
                file.delete()
            except:
                pass
        return JsonResponse({
            "result": True,
        })
    
    @staticmethod 
    @ensure_signed_in
    def move(request):
        data = json.loads(request.body.decode("utf8"))
        destination = models.FileLikeObject.get_by_path(data["destination"])
        for item in data["items"]:
            item = models.FileLikeObject.objects.get(pk=item)
            new_item_name = item.name
            i = 1
            if destination.get_absolute_path() == item.parent.get_absolute_path():
                continue
            else:
                while destination.filelikeobject_set.filter(name=new_item_name).exists():
                    new_item_name = "%s_%s%s" %(os.path.splitext(item.name)[0], i + 1, os.path.splitext(item.name)[1])
                    i += 1
            item.parent = destination
            item.name = new_item_name
            item.save()
        return JsonResponse({
            "result": True
        })

    @staticmethod
    @ensure_signed_in
    def copy(request):
        data = json.loads(request.body.decode("utf8"))
        destination = models.FileLikeObject.get_by_path(data["destination"])
        for item in data["items"]:
            item = models.FileLikeObject.objects.get(pk=item)
            new_item_name = item.name
            i = 1
            if destination.get_absolute_path() == item.parent.get_absolute_path():
                while destination.filelikeobject_set.filter(name=new_item_name).exists():
                    new_item_name = "%s (copy%s)%s" %(os.path.splitext(item.name)[0], i or "", os.path.splitext(item.name)[1])
                    i += 1
            else:
                while destination.filelikeobject_set.filter(name=new_item_name).exists():
                    new_item_name = "%s_%s%s" %(os.path.splitext(item.name)[0], i + 1, os.path.splitext(item.name)[1])
                    i += 1
            new_item = models.FileLikeObject(
                name=new_item_name,
                hash=generate_code(20),
                type=item.type,
                parent=destination
            )
            new_file = open("%s%f" %(item.file.name[6:], time()), "w+b")
            new_file.write(item.file.open().read())
            new_item.file = File(new_file)
            new_item.save()
            new_file.close()
        return JsonResponse({
            "result": True
        })

    @staticmethod
    @ensure_signed_in
    def new_directory(request):
        data = json.loads(request.body.decode("utf8"))
        parent = models.FileLikeObject.get_by_path(data["parent"])
        if parent.filelikeobject_set.filter(name=data["name"]).exists():
            return JsonResponse({
                "result": False,
                "error": "Name already exists."
            })
        else:
            models.FileLikeObject(
                name=data["name"],
                type="directory",
                hash=generate_code(20),
                parent=parent
            ).save()
            return JsonResponse({
                "result": True
            })

    @staticmethod
    @ensure_signed_in
    def rename(request):
        data = json.loads(request.body.decode("utf8"))
        parent = models.FileLikeObject.get_by_path(data["parent"])
        if parent.filelikeobject_set.filter(name=data["name"]).exists():
            return JsonResponse({
                "result": False,
                "error": "Name already exists."
            })
        else:
            file_like_object = models.FileLikeObject.objects.get(pk=data["item"])
            file_like_object.name = data["name"]
            file_like_object.save()
            return JsonResponse({
                "result": True
            })

    @staticmethod
    @ensure_signed_in
    def search(request):
        files = models.FileLikeObject.objects.filter(name__contains=request.GET["q"]).all()
        search_results = []
        for file in files:
            if request.GET["path"] in file.get_absolute_path():
                search_results.append(file.get_dict_value())
        return JsonResponse({
            "result": True,
            "searchResults": search_results
        })

@ensure_signed_in
def change_description(request):
    data = json.loads(request.body.decode("utf8"))
    admin = models.Admin.objects.get(username=request.session["username"])
    admin.description = data["newDescription"]
    admin.save()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def change_profile_picture(request):
    admin = models.Admin.objects.get(username=request.session["username"])
    if admin.profile_picture:
        os.remove(admin.profile_picture.path)
    admin.profile_picture = request.FILES["picture"]
    admin.save()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def remove_profile_picture(request):
    admin = models.Admin.objects.get(username=request.session["username"])
    if bool(admin.profile_picture):
        os.remove(admin.profile_picture.path)
        admin.profile_picture = None
        admin.save()
    return JsonResponse({
        "result": True
    })        
        
@ensure_signed_in
def change_full_name(request):
    data = json.loads(request.body.decode("utf8"))
    admin = models.Admin.objects.get(username=request.session["username"])
    if admin.password == data["password"]:
        admin.name = data["newFullName"]
        admin.save()
        return JsonResponse({
            "result": True
        })
    else:
        return JsonResponse({
            "result": False,
            "error": "Incorrect Password"
        })

@ensure_signed_in
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
        "result": True,
        "searchResults": results
    })

@ensure_signed_in
def delete_tag(request):
    data = json.loads(request.body.decode("utf8"))
    models.Tag.objects.get(name=data["name"]).delete()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def edit_tag(request):
    data = json.loads(request.body.decode("utf8"))
    tag = models.Tag.objects.get(name=data["name"])
    tag.name = data["newName"]
    tag.save()
    return JsonResponse({
        "result": True
    })    

@ensure_signed_in
def create_tag(request):
    data = json.loads(request.body.decode("utf8"))
    models.Tag(
        name=data["name"]
    ).save()
    return JsonResponse({
        "result": True
    })  

@ensure_signed_in
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
        "result": True,
        "searchResults": results
    })

@ensure_signed_in
def delete_category(request):
    data = json.loads(request.body.decode("utf8"))
    category = models.Category.objects.get(name=data["name"])
    for article in category.article_set.all():
        article.category = models.Category.objects.get_or_create(name="Others")[0]
        article.save()
    category.delete()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
def edit_category(request):
    data = json.loads(request.body.decode("utf8"))
    category = models.Category.objects.get(name=data["name"])
    category.name = data["newName"].title()
    category.save()
    return JsonResponse({
        "result": True
    })   

@ensure_signed_in
def create_category(request):
    data = json.loads(request.body.decode("utf8"))
    models.Category(
        name=data["name"].title()
    ).save()
    return JsonResponse({
        "result": True
    }) 

@ensure_signed_in
def mailing_list(request):
    mailing_list = open("mailing_list.txt", "r").read()
    return HttpResponse(mailing_list)

@ensure_signed_in
def mail(request):
    data = json.loads(request.body.decode("utf8"))
    thread = Thread()
    def mail_process():
        if not data["isDraft"]:
            mailing_list = open("mailing_list.txt", "r").read().split("\n")
            for recipient in mailing_list:
                send_mail(data["subject"], "", "kolyneschinedu@gmail.com", [recipient], html_message=data["rawContent"])
    thread.run = mail_process
    thread.start()
    if data["pk"]:
        mail = models.Mail.objects.get(pk=data["pk"])
        mail.subject = data["subject"]
        mail.editor_content = data["editorContent"]
        mail.is_draft = data["isDraft"]
        mail.sent_on = timezone.now() if not data["isDraft"] else None
        mail.save()
    else:
        models.Mail(
            subject=data["subject"],
            editor_content=data["editorContent"],
            raw_content=data["rawContent"],
            is_draft=data["isDraft"],
            by=models.Admin.objects.get(username=request.session["username"]),
            created=timezone.now(),
            sent_on=timezone.now() if not data["isDraft"] else None
        ).save()
    return JsonResponse({
        "result": True
    }) 

@ensure_signed_in
def load_mail(request):
    mail = []
    query = request.GET.get("q", "")
    is_draft = request.GET.get("d", "false")
    for m in models.Mail.objects.filter(is_draft=(is_draft != "false")):
        if query.upper() in m.subject.upper() or query.upper() in m.raw_content.upper():
            mail.append(m.get_list_dict_value())
    paginator = Paginator(mail, 25)
    page = paginator.get_page(request.GET.get("page", 1))

    return JsonResponse({
        "result": True,
        "mail": page.object_list,
        "hasNextPage": page.has_next()
    })

@ensure_signed_in
def load_particular_mail(request):
    return JsonResponse({
        "result": True,
        "mail": models.Mail.objects.get(pk=request.GET["pk"]).get_details_dict_value()
    })

@ensure_signed_in
def delete_mail(request):
    models.Mail.objects.get(pk=request.GET["pk"]).delete()
    return JsonResponse({
        "result": True
    })

@ensure_signed_in
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
        "result": True,
        "galleryCount": models.GalleryImage.objects.count()
    }) 

@ensure_signed_in
def delete_gallery_image(request):
    models.GalleryImage.objects.get(pk=request.GET["pk"]).delete()
    return JsonResponse({
        "result": True,
        "galleryCount": models.GalleryImage.objects.count()
    })

@ensure_signed_in
def save_event(request):
    data = json.loads(request.body.decode("utf8"))
    if data.get("pk"):
        event = models.Event.objects.get(pk=data["pk"])
    else:
        event = models.Event()
    event.name = data["name"]
    event.notes = data["notes"]
    event.date = timezone.datetime.fromtimestamp(float(data["timestamp"]), timezone.get_default_timezone())
    print(event.date)
    event.save()

    return JsonResponse({
        "result": True,
        "eventCount": models.Event.objects.count()
    })

@ensure_signed_in
def delete_event(request):
    models.Event.objects.get(pk=request.GET["pk"]).delete()
    return JsonResponse({
        "result": True,
        "eventCount": models.Event.objects.count()
    })   

class CleanUpThread(Thread):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def run(self):
        while True:
            if "files" not in os.listdir():
                os.mkdir("files")
            elif len(os.listdir("files")):
                referenced_files = []
                for file_like_object in models.FileLikeObject.objects.all():
                    referenced_files.append(os.path.split(file_like_object.file.name)[1])
                for file in os.listdir("files"):
                    if file not in referenced_files:
                        try:
                            os.remove("files/%s" %file)
                        except:
                            pass

            if "profile-pictures" not in os.listdir():
                os.mkdir("profile-picture")
            elif len(os.listdir("profile-pictures")):
                referenced_profile_pictures = []
                for admin in models.Admin.objects.all():
                    referenced_profile_pictures.append(os.path.split(admin.profile_picture.file.name)[1])
                for file in os.listdir("profile-pictures"):
                    if file not in referenced_profile_pictures:
                        try:
                            os.remove("profile-pictures/%s" %file)
                        except:
                            pass
            sleep(3600 * 24)

# clean_up_thread = CleanUpThread()
# clean_up_thread.start()
