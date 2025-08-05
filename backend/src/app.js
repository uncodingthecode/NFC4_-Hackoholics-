import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import userRouter from './routes/user.route.js';
import familyRouter from './routes/family.route.js';
import medicationRouter from './routes/medication.route.js';
import prescriptionRouter from './routes/prescription.route.js';
import vitalRouter from './routes/vital.route.js';
import emergencyRouter from './routes/emergency.route.js';
import aiAgentRouter from './routes/aiAgent.route.js';
import notificationRouter from './routes/notification.route.js';
import ocrRouter from './routes/ocr.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(cookieParser()); // For JWT cookies

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, 
  message: 'Too many requests from this IP, please try again later'
});

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Static Files 
app.use('/audio', express.static(path.join(__dirname, 'tts_output')));
app.use('/prescriptions', express.static(path.join(__dirname, 'uploads/prescriptions')));

//  Public Routes
app.use('/api/v1/users', userRouter); 
app.use('/api/v1/ocr', authLimiter, ocrRouter); 

//Protected Routes 
app.use('/api/v1/families', familyRouter);
app.use('/api/v1/medications', medicationRouter);
app.use('/api/v1/prescriptions', prescriptionRouter);
app.use('/api/v1/vitals', vitalRouter);
app.use('/api/v1/emergency', emergencyRouter);
app.use('/api/v1/ai', aiAgentRouter);
app.use('/api/v1/notifications', notificationRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
});

export default app;