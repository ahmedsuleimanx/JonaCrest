import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export const config = {
    port: process.env.PORT || 4000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    
    // AI Providers (Gemini -> OpenRouter -> OpenAI fallback chain)
    geminiApiKey: process.env.GEMINI_API_KEY,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    openAIApiKey: process.env.OPENAI_API_KEY,
    
    // Legacy AI config (keeping for backwards compatibility)
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    modelId: process.env.MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.2',
    azureApiKey: process.env.AZURE_API_KEY,
    useAzure: process.env.USE_AZURE === 'true',
    
    // Cloudinary
    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    
    // ImageKit
    imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
};
