from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils.text import slugify


class UserProfileManager(BaseUserManager):

    use_in_migrations = True

    def create_user(self, username, email, password=None, **extra_fields):

        if not username:
            raise ValueError('El nombre de usuario es obligatorio.')

        if not email:
            raise ValueError('El email es obligatorio.')

        email = self.normalize_email(email)

        user = self.model(
            username=username,
            email=email,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, username, email, password=None, **extra_fields):

        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('role') != 'admin':
            raise ValueError('El superusuario debe tener rol admin.')

        return self.create_user(username, email, password, **extra_fields)


class UserProfile(AbstractBaseUser):

    ROLE_CHOICES = (
        ('admin', 'admin'),
        ('usuario', 'usuario'),
    )

    username = models.CharField(max_length=150, unique=True)

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='usuario'
    )

    phone = models.CharField(max_length=20, blank=True, default='')

    birth_date = models.DateField(null=True, blank=True)

    department = models.CharField(max_length=100, blank=True, default='')

    city = models.CharField(max_length=100, blank=True, default='')

    last_login = None

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username

    def __str__(self):
        return f'{self.email} ({self.role})'


class Place(models.Model):

    CATEGORY_CHOICES = [
        ('Nature', 'Naturaleza'),
        ('Religious', 'Religioso'),
        ('Adventure', 'Aventura'),
        ('Culture', 'Cultura'),
        ('Beach', 'Playa'),
    ]

    title = models.CharField(max_length=150)

    slug = models.SlugField(
        unique=True,
        blank=True
    )

    short_description = models.TextField()

    full_description = models.TextField()

    location = models.CharField(max_length=150)

    address = models.CharField(max_length=250)

    category = models.CharField(
        max_length=80,
        choices=CATEGORY_CHOICES
    )

    image = models.ImageField(
        upload_to='places/',
        null=True,
        blank=True
    )

    rating = models.FloatField(default=4.5)

    features = models.JSONField(
        default=list,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        if not self.slug:

            base_slug = slugify(self.title)

            slug = base_slug

            counter = 1

            while Place.objects.filter(slug=slug).exists():

                slug = f'{base_slug}-{counter}'

                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Review(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    place = models.ForeignKey(
        Place,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    comment = models.TextField()

    rating = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.place}"


class Tour(models.Model):

    title = models.CharField(max_length=180)

    slug = models.SlugField(
        unique=True,
        blank=True
    )

    place = models.ForeignKey(
        Place,
        on_delete=models.CASCADE,
        related_name='tours'
    )

    description = models.TextField()

    price = models.PositiveIntegerField()

    duration = models.CharField(max_length=80)

    max_spots = models.PositiveIntegerField()

    schedule = models.CharField(max_length=180)

    includes = models.JSONField(
        default=list,
        blank=True
    )

    image_url = models.URLField(
        blank=True
    )

    rating = models.FloatField(default=4.8)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        if not self.slug:

            base_slug = slugify(self.title)

            slug = base_slug

            counter = 1

            while Tour.objects.filter(slug=slug).exists():

                slug = f'{base_slug}-{counter}'

                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
