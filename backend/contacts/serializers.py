from rest_framework import serializers
from .models import Contact, ViewingRequest
from properties.models import Property
import uuid


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'property', 'created_at']
        read_only_fields = ['created_at']


class ViewingRequestSerializer(serializers.ModelSerializer):
    contact = ContactSerializer(read_only=True)
    property_title = serializers.CharField(source='property.title', read_only=True, allow_null=True)
    property_location = serializers.SerializerMethodField()
    
    class Meta:
        model = ViewingRequest
        fields = [
            'id', 'contact', 'property', 'property_title', 'property_location',
            'preferred_date', 'preferred_time', 'message',
            'status', 'reference_number', 'created_at'
        ]
        read_only_fields = ['reference_number', 'created_at']
    
    def get_property_location(self, obj):
        """Get property location from property model - matches PropertySerializer format"""
        try:
            if obj.property:
                # Build location from available fields
                location_parts = []
                
                # Add address if available
                if obj.property.address:
                    location_parts.append(str(obj.property.address))
                
                # Add city if available
                if obj.property.city:
                    location_parts.append(str(obj.property.city))
                
                # Add state if available
                if obj.property.state:
                    location_parts.append(str(obj.property.state))
                
                # If we have location parts, join them
                if location_parts:
                    location_str = ", ".join(location_parts)
                    # If we have city, append country for consistency
                    if obj.property.city:
                        country = getattr(obj.property, 'country', None) or 'Kenya'
                        # Only add country if it's not already in the string
                        if country not in location_str:
                            return f"{location_str}, {country}"
                    return location_str
                
                # Fallback: if only city exists, use city, country format
                if obj.property.city:
                    country = getattr(obj.property, 'country', None) or 'Kenya'
                    return f"{obj.property.city}, {country}"
        except Exception as e:
            # Log error but don't break the serializer
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting property location for viewing request {obj.id}: {e}")
        return None
    
    def create(self, validated_data):
        # Generate reference number
        validated_data['reference_number'] = f"VW-{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class ViewingRequestCreateSerializer(serializers.ModelSerializer):
    # Include contact fields for creation
    name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    property = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = ViewingRequest
        fields = [
            'property', 'preferred_date', 'preferred_time',
            'message', 'name', 'email', 'phone'
        ]
        extra_kwargs = {
            'preferred_date': {'required': False, 'allow_null': True},
            'preferred_time': {'required': False, 'allow_null': True},
        }
    
    def create(self, validated_data):
        name = validated_data.pop('name')
        email = validated_data.pop('email')
        phone = validated_data.pop('phone', '')
        property_id = validated_data.pop('property', None)
        
        # Create or get contact - update name and phone if contact exists
        contact, created = Contact.objects.get_or_create(
            email=email,
            defaults={'name': name, 'phone': phone, 'subject': 'viewing'}
        )
        
        # Update contact info if it already existed
        if not created:
            if name and contact.name != name:
                contact.name = name
            if phone and contact.phone != phone:
                contact.phone = phone
            if contact.subject != 'viewing':
                contact.subject = 'viewing'
            contact.save()
        
        # Generate reference number
        validated_data['contact'] = contact
        validated_data['reference_number'] = f"VW-{uuid.uuid4().hex[:8].upper()}"
        
        # Set property if provided
        if property_id is not None:
            try:
                validated_data['property'] = Property.objects.get(id=property_id)
            except Property.DoesNotExist:
                # If property doesn't exist, set to None
                validated_data['property'] = None
        
        # Create the viewing request
        return ViewingRequest.objects.create(**validated_data)


class ChatbotMessageSerializer(serializers.Serializer):
    """Serializer for chatbot message request"""
    message = serializers.CharField(required=True)
    context = serializers.CharField(required=False, allow_blank=True, default='initial')
    preferences = serializers.DictField(required=False, allow_null=True, default=dict)
    conversation_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_null=True,
        default=list
    )


class ChatbotResponseSerializer(serializers.Serializer):
    """Serializer for chatbot response"""
    text = serializers.CharField()
    context = serializers.CharField(required=False, allow_blank=True)
    quick_replies = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_null=True
    )
    property_cards = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_null=True
    )
    show_budget_selector = serializers.BooleanField(required=False, default=False)
    show_location_chips = serializers.BooleanField(required=False, default=False)
    show_time_slots = serializers.BooleanField(required=False, default=False)
    show_bedroom_selector = serializers.BooleanField(required=False, default=False)
    show_property_selection = serializers.BooleanField(required=False, default=False)
    preferences = serializers.DictField(required=False, allow_null=True)