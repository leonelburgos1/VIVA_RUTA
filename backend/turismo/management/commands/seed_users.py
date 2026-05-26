from django.core.management.base import BaseCommand

from turismo.models import UserProfile


class Command(BaseCommand):
    help = 'Crea dos usuarios de ejemplo con rol usuario.'

    def handle(self, *args, **options):
        seed_users = [
            {
                'username': 'Ana Gómez',
                'email': 'ana@example.com',
                'password': 'usuario123',
                'phone': '3001234567',
                'birth_date': '1995-02-10',
                'department': 'Antioquia',
                'city': 'Medellín',
            },
            {
                'username': 'Carlos Pérez',
                'email': 'carlos@example.com',
                'password': 'usuario123',
                'phone': '3107654321',
                'birth_date': '1992-07-22',
                'department': 'Cundinamarca',
                'city': 'Bogotá',
            },
        ]

        created_count = 0

        for user_data in seed_users:
            user, created = UserProfile.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['username'],
                    'role': 'usuario',
                    'phone': user_data['phone'],
                    'birth_date': user_data['birth_date'],
                    'department': user_data['department'],
                    'city': user_data['city'],
                },
            )

            if created:
                user.set_password(user_data['password'])
                user.save(update_fields=['password'])
                created_count += 1
            else:
                user.username = user_data['username']
                user.role = 'usuario'
                user.phone = user_data['phone']
                user.birth_date = user_data['birth_date']
                user.department = user_data['department']
                user.city = user_data['city']
                user.set_password(user_data['password'])
                user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Se sembraron {created_count} usuarios nuevos y se actualizaron los existentes.'
            )
        )
