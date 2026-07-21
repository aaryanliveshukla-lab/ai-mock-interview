import { NextResponse } from 'next/server';
import { ObjectId, MongoServerError } from 'mongodb';
import { getCollections } from '@/db';
import { ensureMongoIndexes } from '@/db/bootstrap';
import { hashPassword } from '@/lib/password';
import { serializeUser, type UserRole } from '@/db/schema';

export async function POST(request: Request) {
  try {
    await ensureMongoIndexes();
    const { users } = await getCollections();
    const {
      email,
      password,
      name,
      role,
      phone,
      college,
      branch,
      graduationYear,
      skills,
      experience,
      projects,
      resumeUrl,
      careerGoal,
    } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedRole: UserRole = ['student', 'trainer', 'placement_officer', 'admin'].includes(
      String(role || '').trim()
    )
      ? (String(role).trim() as UserRole)
      : 'student';

    if (!normalizedEmail || !String(password || '').trim() || !normalizedName) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    const newUser = {
      _id: new ObjectId(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      name: normalizedName,
      role: normalizedRole,
      phone: String(phone || '').trim() || null,
      college: String(college || '').trim() || null,
      branch: String(branch || '').trim() || null,
      graduationYear: graduationYear ? Number(graduationYear) : null,
      skills: Array.isArray(skills)
        ? skills.map((skill: string) => String(skill).trim()).filter(Boolean)
        : typeof skills === 'string'
          ? String(skills)
              .split(',')
              .map(skill => skill.trim())
              .filter(Boolean)
          : [],
      experience: String(experience || '').trim() || null,
      projects: String(projects || '').trim() || null,
      resumeUrl: String(resumeUrl || '').trim() || null,
      careerGoal: String(careerGoal || '').trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await users.insertOne(newUser);
    return NextResponse.json({ user: serializeUser(newUser) }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
