from django.conf import settings
from django.db import models


class Lugar(models.Model):
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField()
    ubicacion = models.CharField(max_length=150)
    categoria = models.CharField(max_length=80)
    foto_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.nombre


class Resena(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    lugar = models.ForeignKey(
        Lugar,
        on_delete=models.CASCADE
    )
    comentario = models.TextField()
    calificacion = models.IntegerField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario} - {self.lugar}"