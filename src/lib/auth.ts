/**
 * Authentication and authorization validator for 1delivery sensitive operations
 * (Courier settlements, merchant dispatching, internal admin actions)
 */

export function isAuthorizedRequest(req: Request): boolean {
  const authHeader = req.headers.get('authorization') || '';
  const apiKey = req.headers.get('x-delivery-key') || req.headers.get('x-1pay-signature');
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

  const allowedKeys = [
    process.env.DELIVERY_API_KEY,
    process.env.ONEPAY_WEBHOOK_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ].filter(Boolean) as string[];

  // In production / configured environments, verify token
  if (allowedKeys.length > 0) {
    if (token && allowedKeys.includes(token)) return true;
    if (apiKey && allowedKeys.includes(apiKey)) return true;
    return false;
  }

  // Development fallback: only allow if explicitly not in production
  return process.env.NODE_ENV !== 'production';
}
