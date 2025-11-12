from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from accounts.models import Role

User = get_user_model()


class UserModelTests(TestCase):
    def setUp(self):
        self.reader_role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.editor_role = Role.objects.create(name=Role.EDITOR, display_name='Редактор')
        self.admin_role = Role.objects.create(name=Role.ADMIN, display_name='Администратор')

    def test_user_role_properties(self):
        u1 = User.objects.create_user(username='u1', email='u1@example.com', password='pass', role=self.reader_role)
        u2 = User.objects.create_user(username='u2', email='u2@example.com', password='pass', role=self.editor_role)
        u3 = User.objects.create_user(username='u3', email='u3@example.com', password='pass', role=self.admin_role)
        self.assertTrue(u1.is_reader)
        self.assertFalse(u1.is_editor)
        self.assertFalse(u1.is_admin_role)
        self.assertTrue(u2.is_editor)
        self.assertTrue(u3.is_admin_role)

    def test_full_name_and_permissions_helpers(self):
        u = User.objects.create_user(username='u', email='u@example.com', password='pass', first_name='Ivan', last_name='Petrov', role=self.editor_role)
        self.assertIn('Ivan', u.full_name)
        self.assertTrue(u.can_manage_articles())
        self.assertFalse(u.can_manage_users())
        u_super = User.objects.create_superuser(username='su', email='su@example.com', password='pass')
        self.assertTrue(u_super.can_manage_users())

    def test_has_role_permission(self):
        perm = Permission.objects.first()
        role = Role.objects.create(name=Role.EDITOR, display_name='Редактор 2')
        if perm:
            role.permissions.add(perm)
        user = User.objects.create_user(username='puser', email='puser@example.com', password='pass', role=role)
        if perm:
            self.assertTrue(user.has_role_permission(perm.codename))
        else:
            self.assertFalse(user.has_role_permission('nonexistent'))
