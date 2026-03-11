import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Moving', 'Cleaning', 'Maintenance', 'Legal', 'Inspection', 'Property Viewing', 'Renting', 'Purchasing', 'Other'],
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property' // Optional, if related to a specific property listing
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    gpsAddress: String // GhanaPostGPS
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'GHS'
    }
  },
  contactPhone: String
}, {
  timestamps: true
});

serviceRequestSchema.index({ userId: 1, status: 1 });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;
