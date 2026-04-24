"""
Chatbot API views
"""
import os
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import ChatbotMessageSerializer, ChatbotResponseSerializer
from .chatbot_logic import process_message, COMPANY_PHONE_DISPLAY, COMPANY_EMAIL

logger = logging.getLogger(__name__)

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai package not installed. AI features will be disabled.")


def get_gemini_model():
    """Initialize and return Gemini model if API key is available"""
    if not GEMINI_AVAILABLE:
        return None
    
    api_key = os.environ.get('GOOGLE_AI_API_KEY')
    if not api_key:
        logger.warning("GOOGLE_AI_API_KEY not found in environment variables")
        return None
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        return model
    except Exception as e:
        logger.error(f"Error initializing Gemini model: {e}")
        return None


def generate_ai_response(user_message: str, conversation_history: list, preferences: dict) -> str:
    """Generate AI response using Google Gemini"""
    model = get_gemini_model()
    if not model:
        return None
    
    try:
        # Build conversation history string
        history_str = '\n'.join([
            f"{msg.get('sender', 'User')}: {msg.get('text', '')}"
            for msg in conversation_history[-10:]  # Last 10 messages
        ])
        
        # Build system prompt
        system_prompt = f"""You are a helpful and friendly real estate assistant for MiiZA Realtors Limited, a premium real estate company in Kenya. 

Your role is to help customers:
- Find properties (apartments, houses, villas, commercial spaces, offices) in Nairobi and surrounding areas
- Schedule property viewings
- Get mortgage and financing information
- Connect with real estate agents
- Answer questions about the real estate market in Kenya
- Provide property-related advice
- Answer questions about MiiZA Realtors company

Company Information - MiiZA Realtors Limited:
- Full Name: MIIZA REALTORS LIMITED
- Tagline: "Your property, our priority"
- Established: October 1, 2022
- Location: Kilimani, Nairobi, Kenya
- Phone: {COMPANY_PHONE_DISPLAY}
- Email: {COMPANY_EMAIL}
- Website: www.miizarealtors.com

About the Company:
MiiZA Realtors Limited is a professional real estate company established on October 1, 2022. We provide reliable, innovative property solutions tailored to the growing needs of residential and commercial clients across Kenya. Our focus is on delivering quality service through transparency, professionalism, and a client-first approach.

Services Offered:
1. Property Sales & Purchases - Comprehensive real estate sales and purchase services with expert guidance throughout your property transaction journey
2. Property Rentals & Leasing - Flexible rental and leasing solutions for both tenants and property owners with streamlined processes
3. Serviced Property Management - Professional property management services ensuring your investment is well-maintained and profitable
4. Real Estate Marketing - Strategic marketing solutions to maximize property visibility and attract the right buyers or tenants
5. Tenant Placement Services - Efficient tenant screening and placement to ensure reliable occupancy for property owners
6. Property Advisory & Consultancy - Expert advice and consultancy services to help you make informed real estate decisions

Core Values:
- Integrity
- Professionalism
- Customer Focus
- Innovation
- Efficiency

Why Choose MiiZA:
- Experienced and reliable real estate professionals
- Transparent and client-focused processes
- Strong understanding of the Kenyan property market
- Quick turnaround time for securing tenants and buyers
- Personalized solutions that fit your needs

Kenyan Real Estate Market Context:
- Popular areas in Nairobi: Westlands, Karen, Kilimani, Lavington, Runda, Kileleshwa, Upperhill, Parklands
- Property prices typically range from KSh 5M to KSh 100M+ depending on location and type
- Mortgage interest rates in Kenya: typically 3.5% to 4.5% for residential properties
- Common property types: Apartments, Houses, Villas, Commercial spaces, Office spaces, Land
- Rental yields in Nairobi: typically 4-8% depending on location and property type
- Popular areas for investment: Westlands (commercial), Karen (residential), Kilimani (mixed)

Current conversation context:
{history_str if history_str else 'No previous conversation'}

User preferences: {preferences}

User's current message: {user_message}

Instructions:
- Provide helpful, friendly, and professional responses
- Keep responses concise (2-3 sentences) unless the user asks for detailed information
- If the user wants to find properties, guide them through the process
- If they want to schedule a viewing, ask for their name first
- Use emojis sparingly and appropriately
- Be conversational and warm
- If you don't know something, suggest they contact an agent
- Always maintain a helpful and professional tone
- Reference Kenyan real estate market context when relevant
- Use Kenyan Shilling (KSh) for all price references
- Be culturally aware and respectful
- Maintain MiiZA's brand voice: professional yet approachable"""
        
        response = model.generate_content(system_prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating AI response: {e}")
        return None


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_message(request):
    """
    Handle chatbot messages
    POST /api/contacts/chatbot/
    
    Request body:
    {
        "message": "Hello",
        "context": "initial",
        "preferences": {},
        "conversation_history": []
    }
    
    Response:
    {
        "text": "Hello! How can I help?",
        "context": "initial",
        "quick_replies": [...],
        "property_cards": [...],
        "show_budget_selector": false,
        "preferences": {}
    }
    """
    serializer = ChatbotMessageSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid request data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    validated_data = serializer.validated_data
    user_message = validated_data.get('message', '')
    context = validated_data.get('context', 'initial')
    preferences = validated_data.get('preferences', {}) or {}
    conversation_history = validated_data.get('conversation_history', []) or []
    
    try:
        # Process message using rule-based logic
        response = process_message(user_message, context, preferences, conversation_history)
        
        # If rule-based logic suggests using AI, try AI
        if response.get('use_ai', False):
            ai_text = generate_ai_response(user_message, conversation_history, preferences)
            if ai_text:
                response['text'] = ai_text
                response['quick_replies'] = ['🏠 Find Property', '📅 Schedule Viewing', '💰 Mortgage Info', '👤 Talk to Agent']
            # If AI fails, keep the default fallback message
            response.pop('use_ai', None)
        else:
            # For rule-based responses, check if we should also try AI for enhancement
            # This is optional - can be removed if you want pure rule-based
            pass
        
        # Validate response with serializer
        response_serializer = ChatbotResponseSerializer(data=response)
        if response_serializer.is_valid():
            return Response(response_serializer.validated_data, status=status.HTTP_200_OK)
        else:
            # If validation fails, return the response anyway (might have extra fields)
            return Response(response, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error processing chatbot message: {e}", exc_info=True)
        return Response(
            {
                'error': 'An error occurred processing your message',
                'text': f"I'm having trouble connecting right now. Please try again in a moment, or you can:\n\n• Call us: {COMPANY_PHONE_DISPLAY}\n• Email: {COMPANY_EMAIL}\n\nHow else can I help you?",
                'quick_replies': ['🏠 Find Property', '📅 Schedule Viewing', '💰 Mortgage Info', '👤 Talk to Agent'],
                'context': context,
                'preferences': preferences
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

