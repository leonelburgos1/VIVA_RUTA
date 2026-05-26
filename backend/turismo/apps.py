import sys
import types

from django.apps import AppConfig


class TurismoConfig(AppConfig):
    name = 'turismo'

    def ready(self):
        auth_module = sys.modules.get('django.contrib.auth')

        if auth_module is None:
            auth_module = types.ModuleType('django.contrib.auth')
            sys.modules['django.contrib.auth'] = auth_module

        from .models import UserProfile

        auth_module.get_user_model = lambda: UserProfile

        models_module = sys.modules.get('django.contrib.auth.models')

        if models_module is None:
            models_module = types.ModuleType('django.contrib.auth.models')
            sys.modules['django.contrib.auth.models'] = models_module

        models_module.AbstractBaseUser = object
        models_module.Group = type('Group', (), {})
        models_module.Permission = type('Permission', (), {})
        models_module.User = UserProfile
        models_module.AnonymousUser = type(
            'AnonymousUser',
            (),
            {
                'is_authenticated': False,
                'is_staff': False,
                'is_superuser': False,
                'id': None,
                '__str__': lambda self: 'AnonymousUser',
            },
        )
        models_module.update_last_login = lambda *args, **kwargs: None
