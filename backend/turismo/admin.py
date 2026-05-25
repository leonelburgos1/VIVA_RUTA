from django.contrib import admin
from .models import Place, Review, Tour, UserProfile


admin.site.register(Place)
admin.site.register(Review)
admin.site.register(Tour)
admin.site.register(UserProfile)
