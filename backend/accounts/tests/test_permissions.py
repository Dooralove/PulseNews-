from django.test import TestCase
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model
from accounts.models import Role
from accounts.permissions import IsReader, IsEditor, IsAdmin, CanModerateContent, CanManageArticles, CanManageComments
from news.models import Article, Category

User = get_user_model()


class PermissionsTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.reader_role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.editor_role = Role.objects.create(name=Role.EDITOR, display_name='Редактор')
        self.admin_role = Role.objects.create(name=Role.ADMIN, display_name='Администратор')
        self.reader = User.objects.create_user(username='reader', email='r@example.com', password='pass', role=self.reader_role)
        self.editor = User.objects.create_user(username='editor', email='e@example.com', password='pass', role=self.editor_role)
        self.admin = User.objects.create_user(username='admin', email='a@example.com', password='pass', role=self.admin_role)
        self.staff = User.objects.create_user(username='staff', email='s@example.com', password='pass', role=self.editor_role, is_staff=True)
        self.category = Category.objects.create(name='Tech')
        self.article = Article.objects.create(title='T', content='C', category=self.category, author=self.editor)

    def test_role_permissions(self):
        req = self.factory.get('/')
        req.user = self.reader
        self.assertTrue(IsReader().has_permission(req, None))
        self.assertFalse(IsEditor().has_permission(req, None))
        self.assertFalse(IsAdmin().has_permission(req, None))

        req.user = self.editor
        self.assertTrue(IsEditor().has_permission(req, None))
        req.user = self.admin
        self.assertTrue(IsAdmin().has_permission(req, None))

    def test_can_moderate_content(self):
        req = self.factory.get('/')
        req.user = self.admin
        self.assertTrue(CanModerateContent().has_permission(req, None))

    def test_can_manage_articles(self):
        get_req = self.factory.get('/')
        post_req = self.factory.post('/')
        get_req.user = self.reader
        post_req.user = self.reader
        self.assertTrue(CanManageArticles().has_permission(get_req, None))
        self.assertFalse(CanManageArticles().has_permission(post_req, None))
        post_req.user = self.editor
        self.assertTrue(CanManageArticles().has_permission(post_req, None))
        # object permission
        post_req.user = self.staff
        self.assertTrue(CanManageArticles().has_object_permission(post_req, None, self.article))

    def test_can_manage_comments_object(self):
        get_req = self.factory.get('/')
        post_req = self.factory.post('/')
        get_req.user = self.reader
        post_req.user = self.reader
        self.assertTrue(CanManageComments().has_permission(get_req, None))
        self.assertTrue(CanManageComments().has_permission(post_req, None))
