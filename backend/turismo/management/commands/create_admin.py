from django.core.management.base import BaseCommand
from turismo.models import UserProfile


class Command(BaseCommand):
    help = 'Crea el usuario administrador por defecto si no existe.'

    def handle(self, *args, **options):
        email = 'admin1@gmail.com'
        password = 'admin1'
        username = 'Administrador'

        user, created = UserProfile.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'role': 'admin',
                'phone': '3183296282',
                'department': 'Nariño',
                'city': 'Pasto',
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Admin creado: {email} / {password}'
                )
            )
        else:
            user.role = 'admin'
            user.username = username
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.WARNING(
                    f'⚠️  Admin ya existía. Contraseña y rol actualizados: {email}'
                )
            )