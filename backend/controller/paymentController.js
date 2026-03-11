import https from 'https';
import User from '../models/Usermodel.js';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const initializePayment = async (req, res) => {
    try {
        const { email, amount } = req.body;

        if (!email || !amount) {
            return res.status(400).json({ success: false, message: 'Email and amount are required' });
        }

        const params = JSON.stringify({
            email: email,
            amount: amount * 100, // Paystack expects amount in pesewas
            currency: 'GHS',
            callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`
        });

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const request = https.request(options, response => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const result = JSON.parse(data);
                if (result.status) {
                    res.status(200).json({ success: true, authorization_url: result.data.authorization_url, reference: result.data.reference });
                } else {
                    res.status(400).json({ success: false, message: result.message });
                }
            });
        });

        request.on('error', error => {
            console.error(error);
            res.status(500).json({ success: false, message: 'Payment initialization failed' });
        });

        request.write(params);
        request.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params; // Or req.query depending on flow

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${reference}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        };

        const request = https.request(options, response => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', async () => {
                const result = JSON.parse(data);
                if (result.status && result.data.status === 'success') {
                    // Update user
                    const userEmail = result.data.customer.email;
                    const user = await User.findOne({ email: userEmail });
                    
                    if (user) {
                        user.isPaid = true;
                        user.paymentReference = reference;
                        user.paymentDate = new Date();
                        await user.save();
                        
                        res.status(200).json({ success: true, message: 'Payment verified successfully', data: result.data });
                    } else {
                         // Fallback if email doesn't match a user directly (maybe store reference via userId if passed in metadata)
                         res.status(200).json({ success: true, message: 'Payment verified but user not found by email', data: result.data });
                    }

                } else {
                    res.status(400).json({ success: false, message: 'Payment verification failed' });
                }
            });
        });

        request.on('error', error => {
            console.error(error);
            res.status(500).json({ success: false, message: 'Payment verification failed (network)' });
        });

        request.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
