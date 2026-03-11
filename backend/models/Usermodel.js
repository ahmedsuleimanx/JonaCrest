import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' 
    },
    profileImage: { type: String },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
    isPaid: { type: Boolean, default: false },
    paymentReference: { type: String },
    paymentDate: { type: Date },
    // Profile fields
    bio: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    companyName: { type: String },
    agencyName: { type: String },
    licenseNumber: { type: String },
    image: { type: String },
    // Settings
    settings: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false },
        viewingReminders: { type: Boolean, default: true },
        priceAlerts: { type: Boolean, default: true },
        newListingAlerts: { type: Boolean, default: true },
        messageNotifications: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }
    },
    // Agent-specific fields
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

// Check if model already exists before creating (for hot reload)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;