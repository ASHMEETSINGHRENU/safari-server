import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import safariRoutes from './routes/safariRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const clientUrl = process.env.CLIENT_URL;
// Extra origins can be added without a deploy via CLIENT_URLS (comma-separated).
const extraOrigins = (process.env.CLIENT_URLS || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = [
  'https://safari-client-topaz.vercel.app',
  'https://shutter-and-stripes-frontend.onrender.com', // legacy Render static site, if still served
  'http://localhost:5174',
  'http://localhost:3000',
  clientUrl,
  ...extraOrigins
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Same-origin/non-browser callers (curl, health checks, server-to-server) send no Origin.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // 403, not 500: a disallowed origin is a client error, and the stack must not
    // echo the rejected origin back to the caller.
    const err = new Error('Origin not allowed by CORS policy.');
    err.status = 403;
    return callback(err);
  },
  credentials: true
}));
app.set('trust proxy', 1); // Render terminates TLS in front of us; needed for correct client IPs
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// 'combined' gives real client IPs + status in prod logs; 'dev' is easier to read locally.
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'SHUTTER AND STRIPES', timestamp: new Date() });
});

// Root welcome / status page for browser visitors and API consumers
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SHUTTER AND STRIPES — API Service</title>
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #2E3A23; color: #EADCC6; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
          .card { background: #222b1a; border: 1px solid rgba(212, 163, 91, 0.3); border-radius: 16px; padding: 40px; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
          .badge { display: inline-block; background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; color: #4ade80; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
          h1 { margin: 0 0 10px; font-size: 28px; letter-spacing: 0.05em; color: #EADCC6; font-family: Georgia, serif; }
          p { margin: 0 0 24px; color: rgba(234, 220, 198, 0.8); font-size: 14px; line-height: 1.6; }
          .btn { background: #D4A35B; color: #2E3A23; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; margin-bottom: 24px; letter-spacing: 0.05em; text-transform: uppercase; font-size: 12px; transition: background 0.2s; }
          .btn:hover { background: #fae29c; }
          .endpoints { text-align: left; background: rgba(0,0,0,0.3); border: 1px solid rgba(234, 220, 198, 0.1); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; font-family: monospace; font-size: 13px; }
          .endpoints a { color: #D4A35B; text-decoration: none; display: block; margin: 8px 0; }
          .endpoints a:hover { text-decoration: underline; color: #fae29c; }
          .footer { font-size: 11px; color: rgba(234, 220, 198, 0.5); text-transform: uppercase; letter-spacing: 0.08em; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">● API Online and Healthy</span>
          <h1>SHUTTER AND STRIPES</h1>
          <p>The premium wildlife safari discovery, storytelling, and booking API is live and connected to MongoDB Atlas.</p>
          <a href="${clientUrl || '/'}" target="_blank" rel="noopener" class="btn">Open Live Website &rarr;</a>
          <div class="endpoints">
            <span style="color: rgba(234, 220, 198, 0.5); font-size: 11px; text-transform: uppercase;">Active Endpoints:</span>
            <a href="/api/health" target="_blank">➜ /api/health (System Diagnostics)</a>
            <a href="/api/v1/destinations" target="_blank">➜ /api/v1/destinations</a>
            <a href="/api/v1/safaris" target="_blank">➜ /api/v1/safaris (42 Safari Packages)</a>
            <a href="/api/v1/cms/gallery" target="_blank">➜ /api/v1/cms/gallery (Wildlife Gallery)</a>
            <a href="/api/v1/cms/journals" target="_blank">➜ /api/v1/cms/journals (Field Notes)</a>
          </div>
          <div class="footer">Central Indian Wild • MP and MH Reserves</div>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json({
      platform: 'SHUTTER AND STRIPES — Wildlife Safari and Booking API',
      status: 'ONLINE',
      database: 'MongoDB Atlas',
      region: 'Madhya Pradesh and Maharashtra',
      endpoints: {
        health: '/api/health',
        destinations: '/api/v1/destinations',
        safaris: '/api/v1/safaris',
        gallery: '/api/v1/cms/gallery',
        journals: '/api/v1/cms/journals'
      }
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/safaris', safariRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/admin', adminRoutes);

// In Production, serve frontend SPA if client/dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server.`,
    availableEndpoints: ['/api/health', '/api/v1/destinations', '/api/v1/safaris', '/api/v1/cms', '/api/v1/auth']
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
