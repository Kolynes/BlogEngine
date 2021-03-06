from django.http import FileResponse, HttpResponseRedirect, HttpResponse, JsonResponse
from django.core.paginator import Paginator
from utils.shortcuts import json_response
from datetime import datetime
from . import models
import os
import json

def comment(request):
    data = json.loads(request.body.decode("utf8"))
    reference = None
    if models.Comment.objects.filter(pk=data["reference"]).exists():
        reference = models.Comment.objects.get(pk=data["reference"])
    models.Comment(
        name=data["name"],
        text=data["text"],
        reference=reference,
        article=models.Article.objects.get(hash=data["article"])
    ).save()
    return JsonResponse({
        "result": True
    })

def comments(request):
    page = request.GET.get("page", None)
    article = request.GET["article"]
        #comments = models.Comment.objects.get
    if page:
        pass

def add_to_mailing_list(request):
    data = json.loads(request.body.decode("utf8"))
    mailing_list_file = open("mailing_list.txt", "a")
    mailing_list_file.write("%s\n" %data["email"])
    mailing_list_file.close()
    return JsonResponse({
        "result": True
    })

def download(request):
    file = models.FileLikeObject.objects.get(pk=request.GET["file"])
    response = FileResponse(file.file)
    response["Content-Type"] = "application/octet-stream"
    response["Content-Length"] = file.file.size
    response["Content-Disposition"] = "filename=%s" %file.name
    return response

def preview(request):
    file = models.FileLikeObject.objects.get(pk=request.GET["file"])
    if request.GET.get("embedded", False) == "video":
        return HttpResponse("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta name='viewport' content='initial-scale=0.71, width=device-width'>
            <style>
                video{
                    width: 100%%;
                    height: 80vh
                }
            </style>
        </head>
        <body>
            <center>
                <video src='/preview/?file=%s' controls></video>
            </center>
        </body>
        </html>
        """ %request.GET["file"])
    elif request.GET.get("embedded", False) == "audio":
        return HttpResponse("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta name='viewport' content='initial-scale=1, width=device-width'>
        </head>
        <body >
            <center>
                <br>
                <audio src='/preview/?file=%s' style='width:100%%; height:.5em' controls></audio>
            </center>
        </body>
        </html>
        """ %request.GET["file"])
    response = FileResponse(file.file)
    response["Content-Type"] = file.type
    response["Content-Length"] = file.file.size
    response["Content-Disposition"] = "filename=%s" %file.name
    return response

def load_article(request):
    data = json.loads(request.body.decode("utf8"))
    article = models.Article.objects.get(pk=data["pk"]).get_details_dict_value()
    return JsonResponse({
        "result": True,
        "article": article
    })

def articles(request):
    articles = []
    query = request.GET.get("q", "")
    for article in models.Article.objects.all():
        if not request.session.get("username") and not article.published:
            continue
        elif query.upper() in article.title.upper() or query.upper() in article.category.name.upper():
            articles.append(article.get_list_dict_value())
        else:
            for tag in article.tags.all():
                if query.upper() in tag.name.upper():
                    articles.append(article.get_list_dict_value())
                    break
    paginator = Paginator(articles, 25)
    page = paginator.get_page(request.GET.get("page", 1))

    return JsonResponse({
        "result": True,
        "articles": page.object_list,
        "hasNextPage": page.has_next()
    })

def events(request):
    events = []
    query = request.GET.get("q", "")
    from_date = request.GET.get("from")
    to_date = request.GET.get("to")
    if from_date and to_date:
        from_date = from_date.split("-")
        to_date = to_date.split("-")
        for i in range(3):
            from_date[i] = int(from_date[i])
            to_date[i] = int(to_date[i])
        events_query = models.Event.objects.filter(name__contains=query, date__gte=datetime(*from_date), date__lte=datetime(*to_date))
    else:
        events_query = models.Event.objects.filter(name__contains=query)
    for event in events_query:
        events.append(event.values())
    paginator = Paginator(events, 25)
    page = paginator.get_page(request.GET.get("page", 1))
    return json_response(True, data={"events": page.object_list, "hasNextPage": page.has_next()})

def gallery(request):
    images = []
    query = request.GET.get("q", "")
    for image in models.GalleryImage.objects.all():
        if query.upper() in image.text.upper():
            images.append(image.get_dict_value())
    paginator = Paginator(images, 25)
    page = paginator.get_page(request.GET.get("page", 1))

    return JsonResponse({
        "result": True,
        "images": page.object_list,
        "hasNextPage": page.has_next()
    })

def load_event(request):
    data = json.loads(request.body.decode("utf8"))
    event = models.Event.objects.get(pk=data["pk"]).get_dict_value()
    return JsonResponse({
        "result": True,
        "event": event
    })

def load_gallery_image(request):
    data = json.loads(request.body.decode("utf8"))
    image = models.GalleryImage.objects.get(pk=data["pk"]).get_dict_value()
    return JsonResponse({
        "result": True,
        "image": image
    })