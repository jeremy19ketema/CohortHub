const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many requests. Please try again in 15 minutes.'
    }
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many login attempts. Please try again after 1 minute.'
    },
    skipSuccessfulRequests: false
});

const quizLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 3, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many quiz submissions. Please wait 1 minute before trying again.'
    }
});

module.exports = { generalLimiter, authLimiter, quizLimiter };