import mongoose from 'mongoose';

const viewingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Can be an agent or landlord
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true // e.g., "10:00 AM - 10:30 AM"
  },
  type: {
    type: String,
    enum: ['In-Person', 'Virtual'],
    default: 'In-Person'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'pending'
  },
  meetingLink: {
    type: String, // For virtual tours
    trim: true
  },
  notes: {
    type: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
}, {
  timestamps: true
});

// Indexes for query optimization
viewingSchema.index({ userId: 1, date: -1 });
viewingSchema.index({ propertyId: 1, date: -1 });
viewingSchema.index({ agentId: 1, date: -1 });

const Viewing = mongoose.model('Viewing', viewingSchema);

export default Viewing;
