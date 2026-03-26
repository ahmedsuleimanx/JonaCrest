import https from 'https';
import crypto from 'crypto';
import User from '../models/Usermodel.js';
import Payment from '../models/paymentModel.js';
import Viewing from '../models/viewingModel.js';
import ServiceRequest from '../models/serviceRequestModel.js';
import { createNotificationHelper } from './notificationController.js';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.WEBSITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to make Paystack API calls
const paystackRequest = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path,
            method,
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse Paystack response'));
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

// Admin requests payment from a user for a viewing or service request
export const requestPayment = async (req, res) => {
    try {
        const { userId, referenceType, referenceId, amount, description, adminNotes } = req.body;

        if (!userId || !referenceType || !referenceId || !amount) {
            return res.status(400).json({ success: false, message: 'userId, referenceType, referenceId, and amount are required' });
        }

        if (!['viewing', 'service_request'].includes(referenceType)) {
            return res.status(400).json({ success: false, message: 'referenceType must be viewing or service_request' });
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        // Verify the referenced entity exists
        let reference;
        const referenceModel = referenceType === 'viewing' ? 'Viewing' : 'ServiceRequest';
        if (referenceType === 'viewing') {
            reference = await Viewing.findById(referenceId);
        } else {
            reference = await ServiceRequest.findById(referenceId);
        }

        if (!reference) {
            return res.status(404).json({ success: false, message: `${referenceType} not found` });
        }

        // Check if there's already a pending payment for this reference
        const existingPayment = await Payment.findOne({
            referenceId,
            referenceType,
            status: 'pending'
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'There is already a pending payment request for this item',
                payment: existingPayment
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const payment = new Payment({
            userId,
            referenceType,
            referenceId,
            referenceModel,
            amount,
            description: description || `Payment for ${referenceType.replace('_', ' ')}`,
            requestedBy: req.admin?.email || 'admin',
            adminNotes: adminNotes || ''
        });

        await payment.save();

        // Notify the user about the payment request
        try {
            await createNotificationHelper(
                userId,
                'payment_request',
                'Payment Required',
                `A payment of GHS ${amount.toFixed(2)} has been requested for your ${referenceType.replace('_', ' ')}. ${description || ''}`,
                { paymentId: payment._id, amount, referenceType },
                '/dashboard/payments'
            );
        } catch (notifError) {
            console.error('Failed to create payment notification:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Payment request created successfully',
            payment
        });
    } catch (error) {
        console.error('Error creating payment request:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get user's payments
export const getUserPayments = async (req, res) => {
    try {
        const userId = req.user._id;
        const payments = await Payment.find({ userId })
            .populate('referenceId')
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching user payments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get payments for a specific reference (viewing or service request)
export const getPaymentsForReference = async (req, res) => {
    try {
        const { referenceType, referenceId } = req.params;
        const payments = await Payment.find({ referenceType, referenceId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching reference payments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Initialize Paystack payment for a specific payment request
export const initializePayment = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const userId = req.user._id;

        const payment = await Payment.findOne({ _id: paymentId, userId, status: 'pending' });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment request not found or already processed' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const paystackRef = `JCP-${payment._id}-${Date.now()}`;

        const result = await paystackRequest('/transaction/initialize', 'POST', {
            email: user.email,
            amount: Math.round(payment.amount * 100), // Convert to pesewas
            currency: payment.currency || 'GHS',
            reference: paystackRef,
            callback_url: `${FRONTEND_URL}/payment/callback`,
            metadata: {
                paymentId: payment._id.toString(),
                userId: userId.toString(),
                referenceType: payment.referenceType,
                referenceId: payment.referenceId.toString(),
                custom_fields: [
                    {
                        display_name: 'Payment For',
                        variable_name: 'payment_for',
                        value: payment.description
                    }
                ]
            }
        });

        if (result.status) {
            // Update payment with Paystack details
            payment.paystackReference = paystackRef;
            payment.paystackAccessCode = result.data.access_code;
            payment.paystackAuthorizationUrl = result.data.authorization_url;
            await payment.save();

            res.status(200).json({
                success: true,
                authorization_url: result.data.authorization_url,
                access_code: result.data.access_code,
                reference: paystackRef
            });
        } else {
            res.status(400).json({ success: false, message: result.message || 'Payment initialization failed' });
        }
    } catch (error) {
        console.error('Error initializing payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Verify Paystack payment
export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({ success: false, message: 'Reference is required' });
        }

        const result = await paystackRequest(`/transaction/verify/${reference}`);

        if (result.status && result.data.status === 'success') {
            // Find the payment by Paystack reference
            const payment = await Payment.findOne({ paystackReference: reference });

            if (payment && payment.status !== 'paid') {
                payment.status = 'paid';
                payment.paidAt = new Date();
                payment.paystackResponse = result.data;
                await payment.save();

                // Notify the user
                try {
                    await createNotificationHelper(
                        payment.userId,
                        'payment_success',
                        'Payment Successful',
                        `Your payment of GHS ${payment.amount.toFixed(2)} has been confirmed. Thank you!`,
                        { paymentId: payment._id },
                        '/dashboard/payments'
                    );
                } catch (notifError) {
                    console.error('Failed to create payment success notification:', notifError);
                }
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: result.data,
                payment
            });
        } else {
            // Update payment status to failed if found
            const payment = await Payment.findOne({ paystackReference: reference });
            if (payment && payment.status === 'pending') {
                payment.status = 'failed';
                payment.paystackResponse = result.data;
                await payment.save();
            }

            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Paystack Webhook handler
export const paystackWebhook = async (req, res) => {
    try {
        // Verify the webhook signature
        const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(401).json({ success: false, message: 'Invalid signature' });
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const { reference } = event.data;
            const payment = await Payment.findOne({ paystackReference: reference });

            if (payment && payment.status !== 'paid') {
                payment.status = 'paid';
                payment.paidAt = new Date();
                payment.paystackResponse = event.data;
                await payment.save();

                // Notify the user
                try {
                    await createNotificationHelper(
                        payment.userId,
                        'payment_success',
                        'Payment Successful',
                        `Your payment of GHS ${payment.amount.toFixed(2)} has been confirmed.`,
                        { paymentId: payment._id },
                        '/dashboard/payments'
                    );
                } catch (notifError) {
                    console.error('Webhook notification error:', notifError);
                }
            }
        }

        // Acknowledge receipt
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false });
    }
};

// Cancel a payment request (admin)
export const cancelPaymentRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending payments can be cancelled' });
        }

        payment.status = 'cancelled';
        await payment.save();

        // Notify the user
        try {
            await createNotificationHelper(
                payment.userId,
                'payment_cancelled',
                'Payment Cancelled',
                `The payment request of GHS ${payment.amount.toFixed(2)} has been cancelled.`,
                { paymentId: payment._id },
                '/dashboard/payments'
            );
        } catch (notifError) {
            console.error('Cancel notification error:', notifError);
        }

        res.json({ success: true, message: 'Payment request cancelled', payment });
    } catch (error) {
        console.error('Error cancelling payment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
