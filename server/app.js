require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use('/api', generalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cohorts', require('./routes/cohorts'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/announcements', require('./routes/announcements'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'index.html')));
app.use(errorHandler);
module.exports = app;