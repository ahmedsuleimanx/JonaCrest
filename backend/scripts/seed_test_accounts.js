/**
 * Seed Script: Create Test Accounts
 * Run with: node scripts/seed_test_accounts.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jona_crest_db';

// User Schema (inline to avoid import issues)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { 
        type: String, 
        enum: ['admin', 'landlord', 'tenant', 'agent'], 
        default: 'tenant' 
    },
    profileImage: { type: String },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
    isPaid: { type: Boolean, default: false },
    paymentReference: { type: String },
    paymentDate: { type: Date },
    agentProfile: {
        licenseNumber: { type: String },
        agency: { type: String },
        specializations: [{ type: String }],
        yearsExperience: { type: Number },
        bio: { type: String },
        verified: { type: Boolean, default: false },
        totalListings: { type: Number, default: 0 },
        totalSales: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Test accounts to create
const testAccounts = [
    {
        name: 'Admin User',
        email: 'admin@jonacrest.com',
        password: 'Admin@123',
        phone: '0548000001',
        role: 'admin',
        isPaid: true
    },
    {
        name: 'Test Landlord',
        email: 'landlord@jonacrest.com',
        password: 'Landlord@123',
        phone: '0548000002',
        role: 'landlord',
        isPaid: true,
        paymentReference: 'TEST_LANDLORD_PAID',
        paymentDate: new Date()
    },
    {
        name: 'Test Agent',
        email: 'agent@jonacrest.com',
        password: 'Agent@123',
        phone: '0548000003',
        role: 'agent',
        isPaid: true,
        paymentReference: 'TEST_AGENT_PAID',
        paymentDate: new Date(),
        agentProfile: {
            licenseNumber: 'GH-RE-2024-001',
            agency: 'Jona Crest Realty',
            specializations: ['Residential', 'Commercial', 'Luxury'],
            yearsExperience: 5,
            bio: 'Experienced real estate agent specializing in premium properties in Accra.',
            verified: true,
            totalListings: 12,
            totalSales: 23,
            rating: 4.8,
            reviewCount: 32
        }
    },
    {
        name: 'Test User',
        email: 'user@jonacrest.com',
        password: 'User@123',
        phone: '0548000004',
        role: 'tenant',
        isPaid: true // Users are free, so isPaid is true
    }
];

async function seedAccounts() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n📝 Creating test accounts...\n');

        for (const account of testAccounts) {
            // Check if account already exists
            const existingUser = await User.findOne({ email: account.email });
            
            if (existingUser) {
                console.log(`⚠️  ${account.role.toUpperCase()}: ${account.email} already exists - skipping`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(account.password, 10);

            // Create user
            const newUser = new User({
                ...account,
                password: hashedPassword
            });

            await newUser.save();
            console.log(`✅ ${account.role.toUpperCase()}: ${account.email} created successfully`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('📋 TEST ACCOUNTS SUMMARY');
        console.log('='.repeat(60));
        console.log('\n| Role     | Email                    | Password      |');
        console.log('|----------|--------------------------|---------------|');
        for (const account of testAccounts) {
            console.log(`| ${account.role.padEnd(8)} | ${account.email.padEnd(24)} | ${account.password.padEnd(13)} |`);
        }
        console.log('\n✅ All test accounts ready!');
        console.log('\n💡 Login at: http://localhost:5173/login');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

seedAccounts();
