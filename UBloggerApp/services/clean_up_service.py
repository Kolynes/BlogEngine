class CleanUpService(Thread):
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