import rateLimit from 'express-rate-limit'

// (Public API: ek IP se 15 minute mein 300 requests. Admin routes (login ke alawa) ka apna bada limit hai, neeche.)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  skip: (req) => req.path.startsWith('/admin/') && req.path !== '/admin/login',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})

// (Admin panel: bulk add, reorder waghaira mein bahut requests jaati hain. Ek IP se 15 minute mein 2000.)
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from the admin panel. Please wait a few minutes and try again.' },
})

// (Lead form: ek IP se 15 minute mein 10 submissions)
export const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again after some time.' },
})

// (Admin login: ek IP se 15 minute mein 10 galat koshishein. Sahi login count nahi hota.)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
})