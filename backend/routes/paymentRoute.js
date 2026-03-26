import express from 'express';
import {
    requestPayment,
    getAllPayments,
    getUserPayments,
    getPaymentsForReference,
    initializePayment,
    verifyPayment,
    paystackWebhook,
    cancelPaymentRequest
} from '../controller/paymentController.js';
import authMiddleware from '../middleware/authmiddleware.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Admin routes
router.post('/request', adminAuth, requestPayment);
router.get('/all', adminAuth, getAllPayments);
router.get('/reference/:referenceType/:referenceId', adminAuth, getPaymentsForReference);
router.put('/cancel/:id', adminAuth, cancelPaymentRequest);

// User routes
router.post('/initialize', authMiddleware, initializePayment);
router.get('/my-payments', authMiddleware, getUserPayments);
router.get('/verify/:reference', verifyPayment);

// Webhook (no auth - Paystack signs with HMAC)
router.post('/webhook', paystackWebhook);

export default router;
