import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
    // Note: ticketNumber is auto-generated in pre-save hook, not required from input
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['issue', 'moderation', 'inquiry', 'complaint', 'feature_request', 'property_dispute'],
    default: 'issue'
  },
  category: {
    type: String,
    enum: ['property', 'payment', 'account', 'technical', 'listing', 'tenant', 'landlord', 'agent', 'other'],
    default: 'other'
  },
  subject: {
    type: String,
    required: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 5000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isAdminResponse: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: String,
      url: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date,
  closedAt: Date,
  lastResponseAt: Date,
  tags: [String]
}, { timestamps: true });

// Generate ticket number before saving
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `JCP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient queries
ticketSchema.index({ creator: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ assignedTo: 1 });
// Note: ticketNumber index is already created by 'unique: true' in schema definition

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
