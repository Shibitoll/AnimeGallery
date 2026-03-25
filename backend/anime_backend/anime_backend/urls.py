from django.contrib import admin
from django.urls import path, include
from user_api.views import RegisterView # Імпортуємо наше представлення

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('anime_api.urls')),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
]