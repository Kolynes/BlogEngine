from django.urls import path, include
from django.contrib.sitemaps.views import sitemap as sitemap_view
from . import admin, views, sitemap
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Root
    path("admin/", admin.index),
    path("admin/sign-in/", admin.sign_in),
    path("admin/sign-out/", admin.sign_out),
    path("admin/ping/", admin.ping),
    path("admin/authenticate/", admin.authenticate_user),

    # Home
    path("admin/home", admin.index),
    path("admin/home/admin", admin.index),
    path("admin/home/events", admin.index),
    path("admin/home/gallery", admin.index),
    path("admin/home/admins/", admin.admins),
    path("admin/home/create-admin/", admin.create_admin),
    path("admin/home/delete-admin/", admin.delete_admin),
    path("admin/home/save-event/", admin.save_event),
    path("admin/home/delete-event/", admin.delete_event),

    # Options
    path("admin/options", admin.index),
    path("admin/options/profile-settings/", admin.index),
    path("admin/options/password-settings", admin.index),
    path("admin/options/change-profile-picture/", admin.change_profile_picture),
    path("admin/options/remove-profile-picture/", admin.remove_profile_picture),
    path("admin/options/update-profile/", admin.update_profile),
    path("admin/options/change-password/", admin.change_password),

    # Files
    path("admin/files", admin.index),
    path("admin/files/new-directory/", admin.FileSystem.new_directory),
    path("admin/files/list-directory", admin.FileSystem.list_directory),
    path("admin/files/upload/", admin.FileSystem.upload),
    path("admin/files/delete/", admin.FileSystem.delete),
    path("admin/files/rename/", admin.FileSystem.rename),
    path("admin/files/copy/", admin.FileSystem.copy),
    path("admin/files/move/", admin.FileSystem.move),
    path("admin/files/search/", admin.FileSystem.search),
    
    path("articles/", views.articles),
    path("download/", views.download),
    path("preview/", views.preview),
    path("load-article/", views.load_article),
    path("admin/articles", admin.index),
    path("admin/save-article/", admin.save_article),
    path("admin/delete-article/", admin.delete_article),
    path("admin/tags/", admin.tags),
    path("admin/categories/", admin.categories),
    path("admin/delete-tag/", admin.delete_tag),
    path("admin/delete-category/", admin.delete_category),
    path("admin/edit-tag/", admin.edit_tag),
    path("admin/edit-category/", admin.edit_category),
    path("admin/create-tag/", admin.create_tag),
    path("admin/create-category/", admin.create_category),
    path("admin/mail/", admin.mail),
    path("admin/load-mail/", admin.load_mail),
    path("admin/load-particular-mail/", admin.load_particular_mail),
    path("admin/delete-mail/", admin.delete_mail),
    path("events/", views.events),
    path("gallery/", views.gallery),
    path("load-event/", views.load_event),
    path("load-gallery-image/", views.load_gallery_image),
    path("admin/save-gallery-image/", admin.save_gallery_image),
    path("admin/delete-gallery-image/", admin.delete_gallery_image),
    path("sitemap.xml", sitemap_view, {"sitemaps": {"blog": sitemap.BlogEngineAppSitemap}}),
] + [
    *static("profile-pictures/", document_root="%s/profile-pictures/" %settings.MEDIA_ROOT),
    *static("files/", document_root="%s/files/" %settings.MEDIA_ROOT)
]
