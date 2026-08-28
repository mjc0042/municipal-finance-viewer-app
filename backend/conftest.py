""" Pytest configuration for the backend test suite """

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django

django.setup()