from django.contrib.auth.models import User

from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Place, Review, Tour

from .serializers import (
    UserSerializer,
    PlaceSerializer,
    ReviewSerializer,
    TourSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all().order_by('-created_at')
    serializer_class = PlaceSerializer
    permission_classes = [permissions.AllowAny]
    # IMPORTANTE: lookup_field = 'slug' significa que las URLs son /api/places/<slug>/
    # Para delete desde el frontend usaremos el slug, NO el id
    lookup_field = 'slug'


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.select_related('place').all().order_by('-created_at')
    serializer_class = TourSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
