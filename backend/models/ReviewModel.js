import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        required: true,
        enum: ['Product', 'User'] 
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Property', 'Landlord', 'Agent', 'Tenant', 'Service']
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Prevent multiple reviews from same user on same target
reviewSchema.index({ reviewerId: 1, targetId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
