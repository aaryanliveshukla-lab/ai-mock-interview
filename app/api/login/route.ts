import { NextResponse } from 'next/server';
import { getCollections } from '@/db';
import { ensureMongoIndexes } from '@/db/bootstrap';
import { comparePassword } from '@/lib/password';
import { signToken } from '@/lib/jwt';
import { serializeUser } from '@/db/schema';

export async function POST(request: Request) {
  try {
    await ensureMongoIndexes();
    const { users } = await getCollections();
    const { email, password } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !String(password || '').trim()) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user._id.toHexString(),
      email: user.email,
      role: user.role ?? 'student',
      name: user.name,
    });

    const response = NextResponse.json(
      { user: serializeUser(user) },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
