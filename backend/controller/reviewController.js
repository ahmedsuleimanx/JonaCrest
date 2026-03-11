import Review from '../models/ReviewModel.js';
import Product from '../models/propertymodel.js';
import User from '../models/Usermodel.js';

/**
 * Add a new review
 */
export const addReview = async (req, res) => {
    try {
        const { targetId, targetModel, targetType, rating, comment } = req.body;
        const reviewerId = req.user._id;

        // Prevent self-review (optional, mostly for landlords reviewing own properties/profile)
        // If reviewing a property, check owner? Maybe later.
        
        // Check if already reviewed
        const existingReview = await Review.findOne({ reviewerId, targetId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this.' });
        }

        const review = new Review({
            reviewerId,
            targetId,
            targetModel, 
            targetType,
            rating,
            comment
        });

        await review.save();

        // Populate reviewer details for immediate UI update
        await review.populate('reviewerId', 'name firstName lastName');

        res.status(201).json({ success: true, review, message: 'Review submitted successfully' });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
};

/**
 * Get reviews for a specific target (Property, Agent, etc)
 */
export const getReviews = async (req, res) => {
    try {
        const { targetId } = req.params;
        const { type } = req.query; // Optional filter by type

        const query = { targetId };
        if (type) query.targetType = type;

        const reviews = await Review.find(query)
            .populate('reviewerId', 'name firstName lastName image')
            .sort({ createdAt: -1 });

        // Calculate Stats
        const total = reviews.length;
        const average = total > 0 
            ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) 
            : 0;

        res.json({ success: true, reviews, stats: { total, average } });
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

/**
 * Delete a review (Admin or owner of review)
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Only allow author or admin to delete
        if (review.reviewerId.toString() !== userId.toString() && !isAdmin) {
             return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await review.deleteOne();

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
};
