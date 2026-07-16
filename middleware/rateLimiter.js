const rateLimit = require('express-rate-limit');

// Login rate limit: max 3 requests per 10 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 10 minutes.',
  },
});

module.exports = { loginLimiter };
