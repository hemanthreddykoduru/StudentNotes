const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
// Users must add GEMINI_API_KEY to their .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST /api/chat
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'Configuration Error', 
                message: 'Gemini API Key is missing on the server.' 
            });
        }

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"});

        // Context / Persona for the bot
        const context = `
        You are the helpful AI assistant for "NotesMarket", a platform where students can buy and sell handwritten notes.
        
        Key Information:
        - "NotesMarket" is a marketplace for university study materials and handwritten notes.
        - Pricing: Individual notes have varying prices. The "Pro Plan" (Subscription) costs ₹100/year and gives unlimited access to all notes.
        - Features: High-quality PDF notes, search by subject/college, secure payments via Razorpay.
        - Support: Users can contact support via the Contact page if they have payment issues.
        - Tone: Friendly, professional, concise, and helpful.
        - Important: If asked about account specific details (like "what is my password"), politely explain you cannot access private data and guide them to the My Account page.
        
        User Query: ${message}
        `;

        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();

        // Simple heuristic to add action buttons based on AI response content
        // This makes the chat interactive like the previous hardcoded version
        let action = null;
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('price') || lowerText.includes('subscription') || lowerText.includes('₹100')) {
            action = { label: "View Pricing", path: "/pricing" };
        } else if (lowerText.includes('login') || lowerText.includes('account')) {
            action = { label: "Go to Login", path: "/login" };
        } else if (lowerText.includes('support') || lowerText.includes('contact') || lowerText.includes('help')) {
            action = { label: "Contact Support", path: "/support" };
        } else if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('note')) {
            action = { label: "Search Notes", path: "/" };
        }

        res.json({ 
            text: text,
            action: action 
        });

    } catch (error) {
        console.error('Gemini Chat Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            details: error.message,
            stack: error.stack 
        });
    }
});

module.exports = router;
