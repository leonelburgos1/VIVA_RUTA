from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Place(models.Model):

    CATEGORY_CHOICES = [
        ('Nature', 'Naturaleza'),
        ('Religious', 'Religioso'),
        ('Adventure', 'Aventura'),
        ('Culture', 'Cultura'),
        ('Gastronomy', 'Gastronomía'),
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

    # ✅ CORREGIDO: save() ahora está dentro de la clase (4 espacios de indentación)
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

    image = models.ImageField(
        upload_to='tours/',
        null=True,
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
