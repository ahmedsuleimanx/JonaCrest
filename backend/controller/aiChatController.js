import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Smart fallback responses when Ollama is not available
const SMART_RESPONSES = {
  greeting: [
    "Hello! I'm Jona, your real estate assistant. How can I help you today? I can assist with property searches, scheduling viewings, or answering questions about buying and renting in Ghana.",
    "Hi there! Welcome to Jona Crest Properties. I'm here to help you find your perfect property in Ghana. What are you looking for?",
    "Welcome! I'm Jona, ready to assist you with your real estate needs. Whether you're buying, renting, or selling — I'm here to help!"
  ],
  viewing: [
    "To schedule a property viewing, you can:\n1. Browse properties at /properties\n2. Click on any property you like\n3. Use the 'Schedule Viewing' button\n4. Select your preferred date and time\n\nOur team will confirm your appointment within 24 hours!",
    "Scheduling a viewing is easy! Visit our properties page, select a property that interests you, and click 'Schedule Viewing'. You can choose a date and time that works for you, and we'll send confirmation to your email."
  ],
  services: [
    "We offer comprehensive real estate services:\n\n🏠 **Property Sales & Rentals** - Find your dream home\n🚚 **Moving Services** - Professional relocation help\n🧹 **Cleaning Services** - Pre/post move cleaning\n🔧 **Maintenance** - Property repairs and upkeep\n⚖️ **Legal Services** - Documentation and contracts\n🔍 **Property Inspection** - Professional assessments\n\nVisit /services to request any of these!",
    "Jona Crest offers: property sales, rentals, moving assistance, cleaning services, maintenance, legal support, and property inspections. Would you like details on any specific service?"
  ],
  properties: [
    "You can browse our properties at /properties. Use filters to search by:\n- Location (Accra, Kumasi, Takoradi, etc.)\n- Property type (apartment, house, villa, commercial)\n- Price range\n- Number of bedrooms\n\nEach listing includes photos, amenities, and contact options!",
    "Our property listings are available at /properties. You can filter by location, price, property type, and more. We have options across Ghana including Accra, Kumasi, Takoradi, and Tema."
  ],
  buying: [
    "Buying property in Ghana typically involves:\n\n1. **Property Search** - Browse listings that match your needs\n2. **Site Visit** - Schedule viewings to inspect properties\n3. **Negotiation** - Agree on price and terms\n4. **Due Diligence** - Verify ownership and legal status\n5. **Documentation** - Sales agreement and land title transfer\n6. **Payment** - Complete the transaction\n\nWe can assist you through each step. Would you like to browse properties?",
    "The buying process in Ghana includes property search, site visits, price negotiation, legal due diligence, and documentation. Our team can guide you through every step. Start by browsing properties at /properties!"
  ],
  renting: [
    "Renting in Ghana is straightforward:\n\n1. Browse available rental properties at /properties\n2. Schedule viewings for properties you like\n3. Review the lease terms\n4. Pay the required advance (typically 1-2 years in Ghana)\n5. Sign the tenancy agreement\n6. Move in!\n\nWe have apartments, houses, and commercial spaces available for rent.",
    "For rentals, browse our listings at /properties and filter by 'For Rent'. In Ghana, rentals typically require 1-2 years advance payment. We can help you find the perfect rental within your budget."
  ],
  location: [
    "We have properties across Ghana's major cities:\n\n🏙️ **Accra** - Capital city, business hub (East Legon, Airport, Cantonments, Tema)\n🌆 **Kumasi** - Garden city, cultural heart\n🌊 **Takoradi** - Oil & gas hub, coastal living\n⚓ **Tema** - Port city, industrial area\n\nEach location has unique benefits. What area interests you?",
    "Our listings cover Accra (East Legon, Cantonments, Airport Residential), Kumasi, Takoradi, and Tema. Each area has distinct advantages — Accra for business, Kumasi for culture, Takoradi for coastal living. Which location interests you?"
  ],
  pricing: [
    "Property prices in Ghana vary by location and type:\n\n**Accra (Prime Areas)**\n- Apartments: $80,000 - $500,000+\n- Houses: $200,000 - $2M+\n\n**Other Cities**\n- Generally 30-50% lower than Accra\n\n**Rentals**\n- Apartments: $500 - $3,000/month\n- Houses: $1,000 - $10,000/month\n\nBrowse /properties to see current listings with exact pricing!",
    "Prices depend on location and property type. Accra's prime areas (East Legon, Cantonments) are premium, while Kumasi and Takoradi offer more affordable options. Visit /properties to see listings within your budget range."
  ],
  contact: [
    "You can reach our team through:\n\n📧 Contact form at /contact\n📱 Phone: Available on our contact page\n💬 This chat - I'm here to help!\n\nFor urgent matters, the contact page has our direct phone numbers. How else can I assist you?",
    "Visit /contact to reach our team directly. You can also continue chatting with me for instant answers to common questions!"
  ],
  default: [
    "I'd be happy to help! Here's what I can assist with:\n\n• 🏠 Finding properties (browse at /properties)\n• 📅 Scheduling viewings\n• 🛠️ Service requests (/services)\n• 💰 Pricing and budget advice\n• 📍 Location recommendations\n• 📞 Connecting you with our team (/contact)\n\nWhat would you like to know more about?",
    "Great question! I can help you with property searches, viewings, services, and general real estate guidance. Feel free to browse our properties at /properties or ask me anything specific about buying, renting, or selling in Ghana.",
    "I'm here to assist with your real estate needs! You can explore properties at /properties, request services at /services, or ask me about the buying/renting process in Ghana. What interests you most?"
  ]
};

const getSmartResponse = (message) => {
  const lower = message.toLowerCase();
  
  // Greetings
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings)/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.greeting);
  }
  
  // Viewing/scheduling
  if (/view(ing)?|schedule|appointment|visit|tour|see\s*(the|a)?\s*propert/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.viewing);
  }
  
  // Services
  if (/service|moving|clean(ing)?|maintenance|repair|legal|inspection|help\s*with/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.services);
  }
  
  // Properties/search
  if (/propert(y|ies)|listing|available|search|find|look(ing)?\s*for|show\s*me|browse/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.properties);
  }
  
  // Buying
  if (/buy(ing)?|purchase|own(ership)?|invest(ment)?|how\s*(to|do|does).*buy/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.buying);
  }
  
  // Renting
  if (/rent(ing|al)?|lease|tenant|let(ting)?|how\s*(to|do|does).*rent/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.renting);
  }
  
  // Location
  if (/accra|kumasi|takoradi|tema|ghana|location|area|neighborhood|where|city|cities/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.location);
  }
  
  // Pricing
  if (/price|cost|budget|afford|expensive|cheap|how\s*much|payment|fee/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.pricing);
  }
  
  // Contact
  if (/contact|reach|call|phone|email|speak|talk\s*to|agent|support/i.test(lower)) {
    return randomChoice(SMART_RESPONSES.contact);
  }
  
  // Default
  return randomChoice(SMART_RESPONSES.default);
};

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Track if Ollama is available
let ollamaAvailable = null;

const checkOllamaConnection = async () => {
  try {
    await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 });
    ollamaAvailable = true;
    return true;
  } catch {
    ollamaAvailable = false;
    return false;
  }
};

// Check on startup
checkOllamaConnection();

export const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Try Ollama if available
    if (ollamaAvailable !== false) {
      try {
        const messages = [
          { role: 'system', content: `You are Jona, a friendly AI assistant for Jona Crest Properties in Ghana. Help with property searches, viewings, buying/renting advice, and services. Keep responses concise (2-4 sentences). Be warm and professional.` },
          ...history.slice(-10).map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content
          })),
          { role: 'user', content: message.trim() }
        ];

        const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
          model: OLLAMA_MODEL,
          messages,
          stream: false,
          options: { temperature: 0.7, top_p: 0.9, num_predict: 300 }
        }, { timeout: 30000 });

        const reply = response.data?.message?.content;
        if (reply) {
          ollamaAvailable = true;
          return res.json({ success: true, reply: reply.trim(), model: OLLAMA_MODEL, source: 'ollama' });
        }
      } catch (error) {
        console.log('Ollama unavailable, using smart fallback');
        ollamaAvailable = false;
      }
    }

    // Use smart fallback
    const reply = getSmartResponse(message.trim());
    res.json({ success: true, reply, model: 'smart-fallback', source: 'fallback' });
    
  } catch (error) {
    console.error('AI Chat error:', error.message);
    const reply = getSmartResponse(req.body?.message || '');
    res.json({ success: true, reply, model: 'smart-fallback', source: 'fallback' });
  }
};

export const checkAIStatus = async (req, res) => {
  const isOllamaUp = await checkOllamaConnection();
  
  res.json({
    success: true,
    available: true, // Always available with fallback
    ollamaAvailable: isOllamaUp,
    model: isOllamaUp ? OLLAMA_MODEL : 'smart-fallback',
    message: isOllamaUp ? 'Ollama is running' : 'Using smart fallback responses'
  });
};
