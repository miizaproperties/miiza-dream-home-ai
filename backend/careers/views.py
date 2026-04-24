from rest_framework import viewsets, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Q
from .models import Job, Application
from .serializers import (
    JobSerializer,
    JobListSerializer,
    ApplicationSerializer,
    ApplicationCreateSerializer
)


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Job model - read-only for public API"""
    queryset = Job.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer
    
    def get_queryset(self):
        """Filter jobs by department and job_type if provided"""
        queryset = Job.objects.all()
        
        # Filter by department
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department__icontains=department)
        
        # Filter by job_type
        job_type = self.request.query_params.get('job_type', None)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        
        # Filter out expired jobs (if deadline passed)
        queryset = queryset.filter(
            Q(deadline__isnull=True) | Q(deadline__gte=timezone.now().date())
        )
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def apply_to_job(request, job_id):
    """
    Submit a job application for a specific job.
    Handles multipart form-data for file uploads.
    """
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if job deadline has passed
    if job.deadline and job.deadline < timezone.now().date():
        return Response(
            {'error': 'Application deadline has passed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create serializer with request data and files
    serializer = ApplicationCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        # Set the job from URL parameter
        application = serializer.save(job=job)
        
        # Return success response with application details
        application_serializer = ApplicationSerializer(
            application,
            context={'request': request}
        )
        
        return Response(
            {
                'success': True,
                'message': 'Application submitted successfully',
                'application': application_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        {
            'error': 'Validation failed',
            'details': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )
