import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/Usermodel.js';

dotenv.config();

const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@jonacrest.com',
    password: 'admin123',
    phone: '+233501234567',
    role: 'admin',
    bio: 'System Administrator',
    city: 'Accra',
    country: 'Ghana'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    phone: '+233502345678',
    role: 'user',
    bio: 'Looking for a family home in Accra',
    city: 'Accra',
    country: 'Ghana'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    phone: '+233503456789',
    role: 'user',
    bio: 'Real estate investor interested in commercial properties',
    city: 'Kumasi',
    country: 'Ghana'
  },
  {
    name: 'Michael Brown',
    email: 'michael@example.com',
    password: 'user123',
    phone: '+233504567890',
    role: 'user',
    bio: 'First-time home buyer',
    city: 'Takoradi',
    country: 'Ghana',
    agentProfile: {
      licenseNumber: 'GRE-2024-001',
      agency: 'Prime Properties Ghana',
      specializations: ['Residential', 'Commercial'],
      yearsExperience: 5,
      bio: 'Experienced real estate agent specializing in residential and commercial properties',
      verified: true,
      totalListings: 15,
      totalSales: 8,
      rating: 4.5,
      reviewCount: 12
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'user123',
    phone: '+233505678901',
    role: 'user',
    bio: 'Looking for rental properties in Accra',
    city: 'Accra',
    country: 'Ghana'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing users');

    // Check if users already exist
    const existingEmails = await User.find({
      email: { $in: testUsers.map(u => u.email) }
    }).select('email');
    
    const existingEmailSet = new Set(existingEmails.map(u => u.email));
    const usersToCreate = testUsers.filter(u => !existingEmailSet.has(u.email));

    if (usersToCreate.length === 0) {
      console.log('ℹ️  All test users already exist');
      process.exit(0);
    }

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      usersToCreate.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    
    console.log(`✅ Created ${createdUsers.length} test users:`);
    console.log('\n📋 Test Credentials:');
    console.log('═'.repeat(50));
    
    usersToCreate.forEach((user) => {
      console.log(`\n${user.role === 'admin' ? '👑 ADMIN' : '👤 USER'}: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
    });
    
    console.log('\n' + '═'.repeat(50));
    console.log('\n✨ Seed complete! You can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
