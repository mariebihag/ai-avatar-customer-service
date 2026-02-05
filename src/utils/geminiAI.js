import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Route message to appropriate avatar based on keywords
export function routeToAvatar(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // DAISY - Concierge (Scheduling, Booking, Pricing, Payment, Capacity)
  const daisyKeywords = [
    'schedule', 'book', 'booking', 'reserve', 'reservation', 'appointment',
    'price', 'cost', 'how much', 'rate', 'fee', 'charge', 'payment',
    'available', 'availability', 'check in', 'capacity', 'how many',
    'gcash', 'cash', 'card', 'deposit', 'pay'
  ];
  
  // JOHN - Support (Contact, Cancellation, Confirmation, Check-in/out, Modification)
  const johnKeywords = [
    'cancel', 'cancellation', 'refund', 'change', 'modify', 'reschedule',
    'confirm', 'confirmation', 'verify', 'check my booking', 'update',
    'check out', 'checkout', 'late checkout', 'help', 'support', 'problem',
    'contact', 'phone', 'email', 'call', 'issue', 'complaint'
  ];
  
  // SARAH - Host (Greetings, Location, Facilities, Room Types, Rules, Farewell)
  const sarahKeywords = [
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon',
    'where', 'location', 'address', 'directions', 'parking', 'find',
    'facilities', 'amenities', 'restaurant', 'pool', 'gym', 'laundry',
    'room types', 'what rooms', 'what kind', 'features', 'services',
    'rules', 'policy', 'smoking', 'pets', 'quiet hours',
    'bye', 'goodbye', 'thanks', 'thank you'
  ];
  
  // Check for Daisy keywords
  if (daisyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'daisy';
  }
  
  // Check for John keywords
  if (johnKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'john';
  }
  
  // Default to Sarah for general queries
  return 'sarah';
}

export async function getAIResponse(userMessage, userContext = {}, avatar = 'sarah') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Avatar-specific context
    const avatarContext = {
      sarah: `You are Sarah, the Welcoming Host at Hotel Rafaela in Dasmariñas, Cavite. You handle: greetings, general information, location & directions, facilities & amenities, room type descriptions, hotel rules & policies, and farewells. Be warm and welcoming.`,
      
      daisy: `You are Daisy, the Booking Specialist at Hotel Rafaela in Dasmariñas, Cavite. You handle: room scheduling & reservations, pricing & rates, availability checks, payment processing, capacity & occupancy questions. Be professional and detail-oriented.`,
      
      john: `You are John, the Support Manager at Hotel Rafaela in Dasmariñas, Cavite. You handle: booking modifications & cancellations, reservation confirmations, check-in/check-out assistance, customer support & complaints, contact information. Be helpful and solution-focused.`
    };
    
    let contextPrompt = avatarContext[avatar] || avatarContext.sarah;
    
    if (userContext.age) {
      contextPrompt += ` The customer appears to be a ${userContext.age}. `;
      if (userContext.age === 'child') {
        contextPrompt += `Use simple, friendly language. `;
      }
    }
    
    if (userContext.emotion) {
      contextPrompt += `The customer seems to be feeling ${userContext.emotion}. `;
      if (userContext.emotion === 'sad' || userContext.emotion === 'angry') {
        contextPrompt += `Be extra empathetic, understanding, and helpful. `;
      } else if (userContext.emotion === 'happy') {
        contextPrompt += `Match their positive energy with enthusiasm! `;
      }
    }

    contextPrompt += `\n\nCustomer message: ${userMessage}\n\nProvide a helpful, professional response (2-4 sentences). Use Philippine Peso (₱) for pricing.`;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return "I apologize for the inconvenience. I'm having trouble processing your request right now. Could you please try again?";
  }
}

// Comprehensive customer service scripts categorized by avatar
export const customerServiceScripts = {
  // SARAH - Host (Greetings, Location, Facilities, Room Types, Rules, Farewell)
  sarah: {
    greeting: {
      triggers: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
      responses: [
        "Hello! Welcome to Hotel Rafaela. I'm Sarah, your host assistant. I can help you with general information, facilities, and directions. How may I assist you today?",
        "Hi there! I'm Sarah from Hotel Rafaela in Dasmariñas, Cavite. I'd be happy to tell you about our facilities and location. What would you like to know?",
        "Good day! Welcome to Hotel Rafaela. I'm here to help you learn about our hotel, amenities, and services. What can I share with you?"
      ]
    },
    location: {
      triggers: ['where', 'location', 'address', 'directions', 'how to get', 'parking', 'find', 'cavite'],
      responses: [
        "Hotel Rafaela is located in Dasmariñas, Cavite, Philippines. We offer free parking for all guests and can arrange airport transfers for an additional fee. Would you like specific directions?",
        "We're conveniently located in Dasmariñas, Cavite with easy access from Manila. Free parking is included, and airport transfers can be arranged. How can I help with directions?",
        "You'll find us in Dasmariñas, Cavite with complimentary parking available. Need help planning your route to our hotel?"
      ]
    },
    facilities: {
      triggers: ['restaurant', 'pool', 'swimming', 'gym', 'fitness', 'laundry', 'facilities', 'amenities', 'room service', 'food'],
      responses: [
        "Hotel Rafaela offers a Restaurant (6:00 AM - 10:00 PM), Room Service (6:00 AM - 9:00 PM), Swimming Pool (8:00 AM - 8:00 PM), 24/7 Gym, and next-day Laundry Service. What interests you?",
        "Our facilities include a restaurant, swimming pool, fitness gym, room service, and laundry service. All guests enjoy free Wi-Fi and parking. Would you like specific operating hours?",
        "We have excellent amenities! Restaurant hours are 6:00 AM to 10:00 PM, pool is open 8:00 AM - 8:00 PM, and the gym is available 24/7. What would you like to know more about?"
      ]
    },
    roomTypes: {
      triggers: ['what rooms', 'room types', 'types of rooms', 'what kind', 'room options', 'features', 'describe the rooms'],
      responses: [
        "We offer four room types: Standard Room (2 guests), Deluxe Room (3 guests), Executive Suite (4 guests), and Family Room (5 guests). All include free Wi-Fi, AC, TV, minibar, and toiletries. Would you like me to connect you with Daisy for pricing?",
        "All our rooms feature air conditioning, free Wi-Fi, television, minibar, safety deposit box, and complimentary toiletries. Our rooms accommodate 2 to 5 guests. Shall I have Daisy help with booking details?",
        "Great question! Our rooms range from Standard (perfect for couples) to Family Rooms (sleeps 5). All include modern amenities and daily housekeeping. Would you like pricing information from our booking specialist Daisy?"
      ]
    },
    rules: {
      triggers: ['rules', 'policy', 'policies', 'smoking', 'pets', 'noise', 'quiet hours', 'house rules', 'allowed'],
      responses: [
        "Hotel Rafaela house rules: No smoking inside rooms, no pets allowed, quiet hours 10:00 PM - 7:00 AM, minimum age 18 for check-in, and valid ID required. Any questions about our policies?",
        "Our policies ensure a comfortable stay: smoking is not allowed in rooms, pets are prohibited, and quiet hours are from 10:00 PM to 7:00 AM. We require guests to be 18+ with valid ID.",
        "Key house rules: smoking-free rooms, no pets, quiet hours (10 PM - 7 AM), 18+ check-in age, and ID requirement. These help us maintain a pleasant environment for all guests."
      ]
    },
    farewell: {
      triggers: ['bye', 'goodbye', 'see you', 'thanks', 'thank you', 'that\'s all'],
      responses: [
        "You're very welcome! If you need booking assistance, Daisy can help you. For any other questions, feel free to reach out. Have a wonderful day!",
        "Thank you for your interest in Hotel Rafaela! Our booking specialist Daisy is ready to assist with reservations anytime. Take care!",
        "Glad I could help! Don't hesitate to contact us if you need anything else. Enjoy your day!"
      ]
    }
  },
  
  // DAISY - Concierge (Scheduling, Booking, Pricing, Payment, Capacity, Availability)
  daisy: {
    scheduling: {
      triggers: ['schedule', 'book', 'appointment', 'reservation', 'reserve', 'make a booking', 'want to book', 'need a room'],
      responses: [
        "I'd be happy to help you book a room! We have Standard Rooms (₱3,000/night), Deluxe Rooms (₱4,500/night), Executive Suites (₱6,800/night), and Family Rooms (₱8,000/night). What dates are you looking at?",
        "Excellent! Let me help you with your reservation. Check-in is at 2:00 PM and check-out at 12:00 NN. Could you provide your preferred dates and number of guests?",
        "Great! To proceed with booking, I'll need: 1) Check-in date, 2) Check-out date, 3) Number of guests, 4) Room type preference. Which room interests you?"
      ]
    },
    availability: {
      triggers: ['available', 'availability', 'free', 'open', 'vacant', 'any rooms', 'check availability'],
      responses: [
        "Let me check our availability for you. We have Standard Rooms (2 guests), Deluxe Rooms (3 guests), Executive Suites (4 guests), and Family Rooms (5 guests). What dates and how many guests?",
        "Hotel Rafaela offers same-day bookings subject to availability! Our front desk is available 24/7. What check-in date are you considering?",
        "I can check availability right away! Could you specify your check-in date and number of guests? We have various room types to accommodate your needs."
      ]
    },
    pricing: {
      triggers: ['price', 'cost', 'how much', 'rate', 'fee', 'charge', 'expensive', 'affordable', 'budget'],
      responses: [
        "Our room rates are: Standard Room ₱3,000/night (2 guests), Deluxe Room ₱4,500/night (3 guests), Executive Suite ₱6,800/night (4 guests), and Family Room ₱8,000/night (5 guests). A one-night deposit is required upon booking.",
        "Hotel Rafaela offers competitive rates! We accept Cash, Credit/Debit Cards, and GCash. Late check-out is ₱500/hour (max 3 hours). Would you like details on a specific room type?",
        "Our pricing includes all in-room amenities and free parking. Rates start at ₱3,000 for Standard Rooms up to ₱8,000 for Family Rooms. What's your budget and group size?"
      ]
    },
    payment: {
      triggers: ['pay', 'payment', 'gcash', 'cash', 'card', 'credit card', 'how to pay', 'deposit'],
      responses: [
        "We accept Cash, Credit/Debit Cards, and GCash. A one-night room rate deposit is required to secure your booking. Full payment can be made upon check-in or check-out.",
        "Payment methods include Cash, Credit/Debit Card, and GCash. We require a deposit of one night's room rate when booking. The remaining balance is due at check-out.",
        "Hotel Rafaela accepts multiple payment options: Cash, Cards, and GCash. A one-night deposit secures your reservation, with the balance payable during your stay."
      ]
    },
    capacity: {
      triggers: ['how many people', 'capacity', 'guests', 'accommodate', 'fit', 'room size', 'occupancy'],
      responses: [
        "Our room capacities are: Standard Room (2 guests), Deluxe Room (3 guests), Executive Suite (4 guests), and Family Room (5 guests). How many people will be staying?",
        "We can accommodate from 2 to 5 guests depending on room type. For larger groups, we can arrange multiple rooms. What's your total number of guests?",
        "Our rooms range from Standard (couples/2 people) to Family Rooms (up to 5 people). Could you let me know your group size so I can recommend the best option?"
      ]
    }
  },
  
  // JOHN - Support (Contact, Cancellation, Confirmation, Check-in/out, Modification, Help)
  john: {
    modification: {
      triggers: ['change', 'modify', 'reschedule', 'update', 'move', 'different time', 'another date', 'switch', 'edit'],
      responses: [
        "I can help you modify your booking. Reservation changes are allowed up to 24 hours before check-in. Please provide your reservation number and what you'd like to change.",
        "No problem! You can modify your reservation up to 24 hours in advance. What changes do you need? Please share your booking reference number.",
        "I'd be happy to help reschedule. Please share your booking reference number. Special requests for room preference, bed type, or accessibility can also be accommodated."
      ]
    },
    cancellation: {
      triggers: ['cancel', 'cancellation', 'refund', 'get money back', 'cancel booking'],
      responses: [
        "Our cancellation policy: Full refund if canceled 48+ hours before check-in, 50% refund if 24-48 hours before, and no refund within 24 hours or for no-shows. Refunds process in 5-7 business days.",
        "You can cancel with: 100% refund (48+ hours notice), 50% refund (24-48 hours notice), or no refund (within 24 hours). Processing takes 5-7 business days. Would you like to cancel?",
        "Cancellation policy at Hotel Rafaela: Cancel 48+ hours ahead for full refund, 24-48 hours for 50% refund, or within 24 hours for no refund. Need help with cancellation?"
      ]
    },
    confirmation: {
      triggers: ['confirm', 'confirmation', 'verify', 'check my booking', 'booking details', 'reservation details'],
      responses: [
        "I can look up your booking confirmation. Please provide your reservation ID or the email address used for booking. You can also contact our 24/7 front desk at +63 912 345 6789.",
        "To verify your reservation at Hotel Rafaela, I'll need either your confirmation number or contact details. I can confirm your check-in date, check-out, room type, and any special requests.",
        "Let me pull up your booking information. Please share your reservation reference or the email where confirmation was sent to support@hotelrafaela.com."
      ]
    },
    checkin: {
      triggers: ['check in', 'check-in', 'arrival', 'when can i check in', 'early check in'],
      responses: [
        "Check-in time at Hotel Rafaela is 2:00 PM. Early check-in is subject to room availability. Please bring a valid government-issued ID. Minimum check-in age is 18 years old.",
        "Our standard check-in is at 2:00 PM. If you need early check-in, please let us know - we'll do our best to accommodate based on availability. A valid ID is required.",
        "Check-in begins at 2:00 PM. You'll need a valid government-issued ID and must be at least 18 years old. Early check-in requests can be arranged subject to availability."
      ]
    },
    checkout: {
      triggers: ['check out', 'check-out', 'departure', 'when checkout', 'late checkout'],
      responses: [
        "Check-out time is 12:00 NN (noon). Late check-out is available for ₱500 per hour with a maximum of 3 hours extension. Would you like to request late check-out?",
        "Standard check-out is at 12:00 NN. If you need a late check-out, it's ₱500/hour (maximum 3 hours). Please inform the front desk in advance.",
        "Check-out is at 12:00 noon. Late check-out costs ₱500 per hour, up to 3 hours maximum. Let us know if you need this arrangement!"
      ]
    },
    contact: {
      triggers: ['contact', 'phone', 'email', 'call', 'reach', 'number', 'contact number'],
      responses: [
        "You can reach Hotel Rafaela at: Phone: +63 912 345 6789 (24/7 front desk), Email: support@hotelrafaela.com. We're here to help anytime!",
        "Contact us at +63 912 345 6789 for immediate assistance - our front desk operates 24/7. You can also email support@hotelrafaela.com for inquiries.",
        "Hotel Rafaela contact information: Call +63 912 345 6789 (available 24/7) or email support@hotelrafaela.com. How can we assist you today?"
      ]
    },
    help: {
      triggers: ['help', 'assist', 'support', 'problem', 'issue', 'question', 'complaint'],
      responses: [
        "I'm here to help with any issues! I can assist with booking modifications, cancellations, confirmations, or general support. Our front desk is also available 24/7 at +63 912 345 6789. What do you need?",
        "Of course! I specialize in customer support and can help with booking changes, cancellations, confirmations, or resolving issues. What specific assistance do you need?",
        "Happy to help! I can guide you through modifications, cancellations, confirmations, or resolve any concerns. Maintenance requests are handled within 30 minutes. How can I assist?"
      ]
    }
  }
};

export function getScriptedResponse(userMessage, avatar = 'sarah') {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Get scripts for the specific avatar
  const avatarScripts = customerServiceScripts[avatar];
  
  if (!avatarScripts) return null;
  
  // Check each category for trigger matches
  for (const [category, script] of Object.entries(avatarScripts)) {
    for (const trigger of script.triggers) {
      if (lowerMessage.includes(trigger)) {
        const responses = script.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }
  
  return null; // No scripted response found, will use AI
}

// Extract booking intent and details from user message
export function extractBookingDetails(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  const details = {
    hasIntent: false,
    date: null,
    time: null,
    guests: null,
    roomType: null
  };

  const schedulingKeywords = ['schedule', 'book', 'reserve', 'reservation', 'check in'];
  details.hasIntent = schedulingKeywords.some(keyword => lowerMessage.includes(keyword));

  const datePatterns = ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  datePatterns.forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      details.date = pattern;
    }
  });

  const numberMatch = lowerMessage.match(/\d+/);
  if (numberMatch) {
    details.guests = parseInt(numberMatch[0]);
  }

  if (lowerMessage.includes('standard')) details.roomType = 'standard';
  if (lowerMessage.includes('deluxe')) details.roomType = 'deluxe';
  if (lowerMessage.includes('executive') || lowerMessage.includes('suite')) details.roomType = 'executive';
  if (lowerMessage.includes('family')) details.roomType = 'family';

  return details;
}