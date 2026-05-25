from django.urls import include, path

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    PlaceViewSet,
    ReviewViewSet,
    TourViewSet,
    UserViewSet,
)

router = DefaultRouter()

router.register(
    r'users',
    UserViewSet,
    basename='users'
)
router.register(
    r'places',
    PlaceViewSet
)
router.register(
    r'reviews',
    ReviewViewSet
)
router.register(
    r'tours',
    TourViewSet
)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
