import { createHmac, timingSafeEqual } from 'node:crypto';
export const developmentSecret = 'LOCAL-ONLY-portfolio-community-do-not-use-in-production';
export function equalSecret(a: string, b: string): boolean {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left,right);
}
export function signVisitor(id: string, secret: string, now = Date.now()): string {
  const value = `${id}.${Math.floor(now/1000)}`;
  return `${value}.${createHmac('sha256',secret).update(value).digest('base64url')}`;
}
export function verifyVisitor(token: string, secret: string, maxAge = 300, now = Date.now()): string | null {
  const [id, timestamp, signature, extra] = token.split('.');
  if (extra || !id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !/^\d{10}$/.test(timestamp ?? '') || !signature) return null;
  const age = Math.floor(now/1000)-Number(timestamp);
  if (age < -30 || age > maxAge) return null;
  const expected = createHmac('sha256',secret).update(`${id}.${timestamp}`).digest('base64url');
  return equalSecret(signature,expected) ? id : null;
}
