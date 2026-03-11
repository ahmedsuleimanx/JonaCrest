import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icon: {
    type: String, // Store Lucide icon name or image URL
    required: true
  },
  category: {
    type: String,
    enum: ['Indoor', 'Outdoor', 'Security', 'Connectivity', 'Recreation', 'Other'],
    default: 'Other'
  },
  description: String
}, {
  timestamps: true
});

const Amenity = mongoose.model('Amenity', amenitySchema);

export default Amenity;
