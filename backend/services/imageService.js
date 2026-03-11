/**
 * Image Upload Service
 * Handles image uploads with Cloudinary (primary) and ImageKit (fallback)
 * Includes optimization for fast loading
 */

import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinaryName || 'drczdu4oh',
  api_key: config.cloudinaryApiKey || '582492697642747',
  api_secret: config.cloudinaryApiSecret || 'JA3k7XVEBHMMPfY2j5xh0l7qsE0'
});

class ImageService {
  constructor() {
    this.cloudinaryConfigured = !!(config.cloudinaryName && config.cloudinaryApiKey);
    this.imagekitConfigured = !!(config.imagekitPrivateKey && config.imagekitUrlEndpoint);
  }

  /**
   * Upload image with optimization
   * @param {Buffer|string} imageSource - Image buffer or base64 string
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result with optimized URL
   */
  async uploadImage(imageSource, options = {}) {
    const {
      folder = 'properties',
      transformation = {},
      useFilename = true,
      uniqueFilename = true
    } = options;

    // Try Cloudinary first
    try {
      console.log('Attempting image upload with Cloudinary...');
      const result = await this.uploadToCloudinary(imageSource, {
        folder,
        transformation,
        useFilename,
        uniqueFilename
      });
      console.log('Cloudinary upload successful');
      return result;
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed:', cloudinaryError.message);
      
      // Fallback to ImageKit
      if (this.imagekitConfigured) {
        try {
          console.log('Attempting image upload with ImageKit...');
          const result = await this.uploadToImageKit(imageSource, {
            folder,
            useFilename
          });
          console.log('ImageKit upload successful');
          return result;
        } catch (imagekitError) {
          console.error('ImageKit upload failed:', imagekitError.message);
          throw new Error(`All image providers failed. Last error: ${imagekitError.message}`);
        }
      }
      
      throw cloudinaryError;
    }
  }

  /**
   * Upload to Cloudinary with optimization
   */
  async uploadToCloudinary(imageSource, options) {
    const uploadOptions = {
      folder: `jona_crest/${options.folder}`,
      use_filename: options.useFilename,
      unique_filename: options.uniqueFilename,
      overwrite: false,
      resource_type: 'image',
      // Optimization transformations
      transformation: [
        {
          quality: 'auto:good',
          fetch_format: 'auto',
          ...options.transformation
        }
      ],
      // Generate responsive breakpoints
      responsive_breakpoints: {
        create_derived: true,
        bytes_step: 20000,
        min_width: 200,
        max_width: 1000,
        max_images: 3
      }
    };

    // Handle base64 or buffer
    let uploadSource = imageSource;
    if (Buffer.isBuffer(imageSource)) {
      uploadSource = `data:image/jpeg;base64,${imageSource.toString('base64')}`;
    } else if (typeof imageSource === 'string' && !imageSource.startsWith('data:') && !imageSource.startsWith('http')) {
      uploadSource = `data:image/jpeg;base64,${imageSource}`;
    }

    const result = await cloudinary.uploader.upload(uploadSource, uploadOptions);

    return {
      success: true,
      provider: 'cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      // Optimized URLs for different sizes
      thumbnailUrl: this.getCloudinaryOptimizedUrl(result.public_id, { width: 150, height: 150, crop: 'fill' }),
      smallUrl: this.getCloudinaryOptimizedUrl(result.public_id, { width: 400 }),
      mediumUrl: this.getCloudinaryOptimizedUrl(result.public_id, { width: 800 }),
      largeUrl: this.getCloudinaryOptimizedUrl(result.public_id, { width: 1200 })
    };
  }

  /**
   * Get optimized Cloudinary URL with transformations
   */
  getCloudinaryOptimizedUrl(publicId, transformations = {}) {
    const { width, height, crop = 'limit', quality = 'auto:good' } = transformations;
    
    let transform = `q_${quality},f_auto`;
    if (width) transform += `,w_${width}`;
    if (height) transform += `,h_${height}`;
    if (crop) transform += `,c_${crop}`;

    return `https://res.cloudinary.com/${config.cloudinaryName || 'drczdu4oh'}/image/upload/${transform}/${publicId}`;
  }

  /**
   * Upload to ImageKit as fallback
   */
  async uploadToImageKit(imageSource, options) {
    const ImageKit = (await import('imagekit')).default;
    
    const imagekit = new ImageKit({
      publicKey: config.imagekitPublicKey,
      privateKey: config.imagekitPrivateKey,
      urlEndpoint: config.imagekitUrlEndpoint
    });

    // Handle different input types
    let file = imageSource;
    let fileName = `image_${Date.now()}`;
    
    if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
      // URL-based upload
      const response = await imagekit.upload({
        file: imageSource,
        fileName: fileName,
        folder: `jona_crest/${options.folder}`,
        useUniqueFileName: true
      });
      
      return this.formatImageKitResult(response);
    }

    // Buffer or base64 upload
    if (Buffer.isBuffer(imageSource)) {
      file = imageSource.toString('base64');
    }

    const result = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: `jona_crest/${options.folder}`,
      useUniqueFileName: true
    });

    return this.formatImageKitResult(result);
  }

  /**
   * Format ImageKit result to match our standard structure
   */
  formatImageKitResult(result) {
    const baseUrl = result.url;
    
    return {
      success: true,
      provider: 'imagekit',
      url: baseUrl,
      publicId: result.fileId,
      width: result.width,
      height: result.height,
      format: result.fileType,
      bytes: result.size,
      // ImageKit transformation URLs
      thumbnailUrl: this.getImageKitOptimizedUrl(baseUrl, { width: 150, height: 150 }),
      smallUrl: this.getImageKitOptimizedUrl(baseUrl, { width: 400 }),
      mediumUrl: this.getImageKitOptimizedUrl(baseUrl, { width: 800 }),
      largeUrl: this.getImageKitOptimizedUrl(baseUrl, { width: 1200 })
    };
  }

  /**
   * Get optimized ImageKit URL
   */
  getImageKitOptimizedUrl(url, transformations = {}) {
    const { width, height } = transformations;
    let transform = 'tr=f-auto,q-80';
    if (width) transform += `,w-${width}`;
    if (height) transform += `,h-${height}`;
    
    // Insert transformation before the file path
    const urlParts = url.split('/');
    const endpoint = urlParts.slice(0, 4).join('/');
    const path = urlParts.slice(4).join('/');
    
    return `${endpoint}/${transform}/${path}`;
  }

  /**
   * Delete image from provider
   */
  async deleteImage(publicId, provider = 'cloudinary') {
    try {
      if (provider === 'cloudinary') {
        await cloudinary.uploader.destroy(publicId);
        return { success: true, message: 'Image deleted from Cloudinary' };
      } else if (provider === 'imagekit') {
        const ImageKit = (await import('imagekit')).default;
        const imagekit = new ImageKit({
          publicKey: config.imagekitPublicKey,
          privateKey: config.imagekitPrivateKey,
          urlEndpoint: config.imagekitUrlEndpoint
        });
        await imagekit.deleteFile(publicId);
        return { success: true, message: 'Image deleted from ImageKit' };
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate placeholder blur hash for loading states
   */
  getPlaceholderUrl(width = 20, height = 20) {
    // Return a tiny blurred placeholder
    return `https://res.cloudinary.com/${config.cloudinaryName || 'drczdu4oh'}/image/upload/w_${width},h_${height},e_blur:1000,q_1/v1/placeholder`;
  }
}

export default new ImageService();
