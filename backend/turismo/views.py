from rest_framework import permissions, viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Place, Review, Tour, UserProfile
from .serializers import (
    CustomTokenObtainPairSerializer,
    PlaceSerializer,
    ReviewSerializer,
    TourSerializer,
    UserSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all().order_by('-id')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]

        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return UserProfile.objects.none()

        if getattr(user, 'role', None) == 'admin':
            return UserProfile.objects.all().order_by('-id')

        return UserProfile.objects.filter(pk=user.pk).order_by('-id')


class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all().order_by('-created_at')
    serializer_class = PlaceSerializer
    permission_classes = [permissions.AllowAny]
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
