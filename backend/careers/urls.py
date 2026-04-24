from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, apply_to_job

router = DefaultRouter()
router.register(r'', JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:job_id>/apply/', apply_to_job, name='apply_to_job'),
]

