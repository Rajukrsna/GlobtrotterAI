import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  highlights: { type: [String], required: true },
  estimatedCost: { type: Number, required: true },
  duration: { type: Number, required: true }, // Duration in days
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }   
  },
  matchScore: { type: Number, default: 0 }, // Score based on user preferences
})

export default mongoose.model('Destination', destinationSchema);