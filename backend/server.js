import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { DB } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// SEC: Rate Limiter (ป้องกัน Brute Force & DDoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100, // ล็อกให้ 1 IP ยิงได้แค่ 100 ครั้งต่อ 15 นาที
    message: { error: 'Too many requests from this IP, please try again later.' }
});

// SEC: Core Middlewares
app.use(helmet()); 
app.use(limiter); // เสียบเกราะกันยิง

// SEC: Strict CORS (ล็อกให้รับคำสั่งเฉพาะเว็บ Frontend ของมึงเท่านั้น)
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['*'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));

app.use(express.json({ limit: '5mb' })); // บีบ Limit ป้องกันคนอัปไฟล์ขยะใส่
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

// SYS: Health Check (เอาไว้ยิงเช็คว่า Server ล่มไหม)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'online', service: 'Vennamis Secure Gateway', version: '26.0.0' });
});

// ROUTE: Fetch Feed
app.get('/api/feed/:type', async (req, res) => {
    try {
        const table = req.params.type === 'gigs' ? 'gigs' : (req.params.type === 'news' ? 'news' : 'community');
        const result = await DB.getFeed(table);
        if (result.error) return res.status(503).json(result);
        res.status(200).json(result.data);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

// ROUTE: Post Content
app.post('/api/feed/:type', async (req, res) => {
    try {
        const table = req.params.type === 'gigs' ? 'gigs' : (req.params.type === 'news' ? 'news' : 'community');
        const result = await DB.insertPost(table, req.body);
        if (result.error) return res.status(503).json(result);
        res.status(201).json(result);
    } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

// ROUTE: Translation AI Gateway
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang, provider } = req.body;
        if (!text || !targetLang) return res.status(400).json({ error: 'Missing parameters' });

        if (provider === 'deepseek' && process.env.DEEPSEEK_API_KEY) {
            const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {"role": "system", "content": `Translate to ${targetLang}. Return ONLY the translated text.`},
                        {"role": "user", "content": text}
                    ]
                })
            });
            const aiData = await aiRes.json();
            return res.status(200).json({ translatedText: aiData.choices[0].message.content });
        }

        // Fallback
        const fbRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const fbData = await fbRes.json();
        res.status(200).json({ translatedText: fbData.responseData.translatedText });

    } catch (error) {
        console.error('[API Error]', error);
        res.status(500).json({ error: 'Translation Gateway Error' });
    }
});

// SYS: Global Error Boundary
app.use((err, req, res, next) => {
    console.error('[CRITICAL]', err.stack);
    res.status(500).json({ error: 'Critical failure in Gateway' });
});

// INIT: Boot
app.listen(PORT, () => console.log(`[SYS] Vennamis Gateway active on port ${PORT}`));
