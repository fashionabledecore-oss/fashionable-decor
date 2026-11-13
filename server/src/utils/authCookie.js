export const COOKIE_NAME = 'admin_token'
export const SESSION_DAYS = 7

// (Cookie ki settings. httpOnly = JavaScript cookie padh nahi sakta. secure = sirf HTTPS par.)
export function getCookieOptions() {
  // (lax: site aur API same domain par, /api proxy ke through.)
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  }
}