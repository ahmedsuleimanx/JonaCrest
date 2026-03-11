import express from 'express';
import { addReview, getReviews, deleteReview } from '../controller/reviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get reviews for a target
router.get('/:targetId', getReviews);

// Protected: Add a review
router.post('/add', authMiddleware, addReview);

// Protected: Delete a review
router.delete('/:id', authMiddleware, deleteReview);

export default router;
