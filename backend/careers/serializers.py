from rest_framework import serializers
from .models import Job, Application


class JobSerializer(serializers.ModelSerializer):
    """Serializer for Job model"""
    
    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'department',
            'location',
            'job_type',
            'description',
            'responsibilities',
            'requirements',
            'deadline',
            'created_at'
        ]
        read_only_fields = ['created_at']


class JobListSerializer(serializers.ModelSerializer):
    """Simplified serializer for job listings"""
    
    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'department',
            'location',
            'job_type',
            'deadline',
            'created_at'
        ]
        read_only_fields = ['created_at']


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for Application model"""
    job_title = serializers.CharField(source='job.title', read_only=True)
    cv_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_title',
            'full_name',
            'email',
            'phone',
            'location',
            'cv',
            'cv_url',
            'cover_letter',
            'expected_salary',
            'availability',
            'applied_at'
        ]
        read_only_fields = ['applied_at']
    
    def get_cv_url(self, obj):
        """Return the full URL for the CV file"""
        if obj.cv:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.cv.url)
                return obj.cv.url
            except:
                return str(obj.cv)
        return None


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating applications (handles file upload)"""
    
    class Meta:
        model = Application
        fields = [
            'job',
            'full_name',
            'email',
            'phone',
            'location',
            'cv',
            'cover_letter',
            'expected_salary',
            'availability'
        ]

