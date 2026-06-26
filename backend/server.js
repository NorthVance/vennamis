import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { DB } from './database.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['*'];

// SEC: Middleware
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100, message: { error: 'Too many requests' } });
app.use(helmet()); 
app.use(limiter);
app.use(cors({ origin: (origin, cb) => { if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) cb(null, true); else cb(new Error('CORS BLOCKED')); }, methods: ['GET', 'POST', 'DELETE'], credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

// 📍 SYS: WebSocket Engine (Real-time Chat)
const io = new Server(httpServer, { cors: { origin: allowedOrigins, methods: ["GET", "POST"] } });
io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);
    
    // Join private room
    socket.on('join_room', (room) => { socket.join(room); console.log(`[Socket] ${socket.id} joined ${room}`); });
    
    // Relay message
    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
        console.log(`[Socket] Msg relayed in ${data.room}`);
    });
    
    socket.on('disconnect', () => console.log(`[Socket] User disconnected: ${socket.id}`));
});

// ROUTE: Health & Feeds
app.get('/api/health', (req, res) => res.status(200).json({ status: 'online', version: '30.0.0' }));
app.get('/api/feed/:type', async (req, res) => { try { const r = await DB.getFeed(req.params.type === 'gigs' ? 'gigs' : (req.params.type === 'news' ? 'news' : 'community')); if (r.error) return res.status(503).json(r); res.status(200).json(r.data); } catch (e) { res.status(500).json({ error: 'Internal Error' }); } });
app.post('/api/feed/:type', async (req, res) => { try { const r = await DB.insertPost(req.params.type === 'gigs' ? 'gigs' : (req.params.type === 'news' ? 'news' : 'community'), req.body); if (r.error) return res.status(503).json(r); res.status(201).json(r); } catch (e) { res.status(500).json({ error: 'Internal Error' }); } });

// ROUTE: AI Translation
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang, provider } = req.body;
        if (!text || !targetLang) return res.status(400).json({ error: 'Missing params' });
        if (provider === 'deepseek' && process.env.DEEPSEEK_API_KEY) {
            const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` }, body: JSON.stringify({ model: "deepseek-chat", messages: [{"role": "system", "content": `Translate to ${targetLang}. Return ONLY translated text.`}, {"role": "user", "content": text}] }) });
            const aiData = await aiRes.json(); return res.status(200).json({ translatedText: aiData.choices[0].message.content });
        }
        const fbRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const fbData = await fbRes.json(); res.status(200).json({ translatedText: fbData.responseData.translatedText });
    } catch (e) { res.status(500).json({ error: 'Gateway Error' }); }
});

app.use((err, req, res, next) => res.status(500).json({ error: 'Critical Gateway Failure' }));

// INIT: Boot HTTP Server (Not just Express app)
httpServer.listen(PORT, () => console.log(`[SYS] Vennamis Gateway & Socket active on port ${PORT}`));
