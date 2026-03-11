/**
 * Script to fix isPaid status for test accounts
 * Run with: node scripts/fix_test_accounts.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate';

// User Schema (inline to avoid import issues)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String },
    isPaid: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

async function fixAccounts() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Update all test accounts to isPaid: true
        const testEmails = [
            'admin@jonacrest.com',
            'landlord@jonacrest.com',
            'agent@jonacrest.com',
            'user@jonacrest.com'
        ];

        console.log('\n📝 Updating isPaid status...\n');

        for (const email of testEmails) {
            const result = await User.updateOne(
                { email },
                { $set: { isPaid: true } }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`✅ ${email} - isPaid set to true`);
            } else if (result.matchedCount > 0) {
                console.log(`⚠️  ${email} - already isPaid: true`);
            } else {
                console.log(`❌ ${email} - not found`);
            }
        }

        // Verify the updates
        console.log('\n📋 VERIFICATION');
        console.log('='.repeat(60));
        
        for (const email of testEmails) {
            const user = await User.findOne({ email });
            if (user) {
                console.log(`| ${user.role.padEnd(8)} | ${user.email.padEnd(24)} | isPaid: ${user.isPaid} |`);
            }
        }

        console.log('='.repeat(60));
        console.log('\n✅ All accounts updated!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

fixAccounts();
