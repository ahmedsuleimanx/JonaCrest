/**
 * Database Seed Script for Jona Crest Properties
 * Creates sample users, properties, and related data
 * 
 * Run with: node seedDatabase.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from './models/Usermodel.js';
import Property from './models/propertymodel.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jona_crest_db';

// Sample Users Data
const users = [
  {
    name: 'Admin User',
    email: 'admin@jonacrest.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '+233201234567',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'John Landlord',
    email: 'landlord@jonacrest.com',
    password: 'Landlord@123',
    role: 'landlord',
    phone: '+233209876543',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'Jane Tenant',
    email: 'tenant@jonacrest.com',
    password: 'Tenant@123',
    role: 'tenant',
    phone: '+233205551234',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
  }
];

// Sample Properties Data with CDN images from Unsplash
const properties = [
  {
    title: 'Luxury Villa in East Legon',
    description: 'A stunning 5-bedroom luxury villa with modern amenities, private pool, and landscaped gardens. This property features premium finishes, smart home technology, and 24/7 security. Perfect for executive families seeking comfort and prestige in one of Accra\'s most sought-after neighborhoods.',
    type: 'Villa',
    listingType: 'Sale',
    price: 2500000,
    currency: 'GHS',
    location: 'East Legon, Accra',
    address: {
      street: '15 Ambassadorial Enclave',
      city: 'Accra',
      region: 'Greater Accra',
      zipCode: 'GA-123',
      ghanaPostGps: 'GA-456-7890'
    },
    coordinates: { lat: 5.6388, lng: -0.1569 },
    image: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
    ],
    beds: 5,
    baths: 4,
    sqft: 4500,
    availability: 'Available',
    amenities: ['Swimming Pool', 'Garden', 'Garage', 'Security', 'Smart Home', 'Air Conditioning'],
    furnished: true,
    verificationStatus: 'verified',
    phone: '+233201234567',
    featured: true
  },
  {
    title: 'Modern Apartment in Cantonments',
    description: 'A beautifully designed 3-bedroom apartment in the heart of Cantonments. Features open-plan living, modern kitchen, balcony with city views, and access to communal gym and pool. Ideal for young professionals and small families.',
    type: 'Apartment',
    listingType: 'Rent',
    price: 8500,
    currency: 'GHS',
    location: 'Cantonments, Accra',
    address: {
      street: '22 Senchi Street',
      city: 'Accra',
      region: 'Greater Accra',
      zipCode: 'GA-234',
      ghanaPostGps: 'GA-567-8901'
    },
    coordinates: { lat: 5.5790, lng: -0.1719 },
    image: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80'
    ],
    beds: 3,
    baths: 2,
    sqft: 1800,
    availability: 'Available',
    amenities: ['Gym', 'Pool', 'Balcony', 'Parking', 'Air Conditioning', 'Security'],
    furnished: true,
    verificationStatus: 'verified',
    phone: '+233209876543',
    featured: true
  },
  {
    title: 'Family House in Airport Residential',
    description: 'Spacious 4-bedroom family home in the prestigious Airport Residential area. Features large living areas, mature gardens, boys\' quarters, and ample parking. Close to international schools and embassies.',
    type: 'House',
    listingType: 'Sale',
    price: 1800000,
    currency: 'GHS',
    location: 'Airport Residential, Accra',
    address: {
      street: '8 Independence Avenue',
      city: 'Accra',
      region: 'Greater Accra',
      zipCode: 'GA-345',
      ghanaPostGps: 'GA-678-9012'
    },
    coordinates: { lat: 5.5988, lng: -0.1769 },
    image: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'
    ],
    beds: 4,
    baths: 3,
    sqft: 3200,
    availability: 'Available',
    amenities: ['Garden', 'Garage', 'Boys Quarters', 'Security', 'Air Conditioning'],
    furnished: false,
    verificationStatus: 'verified',
    phone: '+233201234567',
    featured: true
  },
  {
    title: 'Cozy Studio in Osu',
    description: 'A modern studio apartment perfect for singles or couples. Located in vibrant Osu, close to restaurants, shops, and nightlife. Features kitchenette, modern bathroom, and secured parking.',
    type: 'Apartment',
    listingType: 'Rent',
    price: 3500,
    currency: 'GHS',
    location: 'Osu, Accra',
    address: {
      street: '45 Oxford Street',
      city: 'Accra',
      region: 'Greater Accra',
      zipCode: 'GA-456',
      ghanaPostGps: 'GA-789-0123'
    },
    coordinates: { lat: 5.5560, lng: -0.1820 },
    image: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800&q=80'
    ],
    beds: 1,
    baths: 1,
    sqft: 550,
    availability: 'Available',
    amenities: ['Parking', 'Security', 'Air Conditioning', 'WiFi'],
    furnished: true,
    verificationStatus: 'verified',
    phone: '+233209876543',
    featured: false
  },
  {
    title: 'Penthouse in Ridge',
    description: 'Luxurious penthouse with panoramic views of Accra. Features 4 bedrooms, rooftop terrace, private elevator access, high-end finishes, and concierge service. The epitome of luxury living.',
    type: 'Apartment',
    listingType: 'Sale',
    price: 3200000,
    currency: 'GHS',
    location: 'Ridge, Accra',
    address: {
      street: '1 Castle Road',
      city: 'Accra',
      region: 'Greater Accra',
      zipCode: 'GA-567',
      ghanaPostGps: 'GA-890-1234'
    },
    coordinates: { lat: 5.5668, lng: -0.2010 },
    image: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
      'https://images.unsplash.com/photo-1600566752547-33b47b64e8bf?w=800&q=80'
    ],
    beds: 4,
    baths: 4,
    sqft: 3800,
    availability: 'Available',
    amenities: ['Rooftop Terrace', 'Private Elevator', 'Concierge', 'Gym', 'Pool', 'Air Conditioning', 'Smart Home'],
    furnished: true,
    verificationStatus: 'verified',
    phone: '+233201234567',
    featured: true
  },
  {
    title: 'Townhouse in Labone',
    description: 'Contemporary 3-bedroom townhouse in quiet Labone neighborhood. Features open-plan living, private courtyard, rooftop deck, and attached garage. Perfect blend of modern design and comfortable living.',
    type: 'House',
    listingType: 'Rent',
    price: 12000,
    currency: 'GHS',
    location: 'Labone, Accra',
    address: {
      street: '33 Labone Crescent',
      city: 'Accra',
      region: 'Greater Accra',
      zipCode: 'GA-678',
      ghanaPostGps: 'GA-901-2345'
    },
    coordinates: { lat: 5.5645, lng: -0.1650 },
    image: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80'
    ],
    beds: 3,
    baths: 3,
    sqft: 2400,
    availability: 'Available',
    amenities: ['Courtyard', 'Rooftop Deck', 'Garage', 'Security', 'Air Conditioning'],
    furnished: false,
    verificationStatus: 'verified',
    phone: '+233209876543',
    featured: false
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    console.log(`📦 Connecting to MongoDB: ${MONGO_URI}`);
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users with hashed passwords
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
      console.log(`   ✅ Created ${user.role}: ${user.email}`);
    }

    // Get landlord user for property ownership
    const landlordUser = createdUsers.find(u => u.role === 'landlord');

    // Create properties
    console.log('🏠 Creating properties...');
    for (const property of properties) {
      await Property.create({
        ...property,
        ownerId: landlordUser._id
      });
      console.log(`   ✅ Created: ${property.title}`);
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('🎉 Database seeded successfully!');
    console.log('='.repeat(50));
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Properties: ${properties.length}`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Admin:    admin@jonacrest.com / Admin@123');
    console.log('   Landlord: landlord@jonacrest.com / Landlord@123');
    console.log('   Tenant:   tenant@jonacrest.com / Tenant@123');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
