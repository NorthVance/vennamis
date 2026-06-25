import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// SEC: Core Middlewares
app.use(helmet()); 
app.use(cors({
    origin: process.env.CLIENT_URL || '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// SYS: Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'Vennamis API Gateway',
        version: '23.0.0'
    });
});

// ROUTE: Escrow Webhook Prep
app.post('/api/escrow/webhook', (req, res) => {
    console.log('[WEBHOOK] Escrow update received');
    res.status(200).send('OK');
});

// ROUTE: AI Translation Gateway Prep
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang, provider } = req.body;
        if (!text || !targetLang) return res.status(400).json({ error: 'Missing parameters' });
        
        // TODO: Inject DeepSeek / DeepL Secret Keys here
        res.status(200).json({ translatedText: `[API MOCK] ${text}` });
    } catch (error) {
        console.error('[API Error] Translation failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// SYS: Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Critical failure in Gateway' });
});

// INIT: Boot Server
app.listen(PORT, () => {
    console.log(`[SYS] Vennamis Gateway active on port ${PORT}`);
});
