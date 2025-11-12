#!/usr/bin/env python
import os
import sys


def main():
    settings_module = os.environ.get('DJANGO_SETTINGS_MODULE')
    if 'test' in sys.argv and not settings_module:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.test')
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pulse_news.settings.local')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

