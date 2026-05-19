from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    PlaceViewSet,
    ReviewViewSet
)
router = DefaultRouter()

router.register(
    r'users',UserViewSet
)
router.register(
    r'places',PlaceViewSet
)
router.register(
    r'reviews',ReviewViewSet
)
urlpatterns = router.urls