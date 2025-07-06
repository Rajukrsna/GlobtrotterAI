import mongoose from 'mongoose';    

const CoordinatesSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const ActivitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: { type: CoordinatesSchema, required: true },
  cost: { type: Number, required: true },
  type: { type: String, required: true },
  rating: { type: Number, required: true },
});

const DayPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, required: true },
  totalCost: { type: Number, required: true },
  activities: { type: [ActivitySchema], required: true },
});

const CostBreakdownSchema = new mongoose.Schema({
  accommodation: { type: Number, required: true },
  food: { type: Number, required: true },
  transport: { type: Number, required: true },
  activities: { type: Number, required: true },
  total: { type: Number, required: true },
});

const TravelPlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  destination: { type: String, required: true },
  duration: { type: Number, required: true },
  mapCenter: { type: CoordinatesSchema, required: true },
  preferences: { type: [String], default: [] },
  costBreakdown: { type: CostBreakdownSchema, required: true },
  itinerary: { type: [DayPlanSchema], required: true },
});

export default mongoose.model('TravelPlan', TravelPlanSchema);  