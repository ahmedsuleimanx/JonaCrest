import { config } from "../config/config.js";

/**
 * Multi-Provider AI Service
 * Implements fallback chain: Gemini -> OpenRouter -> OpenAI
 */
class AIService {
  constructor() {
    this.geminiApiKey = config.geminiApiKey;
    this.openRouterApiKey = config.openRouterApiKey;
    this.openAIApiKey = config.openAIApiKey;
  }

  /**
   * Generate text using the AI fallback chain
   * @param {string} prompt - The prompt to send to the AI
   * @returns {Promise<string>} - The generated text response
   */
  async generateText(prompt) {
    // Try Gemini first
    if (this.geminiApiKey) {
      try {
        console.log('Attempting AI generation with Gemini...');
        const result = await this.generateWithGemini(prompt);
        if (result && !result.startsWith('Error:')) {
          console.log('Gemini generation successful');
          return result;
        }
      } catch (error) {
        console.warn('Gemini failed, trying OpenRouter:', error.message);
      }
    }

    // Fallback to OpenRouter
    if (this.openRouterApiKey) {
      try {
        console.log('Attempting AI generation with OpenRouter...');
        const result = await this.generateWithOpenRouter(prompt);
        if (result && !result.startsWith('Error:')) {
          console.log('OpenRouter generation successful');
          return result;
        }
      } catch (error) {
        console.warn('OpenRouter failed, trying OpenAI:', error.message);
      }
    }

    // Final fallback to OpenAI
    if (this.openAIApiKey) {
      try {
        console.log('Attempting AI generation with OpenAI...');
        const result = await this.generateWithOpenAI(prompt);
        if (result && !result.startsWith('Error:')) {
          console.log('OpenAI generation successful');
          return result;
        }
      } catch (error) {
        console.error('All AI providers failed:', error.message);
      }
    }

    return 'Error: All AI providers are currently unavailable. Please try again later.';
  }

  /**
   * Generate text using Google Gemini API
   */
  async generateWithGemini(prompt) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI real estate expert assistant that provides concise, accurate analysis of property data. ${prompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      console.log(`Gemini generation completed in ${(endTime - startTime) / 1000}s`);

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error('No content in Gemini response');
    } catch (error) {
      console.error('Gemini error:', error.message);
      throw error;
    }
  }

  /**
   * Generate text using OpenRouter API (OpenAI-compatible)
   */
  async generateWithOpenRouter(prompt) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'HTTP-Referer': 'https://jonacrest.com',
          'X-Title': 'Jona Crest Properties AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [
            {
              role: 'system',
              content: 'You are an AI real estate expert assistant that provides concise, accurate analysis of property data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      console.log(`OpenRouter generation completed in ${(endTime - startTime) / 1000}s`);

      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }

      throw new Error('No content in OpenRouter response');
    } catch (error) {
      console.error('OpenRouter error:', error.message);
      throw error;
    }
  }

  /**
   * Generate text using OpenAI API
   */
  async generateWithOpenAI(prompt) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI real estate expert assistant that provides concise, accurate analysis of property data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      console.log(`OpenAI generation completed in ${(endTime - startTime) / 1000}s`);

      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }

      throw new Error('No content in OpenAI response');
    } catch (error) {
      console.error('OpenAI error:', error.message);
      throw error;
    }
  }

  // Helper method to filter and clean property data before analysis
  _preparePropertyData(properties, maxProperties = 3) {
    const limitedProperties = properties.slice(0, maxProperties);
    
    return limitedProperties.map(property => ({
      building_name: property.building_name || property.title,
      property_type: property.property_type || property.type,
      location_address: property.location_address || property.location,
      price: property.price,
      area_sqft: property.area_sqft || property.sqft,
      amenities: Array.isArray(property.amenities) 
        ? property.amenities.slice(0, 5) 
        : [],
      description: property.description 
        ? property.description.substring(0, 150) + (property.description.length > 150 ? '...' : '')
        : ''
    }));
  }

  // Helper method to filter and clean location data
  _prepareLocationData(locations, maxLocations = 5) {
    return locations.slice(0, maxLocations);
  }

  async analyzeProperties(
    properties,
    city,
    maxPrice,
    propertyCategory,
    propertyType
  ) {
    const preparedProperties = this._preparePropertyData(properties);

    const prompt = `As a real estate expert, analyze these properties:

        Properties Found in ${city}:
        ${JSON.stringify(preparedProperties, null, 2)}

        INSTRUCTIONS:
        1. Focus ONLY on these properties that match:
           - Property Category: ${propertyCategory}
           - Property Type: ${propertyType}
           - Maximum Price: ${maxPrice} (in local currency)
        2. Provide a brief analysis with these sections:
           - Property Overview (basic facts about each)
           - Best Value Analysis (which offers the best value)
           - Quick Recommendations

        Keep your response concise and focused on these properties only.
        `;

    return this.generateText(prompt);
  }

  async analyzeLocationTrends(locations, city) {
    const preparedLocations = this._prepareLocationData(locations);

    const prompt = `As a real estate expert, analyze these location price trends for ${city}:

        ${JSON.stringify(preparedLocations, null, 2)}

        Please provide:
        1. A brief summary of price trends for each location
        2. Which areas are showing the highest appreciation
        3. Which areas offer the best rental yield
        4. Quick investment recommendations based on this data

        Keep your response concise (maximum 300 words).
        `;

    return this.generateText(prompt);
  }
}

export default new AIService();