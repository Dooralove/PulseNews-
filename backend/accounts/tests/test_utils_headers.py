from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from accounts.models import Role, UserActivity
from accounts.utils import log_user_activity

User = get_user_model()


class UtilsHeadersTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.role = Role.objects.create(name=Role.READER, display_name='Читатель')
        self.user = User.objects.create_user(username='u', email='u@example.com', password='pass', role=self.role)

    def test_log_user_activity_with_headers(self):
        request = self.factory.get('/', HTTP_X_FORWARDED_FOR='10.0.0.1, 10.0.0.2', HTTP_USER_AGENT='UA-TEST')
        log_user_activity(self.user, 'login', request, details={'x': 1})
        self.assertEqual(UserActivity.objects.count(), 1)
        act = UserActivity.objects.first()
        self.assertEqual(act.ip_address, '10.0.0.1')
        self.assertEqual(act.user_agent, 'UA-TEST')
        self.assertEqual(act.details.get('x'), 1)
