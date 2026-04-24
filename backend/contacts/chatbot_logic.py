"""
Chatbot logic moved from frontend to backend
"""
import os
import re
from typing import Dict, List, Optional, Any
from django.db.models import Q
from properties.models import Property
from properties.serializers import PropertyListSerializer

# Constants
COMPANY_PHONE = '+254717334422'
COMPANY_PHONE_DISPLAY = '+254-717-334-422'
COMPANY_EMAIL = 'info@miizarealtors.com'
COMPANY_LOCATION = 'Kilimani, Nairobi, Kenya'

LOCATIONS = ['Westlands', 'Karen', 'Kilimani', 'Lavington', 'Runda', 'Kileleshwa', 'Upperhill', 'Parklands']
BUDGET_RANGES = ['Under KSh 10M', 'KSh 10-25M', 'KSh 25-50M', 'KSh 50M+']
TIME_SLOTS = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']
BEDROOM_OPTIONS = ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms']

PROPERTY_TYPE_MAP = {
    'apartment': 'apartment',
    'house': 'house',
    'villa': 'villa',
    'commercial': 'commercial',
    'office': 'office',
    'land': 'land',
    'airbnb': 'airbnb'
}


def convert_time_to_24_hour(time_str: str) -> str:
    """Convert time from '9:00 AM' format to '09:00:00' format"""
    time_map = {
        '9:00 am': '09:00:00',
        '11:00 am': '11:00:00',
        '2:00 pm': '14:00:00',
        '4:00 pm': '16:00:00',
    }
    normalized = time_str.lower().strip()
    return time_map.get(normalized, '09:00:00')


def get_filtered_properties(preferences: Dict[str, Any]) -> List[Dict]:
    """Fetch and filter properties based on user preferences"""
    queryset = Property.objects.filter(status='available')
    
    # Property type filter
    if preferences.get('propertyType'):
        property_type = preferences['propertyType'].lower()
        mapped_type = PROPERTY_TYPE_MAP.get(property_type, property_type)
        queryset = queryset.filter(property_type=mapped_type)
    
    # Buy/Rent filter
    if preferences.get('purpose') == 'buy':
        queryset = queryset.filter(is_for_sale=True)
    elif preferences.get('purpose') == 'rent':
        queryset = queryset.filter(is_for_rent=True)
    
    # Bedrooms filter
    if preferences.get('bedrooms') is not None and preferences.get('bedrooms', 0) > 0:
        queryset = queryset.filter(bedrooms=preferences['bedrooms'])
    
    # Location filter - search in city, address, state, and country fields
    if preferences.get('location'):
        location = preferences['location']
        queryset = queryset.filter(
            Q(city__icontains=location) |
            Q(address__icontains=location) |
            Q(state__icontains=location) |
            Q(country__icontains=location)
        )
    
    # Budget range filter
    budget_range = preferences.get('budgetRange', '')
    if budget_range:
        budget_str = budget_range.lower()
        if 'under' in budget_str or '10m' in budget_str:
            queryset = queryset.filter(price__lte=10000000)
        elif '10-25' in budget_str or '10m-25m' in budget_str:
            queryset = queryset.filter(price__gte=10000000, price__lte=25000000)
        elif '25-50' in budget_str or '25m-50m' in budget_str:
            queryset = queryset.filter(price__gte=25000000, price__lte=50000000)
        elif '50m+' in budget_str or '50m' in budget_str:
            queryset = queryset.filter(price__gte=50000000)
    
    # Limit and order
    queryset = queryset.order_by('-created_at')[:6]
    
    # Serialize properties
    serializer = PropertyListSerializer(queryset, many=True)
    return serializer.data


def process_message(
    user_message: str,
    context: str,
    preferences: Dict[str, Any],
    conversation_history: Optional[List[Dict]] = None
) -> Dict[str, Any]:
    """
    Process user message and return bot response
    Returns dict with: text, context, quick_replies, property_cards, etc.
    """
    if conversation_history is None:
        conversation_history = []
    
    lower = user_message.lower()
    new_context = context
    new_preferences = preferences.copy()
    response = {
        'text': '',
        'context': new_context,
        'quick_replies': None,
        'property_cards': None,
        'show_budget_selector': False,
        'show_location_chips': False,
        'show_time_slots': False,
        'show_bedroom_selector': False,
        'show_property_selection': False,
        'preferences': new_preferences
    }
    
    # Property Search Flow
    if any(word in lower for word in ['find', 'property', '🏠', 'search']):
        if not preferences.get('purpose'):
            response['context'] = 'buying_or_renting'
            response['text'] = "Great! Let's find you the perfect property. Are you looking to buy or rent?"
            response['quick_replies'] = ['💰 Buy', '🏠 Rent']
            return response
        elif not preferences.get('propertyType'):
            response['context'] = 'property_type'
            response['text'] = "What type of property are you interested in?"
            response['quick_replies'] = ['🏢 Apartment', '🏡 House', '🏰 Villa', '🏢 Commercial', '🏪 Office']
            return response
        elif not preferences.get('bedrooms') and preferences.get('propertyType', '').lower() not in ['commercial', 'office']:
            response['context'] = 'bedrooms'
            response['text'] = "How many bedrooms do you need?"
            response['show_bedroom_selector'] = True
            return response
        elif not preferences.get('location'):
            response['context'] = 'location'
            response['text'] = "Which area would you prefer?"
            response['show_location_chips'] = True
            return response
        elif not preferences.get('budgetRange'):
            response['context'] = 'budget'
            response['text'] = "What's your budget range?"
            response['show_budget_selector'] = True
            return response
        else:
            # Fetch properties
            results = get_filtered_properties(preferences)
            response['context'] = 'showing_properties'
            
            if results:
                response['text'] = f"Perfect! I found {len(results)} properties matching your criteria:"
                response['property_cards'] = results
                # Note: The follow-up message should be handled by frontend after showing properties
            else:
                response['text'] = "I couldn't find properties matching your exact criteria. Would you like to:\n\n• Broaden your search\n• Try different filters\n• Talk to an agent for personalized help?"
                response['quick_replies'] = ['Refine search', 'Show all properties', 'Talk to agent', 'Start over']
            return response
    
    # Handle Buy/Rent selection
    if (any(word in lower for word in ['buy', '💰']) and context == 'buying_or_renting'):
        new_preferences['purpose'] = 'buy'
        response['context'] = 'property_type'
        response['text'] = "Excellent choice! What type of property would you like to buy?"
        response['quick_replies'] = ['🏢 Apartment', '🏡 House', '🏰 Villa', '🏢 Commercial', '🏪 Office']
        response['preferences'] = new_preferences
        return response
    
    if (any(word in lower for word in ['rent', '🏠']) and context == 'buying_or_renting'):
        new_preferences['purpose'] = 'rent'
        response['context'] = 'property_type'
        response['text'] = "Great! What type of property would you like to rent?"
        response['quick_replies'] = ['🏢 Apartment', '🏡 House', '🏰 Villa']
        response['preferences'] = new_preferences
        return response
    
    # Handle Property Type
    if context == 'property_type':
        type_val = re.sub(r'[🏢🏡🏰🏪]', '', user_message).strip()
        new_preferences['propertyType'] = type_val
        
        if type_val.lower() in ['commercial', 'office']:
            response['context'] = 'location'
            response['text'] = "Perfect! Which location interests you?"
            response['show_location_chips'] = True
        else:
            response['context'] = 'bedrooms'
            response['text'] = "How many bedrooms do you need?"
            response['show_bedroom_selector'] = True
        response['preferences'] = new_preferences
        return response
    
    # Handle Bedrooms
    if context == 'bedrooms':
        bedroom_count = 0
        if 'studio' in lower:
            bedroom_count = 0
        elif '1' in lower or 'one' in lower:
            bedroom_count = 1
        elif '2' in lower or 'two' in lower:
            bedroom_count = 2
        elif '3' in lower or 'three' in lower:
            bedroom_count = 3
        elif '4' in lower or 'four' in lower or '4+' in lower:
            bedroom_count = 4
        
        new_preferences['bedrooms'] = bedroom_count
        response['context'] = 'location'
        response['text'] = "Great choice! Which location would you prefer?"
        response['show_location_chips'] = True
        response['preferences'] = new_preferences
        return response
    
    # Handle Location
    if context == 'location':
        location_val = re.sub(r'[📍]', '', user_message).strip()
        new_preferences['location'] = location_val
        response['context'] = 'budget'
        response['text'] = "Perfect! What's your budget range?"
        response['show_budget_selector'] = True
        response['preferences'] = new_preferences
        return response
    
    # Handle Budget
    if context == 'budget':
        budget_val = re.sub(r'[💰]', '', user_message).strip()
        new_preferences['budgetRange'] = budget_val
        results = get_filtered_properties(new_preferences)
        response['context'] = 'showing_properties'
        response['preferences'] = new_preferences
        
        if results:
            response['text'] = f"Excellent! I found {len(results)} properties matching your criteria in {new_preferences.get('location', 'your area')}:"
            response['property_cards'] = results
        else:
            response['text'] = "I couldn't find properties matching your exact criteria. Would you like to adjust your filters?"
            response['quick_replies'] = ['Refine search', 'Show all properties', '👤 Talk to agent']
        return response
    
    # Schedule Viewing Flow
    if any(word in lower for word in ['viewing', 'schedule', '📅', 'book']):
        if not preferences.get('name'):
            response['context'] = 'get_name'
            response['text'] = "I'd be happy to schedule a viewing! First, may I have your name?"
            return response
        elif not preferences.get('email'):
            response['context'] = 'get_email'
            response['text'] = f"Great {preferences.get('name')}! What's your email address?"
            return response
        elif not preferences.get('phone'):
            response['context'] = 'get_phone'
            response['text'] = "Perfect! And your phone number?"
            return response
        elif not preferences.get('selectedPropertyId'):
            # Show properties for selection
            response['context'] = 'select_property'
            response['text'] = "Great! Please select the property you'd like to view:"
            
            # Fetch properties based on preferences
            api_params = {}
            if preferences.get('purpose') == 'buy':
                api_params['is_for_sale'] = True
            elif preferences.get('purpose') == 'rent':
                api_params['is_for_rent'] = True
            
            if preferences.get('propertyType'):
                mapped_type = PROPERTY_TYPE_MAP.get(preferences['propertyType'].lower(), preferences['propertyType'].lower())
                api_params['property_type'] = mapped_type
            
            if preferences.get('location'):
                queryset = Property.objects.filter(status='available')
                if api_params.get('is_for_sale'):
                    queryset = queryset.filter(is_for_sale=True)
                if api_params.get('is_for_rent'):
                    queryset = queryset.filter(is_for_rent=True)
                if api_params.get('property_type'):
                    queryset = queryset.filter(property_type=api_params['property_type'])
                location_search = preferences['location']
                queryset = queryset.filter(
                    Q(city__icontains=location_search) |
                    Q(address__icontains=location_search) |
                    Q(state__icontains=location_search) |
                    Q(country__icontains=location_search)
                ).order_by('-created_at')[:10]
            else:
                queryset = Property.objects.filter(status='available').order_by('-created_at')[:10]
            
            serializer = PropertyListSerializer(queryset, many=True)
            response['property_cards'] = serializer.data
            response['show_property_selection'] = True
            return response
        else:
            response['context'] = 'select_time'
            response['text'] = "Excellent! When would you like to visit?"
            response['show_time_slots'] = True
            return response
    
    # Handle Name Collection
    if context == 'get_name':
        new_preferences['name'] = user_message
        response['context'] = 'get_email'
        response['text'] = f"Nice to meet you, {user_message}! 😊 What's your email address?"
        response['preferences'] = new_preferences
        return response
    
    # Handle Email Collection
    if context == 'get_email':
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, user_message):
            response['text'] = "Please enter a valid email address (e.g., yourname@example.com)"
            response['context'] = context  # Keep same context
            return response
        new_preferences['email'] = user_message
        response['context'] = 'get_phone'
        response['text'] = "Great! And what's your phone number?"
        response['preferences'] = new_preferences
        return response
    
    # Handle Phone Collection
    if context == 'get_phone':
        phone_regex = r'[\d\s\+\-\(\)]+'
        if not re.match(phone_regex, user_message) or len(re.sub(r'[\s\+\-\(\)]', '', user_message)) < 7:
            response['text'] = "Please enter a valid phone number (e.g., +254 700 000 000)"
            response['context'] = context  # Keep same context
            return response
        new_preferences['phone'] = user_message
        response['context'] = 'select_property'
        response['text'] = "Perfect! Now, please select the property you'd like to view:"
        response['preferences'] = new_preferences
        
        # Fetch properties
        queryset = Property.objects.filter(status='available').order_by('-created_at')[:10]
        serializer = PropertyListSerializer(queryset, many=True)
        response['property_cards'] = serializer.data
        response['show_property_selection'] = True
        return response
    
    # Handle Property Selection
    if context == 'select_property':
        property_id_match = re.search(r'\d+', user_message)
        if property_id_match:
            property_id = int(property_id_match.group(0))
            try:
                property_obj = Property.objects.get(id=property_id)
                new_preferences['selectedPropertyId'] = property_obj.id
                # Get location string from available fields
                location_str = property_obj.city
                if property_obj.address:
                    location_str = f"{property_obj.address}, {property_obj.city}"
                new_preferences['location'] = location_str or preferences.get('location', 'Nairobi')
                response['context'] = 'select_time'
                response['text'] = f"Great choice! You've selected: {property_obj.title}\n📍 Location: {location_str or 'Nairobi'}\n\nWhen would you like to schedule your viewing?"
                response['show_time_slots'] = True
                response['preferences'] = new_preferences
                return response
            except Property.DoesNotExist:
                response['text'] = "I couldn't find that property. Please select a property from the list above or try again."
                response['quick_replies'] = ['Show all properties', 'Try again', '↩️ Back']
                return response
        else:
            response['text'] = "Please select a property from the list above by clicking on one of the property cards."
            response['quick_replies'] = ['Show all properties', '↩️ Back']
            return response
    
    # Handle Time Selection
    if context == 'select_time' and any(slot.lower() in lower for slot in TIME_SLOTS):
        # This will be handled by frontend to submit viewing request
        selected_time = next((slot for slot in TIME_SLOTS if slot.lower() in lower), TIME_SLOTS[0])
        converted_time = convert_time_to_24_hour(selected_time)
        new_preferences['selectedTime'] = converted_time
        response['context'] = 'viewing_confirmed'
        response['text'] = f"Perfect! Your viewing is scheduled for {selected_time}."
        response['preferences'] = new_preferences
        return response
    
    # Mortgage Calculator
    if any(word in lower for word in ['mortgage', 'calculator', '💰', 'loan']):
        response['text'] = "I can help you estimate your mortgage! 🏦\n\nOur calculator considers:\n• Property price\n• Down payment (typically 20%)\n• Interest rate (currently 3.5-4.5%)\n• Loan term (15-30 years)\n\n💡 Example:\nKSh 25M property with 20% down (KSh 5M)\n@ 4% over 30 years = ~KSh 95,000/month\n\nWould you like personalized calculations?"
        response['quick_replies'] = ['Yes, connect me', 'Calculate specific amount', 'Show me properties', 'Back to menu']
        return response
    
    # Talk to Agent
    if any(word in lower for word in ['agent', 'talk', 'speak', '👤']):
        response['text'] = f"I'll connect you with our expert real estate agent! 👨‍💼\n\nYou can:\n📞 Call us: {COMPANY_PHONE_DISPLAY}\n📧 Email: {COMPANY_EMAIL}\n💬 WhatsApp: {COMPANY_PHONE_DISPLAY}\n\nOr share your phone number and preferred time, and we'll call you!"
        response['quick_replies'] = ['📞 Call me now', '📅 Schedule callback', '💬 WhatsApp me', '↩️ Back']
        return response
    
    # Refine Search
    if any(word in lower for word in ['refine', 'different', 'change']):
        response['context'] = 'initial'
        response['text'] = "No problem! Let's start fresh. What are you looking for?"
        response['quick_replies'] = ['🏠 Find Property', '📅 Schedule Viewing', '💰 Mortgage Info', '👤 Talk to Agent']
        response['preferences'] = {}
        return response
    
    # Show more properties
    if any(word in lower for word in ['more', 'other', 'different properties', 'show all']):
        queryset = Property.objects.filter(status='available')
        if preferences.get('purpose') == 'buy':
            queryset = queryset.filter(is_for_sale=True)
        elif preferences.get('purpose') == 'rent':
            queryset = queryset.filter(is_for_rent=True)
        queryset = queryset.order_by('-created_at')[:6]
        
        serializer = PropertyListSerializer(queryset, many=True)
        if serializer.data:
            response['text'] = f"Here are {len(serializer.data)} properties you might like:"
            response['property_cards'] = serializer.data
        else:
            response['text'] = "I couldn't find any properties at the moment. Please try again later or contact an agent for assistance."
            response['quick_replies'] = ['Talk to agent', 'Refine search', 'Start over']
        return response
    
    # Greetings
    if any(word in lower for word in ['hello', 'hi', 'hey']) or lower == 'yo':
        name = preferences.get('name', '')
        response['text'] = f"Hello{' ' + name if name else ''}! 👋 How can I assist you today?"
        response['quick_replies'] = ['🏠 Find Property', '📅 Schedule Viewing', '💰 Mortgage Info', '👤 Talk to Agent']
        return response
    
    # Thank you
    if any(word in lower for word in ['thank', 'thanks']):
        response['text'] = "You're very welcome! 😊 Is there anything else I can help you with?"
        response['quick_replies'] = ['Find more properties', 'Schedule viewing', 'Talk to agent', 'All done ✅']
        return response
    
    # Done/Goodbye
    if any(word in lower for word in ['done', 'bye', 'goodbye', 'all set']):
        response['text'] = "Thank you for choosing MiiZA Realtors! 🏡✨\n\nFeel free to reach out anytime. Have a wonderful day!"
        response['quick_replies'] = ['Start new search']
        return response
    
    # Default fallback - will be handled by AI if needed
    response['text'] = "I can help you with:\n\n✓ Finding properties\n✓ Scheduling viewings\n✓ Mortgage information\n✓ Connecting with agents\n\nWhat would you like to do?"
    response['quick_replies'] = ['🏠 Find Property', '📅 Schedule Viewing', '💰 Mortgage Info', '👤 Talk to Agent']
    response['use_ai'] = True  # Flag to use AI for this response
    return response

