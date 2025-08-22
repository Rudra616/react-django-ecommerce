from django.urls import path
from .views import heloWorld
urlpatterns = [
    path('',heloWorld)
]
