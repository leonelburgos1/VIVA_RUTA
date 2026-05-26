from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework import authentication, exceptions

from .models import UserProfile


def generate_token_payload(user, token_type, lifetime_minutes):
    now = timezone.now()
    return {
        'user_id': user.pk,
        'email': user.email,
        'role': user.role,
        'type': token_type,
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(minutes=lifetime_minutes)).timestamp()),
    }


def generate_access_token(user):
    import jwt
    payload = generate_token_payload(user, 'access', 60)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def generate_refresh_token(user):
    import jwt
    payload = generate_token_payload(user, 'refresh', 60 * 24 * 7)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def decode_token(token, expected_type='access'):
    try:
        import jwt
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.InvalidTokenError as exc:
        raise exceptions.AuthenticationFailed('Token inválido o expirado.') from exc

    # SimpleJWT usa 'token_type', el custom usa 'type' — soportamos ambos
    token_type = payload.get('type') or payload.get('token_type')

    if token_type and token_type != expected_type:
        raise exceptions.AuthenticationFailed('Token inválido para esta operación.')

    return payload


class AnonymousUser:
    is_authenticated = False
    is_staff = False
    is_superuser = False
    id = None
    role = None
    username = ''
    email = ''

    def __str__(self):
        return 'AnonymousUser'


class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()

        if not header:
            return None

        if len(header) != 2:
            raise exceptions.AuthenticationFailed('Encabezado de autorización inválido.')

        prefix, token = header

        if prefix.lower() != b'bearer':
            return None

        payload = decode_token(token.decode('utf-8'), expected_type='access')

        try:
            user = UserProfile.objects.get(pk=payload.get('user_id'))
        except UserProfile.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed('Usuario no encontrado.') from exc

        if not getattr(user, 'is_active', True):
            raise exceptions.AuthenticationFailed('Usuario inactivo.')

        return user, token