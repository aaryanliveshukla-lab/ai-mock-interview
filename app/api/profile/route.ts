import { NextRequest, NextResponse } from 'next/server';
import { MongoServerError } from 'mongodb';
import { verifyToken } from '@/lib/jwt';
import { comparePassword, hashPassword } from '@/lib/password';
import { getCollections } from '@/db';
import { ensureMongoIndexes } from '@/db/bootstrap';
import { serializeUser, toObjectId, type UserRole } from '@/db/schema';

async function getTokenUserId(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
  return decoded?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    await ensureMongoIndexes();
    const { users } = await getCollections();
    const userId = await getTokenUserId(request);
    const objectId = userId ? toObjectId(userId) : null;

    if (!objectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await users.findOne({ _id: objectId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(user) }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureMongoIndexes();
    const { users } = await getCollections();
    const userId = await getTokenUserId(request);
    const objectId = userId ? toObjectId(userId) : null;

    if (!objectId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      email,
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
      currentPassword,
      newPassword,
    } = await request.json();
    const currentUser = await users.findOne({ _id: objectId });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Partial<{
      role: UserRole;
      name: string;
      email: string;
      phone: string | null;
      college: string | null;
      branch: string | null;
      graduationYear: number | null;
      skills: string[];
      experience: string | null;
      projects: string | null;
      resumeUrl: string | null;
      careerGoal: string | null;
      passwordHash: string;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = String(name).trim();
    }

    if (email !== undefined) {
      updateData.email = String(email).trim().toLowerCase();
    }

    if (role !== undefined) {
      const normalizedRole = ['student', 'trainer', 'placement_officer', 'admin'].includes(
        String(role).trim()
      )
        ? (String(role).trim() as UserRole)
        : 'student';
      updateData.role = normalizedRole;
    }

    if (phone !== undefined) updateData.phone = String(phone).trim() || null;
    if (college !== undefined) updateData.college = String(college).trim() || null;
    if (branch !== undefined) updateData.branch = String(branch).trim() || null;
    if (graduationYear !== undefined) {
      updateData.graduationYear = graduationYear ? Number(graduationYear) : null;
    }
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills)
        ? skills.map((skill: string) => String(skill).trim()).filter(Boolean)
        : typeof skills === 'string'
          ? String(skills)
              .split(',')
              .map((skill: string) => skill.trim())
              .filter(Boolean)
          : [];
    }
    if (experience !== undefined) updateData.experience = String(experience).trim() || null;
    if (projects !== undefined) updateData.projects = String(projects).trim() || null;
    if (resumeUrl !== undefined) updateData.resumeUrl = String(resumeUrl).trim() || null;
    if (careerGoal !== undefined) updateData.careerGoal = String(careerGoal).trim() || null;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      const isValid = await comparePassword(
        currentPassword,
        currentUser.passwordHash
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    try {
      await users.updateOne({ _id: objectId }, { $set: updateData });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 409 }
        );
      }
      throw error;
    }

    const updatedUser = await users.findOne({ _id: objectId });
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(updatedUser) }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
