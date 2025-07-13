import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { parseUserInterests, generateItineraryWithRAG, getTravelSuggestions } from './utils/geminiApi.js';
import { getQlooRecommendations } from './utils/qlooApi.js';

// Load environment variables first
dotenv.config();

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Travel AI API is running' });
});

// Main endpoint for AI-powered trip planning
app.post('/api/plan-trip', async (req, res) => {
    try {
        const { message, budget = 2500 } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Planning trip for:', message, 'Budget:', budget);

        // Step 1: Parse user interests with Gemini
        console.log('Step 1: Parsing user interests...');
        const userInterests = await parseUserInterests(message);
        console.log('Parsed interests:', userInterests);

        // Step 2: Get taste-aligned recommendations from Qloo
        console.log('Step 2: Getting Qloo recommendations...');
        const qlooRecommendations = await getQlooRecommendations(userInterests);
        console.log('Qloo recommendations:', qlooRecommendations);

        // Step 3: Generate complete itinerary with Gemini RAG
        console.log('Step 3: Generating itinerary with RAG...');
        const travelPlan = await generateItineraryWithRAG(userInterests, qlooRecommendations, budget);
        console.log('Generated travel plan:', travelPlan.destination);

        res.json({
            success: true,
            travelPlan,
            userInterests,
            qlooRecommendations: {
                destinationCount: qlooRecommendations.destinations?.length || 0,
                restaurantCount: qlooRecommendations.restaurants?.length || 0,
                attractionCount: qlooRecommendations.attractions?.length || 0
            }
        });

    } catch (error) {
        console.error('Error planning trip:', error);
        res.status(500).json({ 
            error: 'Failed to plan trip', 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Endpoint for getting destination suggestions (optional)
app.post('/api/suggest-destinations', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const suggestions = await getTravelSuggestions(message);
        res.json({ success: true, suggestions });

    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Environment check:');
    console.log('- Gemini API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
    console.log('- Qloo API Key:', process.env.QLOO_API_KEY ? 'Set' : 'Missing');
});