from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, ViewingRequestViewSet
from .chatbot_views import chatbot_message

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'viewing-requests', ViewingRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chatbot/', chatbot_message, name='chatbot-message'),
]
