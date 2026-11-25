import rateLimit from 'express-rate-limit';

export function createAuthRateLimiter(maxRequests = 10, windowMs = 60 * 1000) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'TOO_MANY_REQUESTS',
      message:
        'Prea multe încercări de autentificare. Vă rugăm să așteptați un minut.',
    },
  });
}

export const authRateLimiter = createAuthRateLimiter();
