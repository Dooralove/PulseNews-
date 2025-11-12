from django.test import TestCase
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model
from accounts.models import Role
from accounts.permissions import IsOwnerOrReadOnly, IsOwnerOrAdmin
from news.models import Article, Category

User = get_user_model()


class MorePermissionsTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.reader_role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.admin_role = Role.objects.create(name=Role.ADMIN, display_name='Администратор')
        self.user = User.objects.create_user(username='u', email='u@example.com', password='pass', role=self.reader_role)
        self.other = User.objects.create_user(username='o', email='o@example.com', password='pass', role=self.reader_role)
        self.admin = User.objects.create_user(username='a', email='a@example.com', password='pass', role=self.admin_role)
        self.category = Category.objects.create(name='Tech')
        self.article = Article.objects.create(title='T', content='C', category=self.category, author=self.user)

    def test_is_owner_or_read_only(self):
        get_req = self.factory.get('/')
        get_req.user = self.other
        self.assertTrue(IsOwnerOrReadOnly().has_object_permission(get_req, None, self.article))
        put_req = self.factory.put('/')
        put_req.user = self.other
        self.assertFalse(IsOwnerOrReadOnly().has_object_permission(put_req, None, self.article))
        put_req.user = self.user
        self.assertTrue(IsOwnerOrReadOnly().has_object_permission(put_req, None, self.article))

    def test_is_owner_or_admin(self):
        put_req = self.factory.put('/')
        put_req.user = self.other
        self.assertFalse(IsOwnerOrAdmin().has_object_permission(put_req, None, self.article))
        put_req.user = self.admin
        self.assertTrue(IsOwnerOrAdmin().has_object_permission(put_req, None, self.article))
