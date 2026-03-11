import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Send, Loader2, MessageSquare, Trash2, User } from 'lucide-react';
import axios from 'axios';
import { Backendurl } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Reusable Review Section
 * @param {string} targetId - ID of the entity being reviewed (Property ID, User ID)
 * @param {string} targetType - 'Property', 'Landlord', 'Agent', etc.
 * @param {string} targetModel - 'Product' or 'User' (Mongoose Ref)
 */
const ReviewSection = ({ targetId, targetType = 'Property', targetModel = 'Product' }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, average: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // New Review Form State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if(targetId) fetchReviews();
    }, [targetId]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${Backendurl}/api/reviews/${targetId}?type=${targetType}`);
            if (response.data.success) {
                setReviews(response.data.reviews);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to write a review");
            return;
        }
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                targetId,
                targetModel,
                targetType,
                rating,
                comment
            };
            
            const response = await axios.post(`${Backendurl}/api/reviews/add`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                toast.success("Review submitted!");
                setReviews([response.data.review, ...reviews]); // Add to top
                setRating(0);
                setComment('');
                
                // Simplified stat update (optimal would be re-fetch or calc)
                fetchReviews(); // Re-fetch to get correct averages
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        
        try {
            await axios.delete(`${Backendurl}/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setReviews(reviews.filter(r => r._id !== reviewId));
            toast.success("Review deleted");
            // Optionally re-fetch for stats
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                Reviews & Ratings
                {stats.total > 0 && (
                    <span className="text-base font-medium px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" /> {stats.average} / 5
                    </span>
                )}
            </h3>

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Write a Review</h4>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-500 mb-2">Rating</label>
                        <StarRating rating={rating} setRating={setRating} size="lg" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-500 mb-2">Your Experience</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white hover:border-teal-300"
                            rows="3"
                            placeholder="Share your thoughts..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Submit Review
                    </button>
                </form>
            ) : (
                <div className="mb-10 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-between">
                    <p className="text-teal-800 dark:text-teal-200 font-medium">Please login to write a review</p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                         {reviews.map((review) => (
                             <motion.div 
                                key={review._id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0"
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                             {review.reviewerId?.image ? (
                                                 <img src={review.reviewerId.image} className="w-full h-full object-cover" alt="User" />
                                             ) : (
                                                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                     <User className="w-5 h-5" />
                                                 </div>
                                             )}
                                         </div>
                                         <div>
                                             <h5 className="font-bold text-gray-900 dark:text-white text-sm hover:text-emerald-600 transition-colors">
                                                 <Link to={`/user/${review.reviewerId?._id}`}>
                                                     {review.reviewerId?.name || review.reviewerId?.firstName || 'Anonymous'}
                                                 </Link>
                                             </h5>
                                             <div className="flex items-center gap-2 text-xs text-gray-500">
                                                 <StarRating rating={review.rating} readOnly size="sm" />
                                                 <span>• {new Date(review.createdAt).toLocaleDateString()}</span>
                                             </div>
                                         </div>
                                     </div>
                                     
                                     {/* Delete Action (Admin or Owner) */}
                                     {(user && (user.role === 'admin' || user._id === review.reviewerId?._id)) && (
                                         <button 
                                            onClick={() => handleDelete(review._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                         >
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                     )}
                                 </div>
                                 <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-2 pl-12">
                                     {review.comment}
                                 </p>
                             </motion.div>
                         ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
