from django.test import TestCase
from . import models
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
import json


def sign_in(this, username="John", password="Doe", correct_credentials=True, create_user=True, superuser=False):
    if create_user:
        if superuser:
            user = models.Admin.objects.create_superuser(username=username, password=password, email="john@doe.com")
        else:
            user = models.Admin.objects.create_user(username=username, password=password)
    else: 
        user = models.Admin.objects.get(username=username)
    response = this.client.post("/admin/sign-in/", {"username": username, "password": password if correct_credentials else "NotDoe", "keepSignedIn": True})
    this.assertEqual(response.status_code, 200)
    return (user, response)


class IndexViewTestCase(TestCase):
    def test_signed_in_response(self):
        sign_in(self)
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(b"Account" in response.content)

    def test_signed_out_response(self):
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(b"Account" not in response.content)

class SignInViewTestCase(TestCase):
    def test_sign_in(self):
        user, response = sign_in(self)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)

    def test_failed_sign_in(self):
        user, response = sign_in(self, correct_credentials=False)
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], False)
    
    def test_non_admin_user(self):
        user = User.objects.create_user(username="John", password="Doe")
        response = self.client.post("/admin/sign-in/", {"username": "John", "password": "Doe", "keepSignedIn": True})
        self.assertEqual(response.status_code, 200)
        user = models.Admin.objects.get(username=user.username)

class SignOutTestCase(TestCase):
    def test_sign_out(self):
        user, response = sign_in(self)
        response= self.client.get("/admin/sign-out/")
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)

class PingTestCase(TestCase):
    def test_ping_response(self):
        user, response = sign_in(self)
        response = self.client.post("/admin/ping/")
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)

class UpdateProfileTestCase(TestCase):
    def test_success_response(self):
        user, response = sign_in(self)
        response = self.client.post("/admin/options/update-profile/", {"name": "John Doe", "email": "johndoe@gmial.com", "description": "this is a description"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)
        self.assertEqual(models.Admin.objects.get(username="John").description, "this is a description")  

class AuthenticateTestCase(TestCase):
    def test_success_response(self):
        user, response = sign_in(self)
        response = self.client.post("/admin/authenticate/", {"password": "Doe"})  
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)

    def test_signed_out_response(self):
        response = self.client.post("/admin/authenticate/", {"password": "Doe"})  
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], False)

class ChangePasswordTest(TestCase):
    def test_success_response(self):
        user, response = sign_in(self)
        response = self.client.post("/admin/options/change-password/", {"password": "Doe", "newPassword": "Dan"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)
        user, response = sign_in(self, password="Dan", create_user=False)
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(authenticate(username=user.username, password="Dan"), None)

class CreateAdminTestCase(TestCase):
    def test_success_response(self, superuser=False):
        user, response = sign_in(self, superuser=True)
        response = self.client.post("/admin/home/create-admin/", {"username": "Jane", "email": "jane@gmail.com", "name": "jane doe",  "password": "doe", "superuser": superuser})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)
        jane = models.Admin.objects.get(username="Jane")
        self.assertEqual(jane.is_superuser, superuser)
        self.assertTrue(models.FileLikeObject.objects.get(name="Jane", type="directory") is not None)

    def test_success_response_super_user(self):
        self.test_success_response(superuser=True)

class DeleteAdminTestCase(TestCase):
    def test_success_response(self, superuser=True):
        user, response = sign_in(self, superuser=superuser)
        response = self.client.post("/admin/home/delete-admin/", {"username": "John"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], superuser)
        self.assertNotEqual(models.Admin.objects.filter(username="John").exists(), superuser)

    def test_non_superuser_response(self):
        self.test_success_response(superuser=False)

class FileSystemTestCase(TestCase):
    def test_new_directory_success_response(self):
        user, response = sign_in(self)
        response = self.client.post("/admin/files/new-directory/", {"parent": "%s" %user.username, "name": "New Folder"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)
        self.assertNotEqual(models.FileLikeObject.get_by_path("%s/New Folder/" %user.username), None)

    def test_new_directory_no_parent_response(self):
        user, response = sign_in(self)
        response = self.client.post("/admin/files/new-directory/", {"parent": "invalid path", "name": "New Folder"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], False)
        self.assertEqual(models.FileLikeObject.get_by_path("%s/New Folder/" %user.username), None)

    def test_new_directory_access_another_admin_root_directory(self):
        user1, response = sign_in(self)
        user2, response = sign_in(self, username="Jane")
        response = self.client.post("/admin/files/new-directory/", {"parent": "%s" %user1.username, "name": "New Folder"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], False)
        self.assertEqual(models.FileLikeObject.get_by_path("%s/New Folder/" %user2.username), None)

    def test_list_directory_success_response(self):
        self.test_new_directory_success_response()
        response = self.client.get("/admin/files/list-directory", {"path": "John/New Folder"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)
        self.assertTrue(type(json_response["data"]["children"]) is list)

    def test_list_directory_no_parent_response(self):
        self.test_new_directory_no_parent_response()
        response = self.client.get("/admin/files/list-directory", {"path": "John/end"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], False)
        self.assertEqual(json_response["error"], "Directory not found!")

    def test_list_directory_access_another_admin_root_directory(self):
        self.test_new_directory_access_another_admin_root_directory()
        response = self.client.get("/admin/files/list-directory", {"path": "John"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], False)
        self.assertEqual(json_response["error"], "Directory not found")

    def test_rename_success_response(self):
        self.test_new_directory_success_response()
        pk = models.FileLikeObject.get_by_path("John/New Folder").pk
        response = self.client.post("/admin/files/rename/", {"item": pk, "name": "Jane"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)
        self.assertEqual(models.FileLikeObject.get_by_path("John/Jane").pk, pk)
        self.assertEqual(models.FileLikeObject.get_by_path("John/Jane").name, "Jane")

    def test_delete_successs_response(self):
        self.test_new_directory_success_response()
        pk = models.FileLikeObject.get_by_path("John/New Folder").pk
        response = self.client.post("/admin/files/delete/", {"items": [pk], "name": "Jane"})
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.content)
        self.assertEqual(json_response["status"], True)
        self.assertEqual(models.FileLikeObject.get_by_path("John/New Folder"), None)