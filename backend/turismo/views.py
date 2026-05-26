from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Place, Review, Tour, UserProfile, Booking
from .serializers import (
    CustomTokenObtainPairSerializer,
    PlaceSerializer,
    ReviewSerializer,
    TourSerializer,
    UserSerializer,
    BookingSerializer,
)
from .permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly, IsSelfOrAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all().order_by('-id')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsSelfOrAdmin()]

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
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.select_related('place').all().order_by('-created_at')
    serializer_class = TourSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class BookingViewSet(viewsets.ModelViewSet):

    serializer_class = BookingSerializer

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if getattr(user, 'role', None) == 'admin':
            return Booking.objects.all().order_by('-created_at')

        return Booking.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()

        if booking.user != request.user and getattr(request.user, 'role', None) != 'admin':
            return Response(
                {'detail': 'No tienes permiso para cancelar esta reserva.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status in ('completed', 'cancelled'):
            return Response(
                {'detail': f'No se puede cancelar una reserva con estado "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = 'cancelled'
        booking.save(update_fields=['status', 'updated_at'])
        serializer = self.get_serializer(booking)
        return Response(serializer.data)