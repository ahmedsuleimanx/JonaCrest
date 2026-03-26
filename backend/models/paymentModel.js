import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // What this payment is for
  referenceType: {
    type: String,
    enum: ['viewing', 'service_request'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Viewing', 'ServiceRequest'],
    required: true
  },
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'GHS'
  },
  description: {
    type: String,
    required: true
  },
  // Admin who requested payment
  requestedBy: {
    type: String, // admin email
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // Paystack transaction details
  paystackReference: {
    type: String,
    unique: true,
    sparse: true
  },
  paystackAccessCode: {
    type: String
  },
  paystackAuthorizationUrl: {
    type: String
  },
  // Verification details
  paidAt: {
    type: Date
  },
  paystackResponse: {
    type: mongoose.Schema.Types.Mixed // Store the full Paystack verification response
  },
  // Admin notes
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ paystackReference: 1 });
paymentSchema.index({ referenceId: 1, referenceType: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
