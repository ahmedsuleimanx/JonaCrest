import ImageKit from 'imagekit';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Check if ImageKit is properly configured
const isImageKitConfigured = 
  process.env.IMAGEKIT_PUBLIC_KEY && 
  process.env.IMAGEKIT_PRIVATE_KEY && 
  process.env.IMAGEKIT_URL_ENDPOINT &&
  !process.env.IMAGEKIT_PUBLIC_KEY.includes('placeholder');

let imagekit = null;

if (isImageKitConfigured) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  console.log("✅ ImageKit connected successfully!");
} else {
  console.log("⚠️ ImageKit not configured - image uploads will not work. Set IMAGEKIT_* env vars.");
}

export default imagekit;