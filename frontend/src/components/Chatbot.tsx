import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle, X, Send, Home, Calendar, Calculator, User,
  MapPin, Bed, Bath, Ruler, Clock, CheckCircle2, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { propertiesApi, viewingRequestsApi, chatbotApi, getPropertyImageUrl, formatPropertyPrice, getDisplayArea, getDisplayBedrooms, type Property as ApiProperty } from "@/services/api";

// Types
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  quickReplies?: string[];
  propertyCards?: ApiProperty[];
  showBudgetSelector?: boolean;
  showLocationChips?: boolean;
  showTimeSlots?: boolean;
  showBedroomSelector?: boolean;
  showPropertySelection?: boolean;
}

interface UserPreferences {
  name?: string;
  email?: string;
  phone?: string;
  propertyType?: string;
  budgetRange?: string;
  location?: string;
  bedrooms?: number;
  purpose?: 'buy' | 'rent';
  selectedPropertyId?: number;
}

// Property type mapping for API
const PROPERTY_TYPE_MAP: Record<string, string> = {
  'apartment': 'apartment',
  'house': 'house',
  'townhouse': 'house',
  'townhouses': 'house',
  'villa': 'villa',
  'commercial': 'commercial',
  'office': 'office',
  'land': 'land',
  'airbnb': 'airbnb'
};

// Contact information from website
const COMPANY_PHONE = '+254717334422'; // Main phone number from Footer
const COMPANY_PHONE_DISPLAY = '+254-717-334-422';
const COMPANY_EMAIL = 'info@miizarealtors.com';
const COMPANY_LOCATION = 'Kilimani, Nairobi, Kenya';

const LOCATIONS = ['Westlands', 'Karen', 'Kilimani', 'Lavington', 'Runda', 'Kileleshwa', 'Upperhill', 'Parklands'];
const BUDGET_RANGES = ['Under KSh 10M', 'KSh 10-25M', 'KSh 25-50M', 'KSh 50M+'];
const TIME_SLOTS = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
const BEDROOM_OPTIONS = ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'];

// Convert time from "9:00 AM" format to "09:00:00" format for backend
const convertTimeTo24Hour = (timeStr: string): string => {
  const timeMap: Record<string, string> = {
    '9:00 am': '09:00:00',
    '11:00 am': '11:00:00',
    '2:00 pm': '14:00:00',
    '4:00 pm': '16:00:00',
  };
  const normalized = timeStr.toLowerCase().trim();
  return timeMap[normalized] || '09:00:00';
};

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [context, setContext] = useState('initial');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBookNow, setShowBookNow] = useState(false);
  const bookNowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "Hi! 👋 I'm your MiiZA Real Estate Assistant. I'm here to help you find your dream property!",
        { quickReplies: ['🏠 Find Property', '📅 Schedule Viewing', '💰 Mortgage Info', '👤 Talk to Agent'] }
      );
    }
  }, [isOpen]);

  // Animated BOOK NOW button - appears every 10 seconds
  useEffect(() => {
    const showBookNowButton = () => {
      setShowBookNow(true);
      // Hide after animation completes (5 seconds)
      setTimeout(() => {
        setShowBookNow(false);
      }, 5000);
    };

    // Show immediately on mount, then every 10 seconds
    showBookNowButton();
    const interval = setInterval(showBookNowButton, 10000);

    return () => {
      clearInterval(interval);
      if (bookNowTimeoutRef.current) {
        clearTimeout(bookNowTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to generate unique ID
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Add bot message with typing delay
  const addBotMessage = (text: string, options: Partial<Message> = {}) => {
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: generateId(),
        text,
        sender: "bot",
        timestamp: new Date(),
        ...options
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Add user message immediately
  const addUserMessage = (text: string) => {
    const userMessage: Message = {
      id: generateId(),
      text,
      sender: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  // Main message processor - calls backend API
  const processMessage = async (userMessage: string) => {
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .slice(-10)
        .map(msg => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp.toISOString()
        }));

      // Call backend chatbot API
      const response = await chatbotApi.sendMessage({
        message: userMessage,
        context: context,
        preferences: preferences,
        conversation_history: conversationHistory
      });

      // Update context and preferences from response
      if (response.context) {
        setContext(response.context);
      }
      if (response.preferences) {
        setPreferences(response.preferences);
      }

      // Handle time selection - save booking if time is selected
      const handled = await handleTimeSelectionAndBooking(userMessage);
      if (handled) {
        setIsTyping(false);
        return;
      }

      // Add bot message with response
      addBotMessage(
        response.text,
        {
          quickReplies: response.quick_replies,
          propertyCards: response.property_cards,
          showBudgetSelector: response.show_budget_selector,
          showLocationChips: response.show_location_chips,
          showTimeSlots: response.show_time_slots,
          showBedroomSelector: response.show_bedroom_selector,
          showPropertySelection: response.show_property_selection
        }
      );
    } catch (error: any) {
      console.error('Error processing message:', error);
      addBotMessage(
        `I'm having trouble connecting right now. Please try again in a moment, or you can:\n\n• Call us: ${COMPANY_PHONE_DISPLAY}\n• Email: ${COMPANY_EMAIL}\n\nHow else can I help you?`,
        { quickReplies: ['🏠 Find Property', '📅 Schedule Viewing', '💰 Mortgage Info', '👤 Talk to Agent'] }
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Handle time selection and save booking
  const handleTimeSelectionAndBooking = async (userMessage: string) => {
    const lower = userMessage.toLowerCase();
    if (context !== 'select_time' || !TIME_SLOTS.some(slot => lower.includes(slot.toLowerCase()))) {
      return false; // Not a time selection
    }

    // Save booking to backend
    setIsTyping(true);
    try {
      // Get today's date and format it
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Convert time format from "9:00 AM" to "09:00:00"
      const convertedTime = convertTimeTo24Hour(userMessage);

      // Get property details for the message
      let propertyTitle = '';
      let propertyLocation = '';
      if (preferences.selectedPropertyId) {
        try {
          const property = await propertiesApi.getById(preferences.selectedPropertyId);
          propertyTitle = property.title;
          propertyLocation = property.location || property.city || property.address || 'Nairobi';
        } catch (error) {
          console.error('Error fetching property details:', error);
        }
      }

      // Validate that property is selected
      if (!preferences.selectedPropertyId) {
        setIsTyping(false);
        addBotMessage(
          `Please select a property first before scheduling the viewing time.`,
          { quickReplies: ['Show properties', '↩️ Back'] }
        );
        return true;
      }

      // Prepare booking data - property is required
      const bookingData: any = {
        name: preferences.name!,
        email: preferences.email!,
        phone: preferences.phone!,
        preferred_date: formattedDate,
        preferred_time: convertedTime,
        message: `Booking via chatbot. Property: ${propertyTitle}. Location: ${propertyLocation}. Property type: ${preferences.propertyType || 'Not specified'}.`,
        property: preferences.selectedPropertyId
      };

      // Submit to backend
      const response = await viewingRequestsApi.submit(bookingData);

      setIsTyping(false);
      setContext('viewing_confirmed');

      // Extract reference number from response
      const refNumber = response.reference_number || 'VW' + Math.random().toString(36).substr(2, 6).toUpperCase();

      addBotMessage(
        `✅ Perfect! Your viewing is confirmed!\n\n📋 Reference: ${refNumber}\n👤 Name: ${preferences.name}\n📧 Email: ${preferences.email}\n📞 Phone: ${preferences.phone}\n🏠 Property: ${propertyTitle}\n📍 Location: ${propertyLocation}\n🕐 Time: ${userMessage}\n\nWe'll send you a confirmation email shortly. Our agent will call you 30 minutes before the appointment.\n\nYour booking has been saved and our admin team will review it shortly!`,
        { quickReplies: ['📅 Schedule another', '🏠 Find more properties', '👤 Talk to agent', '✅ All done'] }
      );

      // Reset preferences for next booking (keep name, email, phone for convenience)
      setPreferences(prev => ({
        name: prev.name,
        email: prev.email,
        phone: prev.phone,
        selectedPropertyId: undefined
      }));
      return true;
    } catch (error: any) {
      setIsTyping(false);
      console.error('Error saving booking:', error);

      // Extract error message if available
      let errorMessage = 'I encountered an issue saving your booking.';
      if (error?.message) {
        errorMessage += ` Error: ${error.message}`;
      }

      addBotMessage(
        `${errorMessage}\n\nPlease try again or contact us directly at ${COMPANY_PHONE_DISPLAY}.`,
        { quickReplies: ['Try again', '📞 Call me now', '💬 WhatsApp me', '↩️ Back'] }
      );
      return true;
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const message = inputValue.trim();
    addUserMessage(message);

    // Handle special actions (call, WhatsApp)
    const lower = message.toLowerCase();
    if (lower.includes('call me now') || (lower.includes('call') && lower.includes('now') && !lower.includes('agent'))) {
      window.open(`tel:${COMPANY_PHONE}`, '_self');
      addBotMessage(
        `Opening your phone dialer to call ${COMPANY_PHONE_DISPLAY}...`,
        { quickReplies: ['💬 WhatsApp me', '📅 Schedule callback', '↩️ Back'] }
      );
      setInputValue("");
      return;
    }

    if (lower.includes('whatsapp me') || (lower.includes('whatsapp') && !lower.includes('agent'))) {
      const whatsappNumber = COMPANY_PHONE.replace(/[\s-]/g, '');
      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
      addBotMessage(
        `Opening WhatsApp to chat with us at ${COMPANY_PHONE_DISPLAY}...`,
        { quickReplies: ['📞 Call me now', '📅 Schedule callback', '↩️ Back'] }
      );
      setInputValue("");
      return;
    }

    await processMessage(message);
    setInputValue("");
  };

  // Handle quick reply
  const handleQuickReply = async (reply: string) => {
    addUserMessage(reply);
    await processMessage(reply);
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-50 transition-transform hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">MiiZA Assistant</h3>
                <p className="text-xs flex items-center gap-1 opacity-90">
                  <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online - Ready to help
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-gray-50" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${message.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 shadow rounded-bl-sm"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Quick Replies */}
                  {message.quickReplies && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-2">
                      {message.quickReplies.map((reply, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-white hover:bg-blue-50 border-blue-200"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Property Cards */}
                  {message.propertyCards && (
                    <div className="mt-3">
                      {message.showPropertySelection && (
                        <p className="text-xs text-gray-600 mb-2 ml-2">
                          💡 Click on a property card or the "Select" button to choose a property for viewing
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {message.propertyCards.map((prop) => (
                          <Card
                            key={prop.id}
                            className="group overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 rounded-lg"
                            onClick={() => {
                              if (context === 'select_property') {
                                // During property selection, select the property
                                setPreferences(prev => ({
                                  ...prev,
                                  selectedPropertyId: prop.id,
                                  location: prop.location || prop.city || prev.location
                                }));
                                setContext('select_time');
                                addBotMessage(
                                  `Great choice! You've selected: ${prop.title}\n📍 Location: ${prop.location || prop.city || 'Nairobi'}\n\nWhen would you like to schedule your viewing?`,
                                  { showTimeSlots: true }
                                );
                              } else {
                                // Otherwise, open property details
                                window.open(`/property/${prop.id}`, '_blank');
                              }
                            }}
                          >
                            <div className="relative overflow-hidden h-24 sm:h-28">
                              <img
                                src={getPropertyImageUrl(prop)}
                                alt={prop.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                            </div>

                            <div className="p-2">
                              <div className="mb-2">
                                <h4 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                  {prop.title}
                                </h4>
                                <p className="text-xs text-gray-500 mb-1 capitalize">
                                  {prop.property_type?.replace('_', ' ') || prop.type}
                                </p>
                                <p className="text-xs text-gray-600 flex items-center">
                                  <MapPin className="h-2 w-2 mr-1 flex-shrink-0" />
                                  {prop.location || prop.city || 'Nairobi'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                {getDisplayBedrooms(prop) !== "—" && (
                                  <span className="flex items-center">
                                    <Bed className="h-2 w-2 mr-1" />
                                    {getDisplayBedrooms(prop)} beds
                                  </span>
                                )}
                                {prop.bathrooms > 0 && (
                                  <span className="flex items-center">
                                    <Bath className="h-2 w-2 mr-1" />
                                    {prop.bathrooms} baths
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Ruler className="h-2 w-2 mr-1" />
                                  {getDisplayArea(prop)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                <span className="text-xs font-bold text-blue-600">
                                  {formatPropertyPrice(prop)}
                                </span>
                              </div>

                              <Button
                                size="sm"
                                className="w-full mt-2 text-xs h-7 bg-blue-600 hover:bg-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (context === 'select_property') {
                                    // During property selection, select the property and move to time selection
                                    setPreferences(prev => ({
                                      ...prev,
                                      selectedPropertyId: prop.id,
                                      location: prop.location || prop.city || prev.location
                                    }));
                                    setContext('select_time');
                                    addBotMessage(
                                      `Great choice! You've selected: ${prop.title}\n📍 Location: ${prop.location || prop.city || 'Nairobi'}\n\nWhen would you like to schedule your viewing?`,
                                      { showTimeSlots: true }
                                    );
                                  } else {
                                    // Otherwise, start booking flow
                                    setPreferences(prev => ({ ...prev, selectedPropertyId: prop.id }));
                                    handleQuickReply(`Book viewing`);
                                  }
                                }}
                              >
                                {context === 'select_property' ? '✓ Select This Property' : '📅 Book Viewing'}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Chips */}
                  {message.showLocationChips && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-2">
                      {LOCATIONS.map((loc) => (
                        <Button
                          key={loc}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(loc)}
                          className="text-xs bg-white hover:bg-blue-50"
                        >
                          📍 {loc}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Budget Selector */}
                  {message.showBudgetSelector && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {BUDGET_RANGES.map((budget) => (
                        <Button
                          key={budget}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(budget)}
                          className="text-xs h-auto py-2 bg-white hover:bg-blue-50"
                        >
                          💰 {budget}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Bedroom Selector */}
                  {message.showBedroomSelector && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {BEDROOM_OPTIONS.map((option) => (
                        <Button
                          key={option}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(option)}
                          className="text-xs h-auto py-2 bg-white hover:bg-blue-50"
                        >
                          🛏️ {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Time Slots */}
                  {message.showTimeSlots && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {TIME_SLOTS.map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(time)}
                          className="text-xs flex items-center gap-1 bg-white hover:bg-blue-50"
                        >
                          <Clock className="h-3 w-3" /> {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                size="icon"
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Animated BOOK NOW Button */}
      {!isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-40 transition-all duration-500 ease-in-out ${showBookNow
              ? 'translate-x-0 opacity-100'
              : 'translate-x-[120%] opacity-0'
            }`}
        >
          <Button
            onClick={() => navigate('/contact')}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 animate-pulse"
          >
            <Calendar className="h-5 w-5" />
            BOOK NOW
          </Button>
        </div>
      )}
    </>
  );
};

export default Chatbot;