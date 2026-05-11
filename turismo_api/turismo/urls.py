from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, LugarViewSet, ResenaViewSet



#Generador automático de rutas CRUD 
router = DefaultRouter()
# Registrar los viewsets en el router para generar automáticamente las rutas CRUD
router.register(r'usuarios', UserViewSet)
router.register(r'lugares', LugarViewSet)
router.register(r'resenas', ResenaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]