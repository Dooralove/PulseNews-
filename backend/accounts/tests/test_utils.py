from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Role, UserActivity
from accounts.utils import log_user_activity, update_last_login_ip

User = get_user_model()


class UtilsTests(TestCase):
    def setUp(self):
        self.reader_role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.user = User.objects.create_user(username='u', email='u@example.com', password='pass', role=self.reader_role)

    def test_log_user_activity(self):
        log_user_activity(self.user, 'login', request=None, details={'k': 'v'})
        self.assertEqual(UserActivity.objects.count(), 1)
        act = UserActivity.objects.first()
        self.assertEqual(act.action, 'login')
        self.assertEqual(act.details.get('k'), 'v')

    def test_update_last_login_ip(self):
        class DummyReq:
            META = {'REMOTE_ADDR': '1.2.3.4'}
        update_last_login_ip(self.user, DummyReq())
        self.user.refresh_from_db()
        self.assertEqual(self.user.last_login_ip, '1.2.3.4')
