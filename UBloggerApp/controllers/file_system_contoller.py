from utils.shortcuts import 
class FileSystem:
        @staticmethod
        @ensure_blog_admin
        def list_directory(request):
            """
                list the files and folders in a directory
            """
            if not (request.GET["path"].startswith(request.user.username) or request.GET["path"].startswith("Public")):
                return json_response(False, error="Directory not found")
            else:
                directory = models.FileLikeObject.get_by_path(request.GET["path"])
                if not directory:
                    if request.GET["path"] == "Public":
                        directory = models.FileLikeObject(name="Public")
                        directory.save()
                    else: 
                        return json_response(False, error="Directory not found!")
                return json_response(True, data={"children": directory.children()})

        @staticmethod
        @ensure_blog_admin
        def new_directory(request):
            """
                creates a new directory
            """
            if not (request.POST["parent"].startswith(request.user.username) or request.POST["parent"].startswith("Public")):
                return json_response(False, error="The parent directory '%s' does not exist" %request.POST["parent"])
            parent = models.FileLikeObject.get_by_path(request.POST["parent"])
            if not parent:
                if request.POST["parent"] == "Public":
                    parent = models.FileLikeObject(name="Public", type="directory")
                    parent.save()
                else: 
                    return json_response(False, error="The parent directory '%s' does not exist" %request.POST["parent"])
            if parent.filelikeobject_set.filter(name=request.POST["name"]).exists():
                return json_response(False, error="Directory '%s' already exists!" %request.POST["name"])
            else:
                models.FileLikeObject(
                    name=request.POST["name"],
                    type="directory",
                    parent=parent
                ).save()
                return json_response(True)

        @staticmethod
        @ensure_blog_admin
        def rename(request):
            file_like_object = models.FileLikeObject.objects.get(pk=request.POST["item"])
            file_like_object_path = file_like_object.get_absolute_path()
            if not file_like_object_path.startswith(request.user.username) or not file_like_object_path.startswith("Public"):
                return json_response(False, error="The file or directory '%s' does not exist" %file_like_object_path)
            parent = file_like_object.parent
            if parent.filelikeobject_set.filter(name=request.POST["name"]).exists():
                return json_response(True, error="The name already exists.")
            else:
                file_like_object.name = request.POST["name"]
                file_like_object.save()
                return json_response(True)

        @staticmethod
        @ensure_blog_admin
        def delete(request):
            error_count = 0
            for file in request.POST["items"].split(","):
                try:
                    file = models.FileLikeObject.objects.get(pk=file)
                    if file.get_absolute_path().startswith(request.user.username) or file.get_absolute_path().startswith("Public"):
                        file.delete()
                    else:
                        error_count += 1
                except Exception as e:
                    print(e)
            return json_response(True, data={"errorCount": error_count})

        @staticmethod 
        @ensure_blog_admin
        def move(request):
            destination = models.FileLikeObject.get_by_path(request.POST["destination"])
            error_count = 0
            for item in request.POST["items"].split(","):
                item = models.FileLikeObject.objects.get(pk=item)
                new_item_name = item.name
                i = 1
                if item.type == "directory":
                    error_count += 1
                elif not (item.parent.get_absolute_path().startswith(request.user.username) or item.parent.get_absolute_path().startswith("Public")):
                    error_count += 1
                elif not (request.POST["destination"].startswith(request.user.username) or request.POST["destination"].startswith("Public")):
                    error_count += 1
                elif request.POST["destination"] == item.parent.get_absolute_path(): 
                    error_count += 1
                else:
                    while destination.filelikeobject_set.filter(name=new_item_name).exists():
                        new_item_name = "%s_%s%s" %(os.path.splitext(item.name)[0], i + 1, os.path.splitext(item.name)[1])
                        i += 1
                    item.parent = destination
                    item.name = new_item_name
                    item.save()
            return json_response(True, data={"errorCount": error_count})

        @staticmethod
        @ensure_blog_admin
        def copy(request):
            destination = models.FileLikeObject.get_by_path(request.POST["destination"])
            error_count = 0
            for item in request.POST["items"].split(","):
                item = models.FileLikeObject.objects.get(pk=item)
                new_item_name = item.name
                i = 1
                if item.type == "directory":
                    error_count += 1
                elif not (item.parent.get_absolute_path().startswith(request.user.username) or item.parent.get_absolute_path().startswith("Public")):
                    error_count += 1
                elif not (request.POST["destination"].startswith(request.user.username) or request.POST["destination"].startswith("Public")):
                    error_count += 1
                elif request.POST["destination"] == item.parent.get_absolute_path():
                    while destination.filelikeobject_set.filter(name=new_item_name).exists():
                        new_item_name = "%s (copy %s)%s" %(os.path.splitext(item.name)[0], i or "", os.path.splitext(item.name)[1])
                        i += 1
                else:
                    while destination.filelikeobject_set.filter(name=new_item_name).exists():
                        new_item_name = "%s_%s%s" %(os.path.splitext(item.name)[0], i + 1, os.path.splitext(item.name)[1])
                        i += 1
                new_item = models.FileLikeObject(
                    name=new_item_name,
                    type=item.type,
                    parent=destination
                )
                new_file = open("%s%f" %(item.file.name[6:], time()), "w+b")
                new_file.write(item.file.open().read())
                new_item.file = File(new_file)
                new_item.save()
                new_file.close()
            return json_response(True, data={"errorCount": error_count})

        @staticmethod
        @ensure_blog_admin
        def search(request):
            files = models.FileLikeObject.objects.filter(name__contains=request.GET["q"]).all()
            search_results = []
            for file in files:
                if request.GET["path"] in file.get_absolute_path() and (request.GET["path"].startswith(request.user.username) or request.GET["path"].startswith("Public")):
                    search_results.append(file.values())
            return json_response(True, data={"results": search_results})

        @staticmethod    
        @ensure_blog_admin
        def upload(request):
            destination = models.FileLikeObject.get_by_path(request.GET["path"])
            if not (request.GET["path"].startswith(request.user.username) or request.GET["path"].startswith("Public")):
                return json_response(False, error="The destination '%s' was not found" %request.GET["path"])
            for filename, file in request.FILES.items():
                name = filename
                i = 1
                while destination.filelikeobject_set.filter(name=name).exists():
                    name = "%s_%s%s" %(os.path.splitext(filename)[0], i + 1, os.path.splitext(filename)[1])
                    i += 1
                models.FileLikeObject(
                    name=name,
                    file=file,
                    type=file.content_type,
                    parent=destination
                ).save()
            return json_response(True)