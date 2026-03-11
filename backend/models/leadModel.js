import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    interest: {
        type: String,
        enum: ['Buying', 'Renting', 'Selling', 'Investing'],
        default: 'Buying'
    },
    propertyType: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['New', 'Hot', 'Warm', 'Cold', 'Converted', 'Lost'],
        default: 'New'
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    budget: {
        min: { type: Number },
        max: { type: Number }
    },
    notes: {
        type: String
    },
    source: {
        type: String,
        enum: ['Website', 'Referral', 'Walk-in', 'Social Media', 'Phone', 'Other'],
        default: 'Website'
    },
    lastContactDate: {
        type: Date
    },
    nextFollowUp: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
leadSchema.index({ agentId: 1, status: 1 });
leadSchema.index({ agentId: 1, createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
