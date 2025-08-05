import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
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
import agentRoutes from "./routes/agent.routes.js";
import {chatRoute} from './routes/chat.js'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],  // allow both frontend ports
  credentials: true,                // allow cookies and auth headers
};

const app = express();
app.use(cors(corsOptions));

app.use(cookieParser()); // For JWT cookies

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Static Files 
app.use('/audio', express.static(path.join(__dirname, 'tts_output')));
app.use('/prescriptions', express.static(path.join(__dirname, 'uploads/prescriptions')));

//  Public Routes
app.use('/api/v1/users', userRouter); 
app.use('/api/v1/ocr', ocrRouter); 


//Protected Routes 
app.use('/api/v1/families', familyRouter);
app.use('/api/v1/medications', medicationRouter);
app.use('/api/v1/prescriptions', prescriptionRouter);
app.use('/api/v1/vitals', vitalRouter);
app.use('/api/v1/emergency', emergencyRouter);
app.use('/api/v1/ai', aiAgentRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/agent', agentRoutes);

app.use('/api/chat', chatRoute);

export default app;