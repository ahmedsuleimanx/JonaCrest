import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String, // Apartment, House, Villa, Office, Land
    required: true,
  },
  listingType: {
    type: String, // Rent, Sale
    enum: ['Rent', 'Sale'],
    default: 'Rent'
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'GHS' // or USD
  },
  location: {
    type: String, // General location string e.g. "East Legon, Accra"
    required: true,
  },
  address: {
    street: String,
    city: String,
    region: String,
    zipCode: String,
    ghanaPostGps: {
        type: String,
        trim: true,
        uppercase: true
    }
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  image: { 
    type: [String],
    required: true
  },
  videoUrl: { // Virtual Tour
    type: String 
  },
  beds: {
    type: Number,
    required: true,
  },
  baths: {
    type: Number,
    required: true,
  },
  sqft: {
    type: Number,
    required: true,
  },
  availability: {
    type: String,
    enum: ['Available', 'Sold', 'Rented', 'Pending'],
    default: 'Available',
    required: true,
  },
  amenities: [{
      type: String // We will store amenity names for simplicity in MVP, or ObjectId refs later
  }],
  furnished: {
      type: Boolean,
      default: false
  },
  ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true // Make required after migration
  },
  verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
  },
  phone: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
    timestamps: true
});

// Add index for search
propertySchema.index({ title: 'text', description: 'text', location: 'text' });
propertySchema.index({ 'address.ghanaPostGps': 1 });

const Property = mongoose.model("Property", propertySchema);

export default Property;
