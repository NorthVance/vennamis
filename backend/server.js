import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { DB } from './database.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 150 });

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
})); 
app.use(limiter);

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['*'];
app.use(cors({ 
    origin: (origin, cb) => { 
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) cb(null, true); 
        else cb(new Error('CORS BLOCKED')); 
    }, 
    methods: ['GET', 'POST', 'DELETE'], 
    credentials: true 
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

const io = new Server(httpServer, { cors: { origin: allowedOrigins, methods: ["GET", "POST"] } });
io.on('connection', (socket) => {
    socket.on('join_room', (room) => socket.join(room));
    socket.on('send_message', (data) => socket.to(data.room).emit('receive_message', data));
});

app.get('/api/health', (req, res) => res.status(200).json({ status: 'online', version: '40.0.5' }));

app.get('/api/feed/:type', async (req, res) => {
    try {
        const table = ['gigs', 'news', 'community'].includes(req.params.type) ? req.params.type : 'gigs';
        const result = await DB.getFeed(table);
        if (result.error) return res.status(503).json(result);
        res.status(200).json(result.data);
    } catch (e) { res.status(500).json({ error: 'Internal Error' }); }
});

app.post('/api/feed/:type', async (req, res) => {
    try {
        const table = ['gigs', 'news', 'community'].includes(req.params.type) ? req.params.type : 'gigs';
        const result = await DB.insertPost(table, req.body);
        if (result.error) return res.status(503).json(result);
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: 'Internal Error' }); }
});

app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang, provider } = req.body;
        if (!text || !targetLang) return res.status(400).json({ error: 'Missing params' });

        if (provider === 'deepseek' && process.env.DEEPSEEK_API_KEY) {
            const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
                body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: `Translate to ${targetLang}. Return ONLY the translated text without quotes or explanations.` }, { role: "user", content: text }] })
            });
            const aiData = await aiRes.json();
            if (aiData.choices && aiData.choices.length > 0) return res.status(200).json({ translatedText: aiData.choices[0].message.content.trim() });
        }

        if (provider === 'deepl' && process.env.DEEPL_API_KEY) {
            const dpRes = await fetch('https://api-free.deepl.com/v2/translate', {
                method: 'POST', headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: [text], target_lang: targetLang.toUpperCase() })
            });
            const dpData = await dpRes.json();
            if (dpData.translations) return res.status(200).json({ translatedText: dpData.translations[0].text });
        }

        const fbRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const fbData = await fbRes.json();
        if (fbData.responseStatus === 200) return res.status(200).json({ translatedText: fbData.responseData.translatedText });

        res.status(200).json({ translatedText: text }); 
    } catch (e) {
        res.status(500).json({ error: 'Gateway Error' });
    }
});

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
});

app.use((err, req, res, next) => { res.status(500).json({ error: 'Gateway Failure' }); });

httpServer.listen(PORT, () => console.log(`[SYS] Vennamis Gateway active on port ${PORT}`));
