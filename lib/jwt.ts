import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Encode secret for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload {
  id: string;
  email: string;
  role?: string | null;
  name?: string | null;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export async function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as JwtPayload;
  } catch (error) {
    return null;
  }
}
