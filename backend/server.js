import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Destination from './models/Destination.js'; // Adjust the path as necessary
import TravelPlan from './models/Itinerary.js'; // Adjust the path as necessary


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors(
    {
        origin: 'http://localhost:5173', // Adjust this to your frontend URL
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true // Allow cookies to be sent
    }
));
dotenv.config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travel-planner', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use(express.json());    
app.use(express.urlencoded({ extended: true }));

app.get('/destination', async(req, res) => {
    //console.log("entered")
    try{
        
        const destinations = await Destination.find();
      //  console.log('Fetched destinations:', destinations);
        res.json(destinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
});

app.get('/itinerary/:destinationId', async (req, res) => {
        console.log("entered")

  const { destinationId } = req.params;
console.log("destinationId:", destinationId);
  if (!destinationId) {
    return res.status(400).json({ error: 'destinationId is required' });
  }

  try {
    const itinerary = await TravelPlan.findOne({ id: destinationId });
    console.log('Fetched itinerary:', itinerary);
    if (itinerary) {
      res.json(itinerary);
    } else {
      res.status(404).json({ error: 'Itinerary not found' });
    }
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});