""" Pytest configuration for the backend test suite """

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
# Django test client requests use the 'testserver' host
os.environ.setdefault('DJANGO_ALLOWED_HOSTS', 'testserver')

import django

django.setup()

from django.conf import settings

if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')