import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, encryptField, validatePasswordStrength, generateSessionToken } from '@/lib/security';
import type { StudentProfile, AvatarConfig, ClassSession } from '@/types/profile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      registrationNumber,
      name,
      email,
      password,
      school,
      program,
      term = 'Term 1',
      bloodGroup = 'O+',
      hostelBlock = 'Campus Resident',
      emergencyContact = '+91 98765 43210',
      avatar,
    } = body;

    // Validate required fields
    if (!registrationNumber || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Registration number, name, email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanReg = String(registrationNumber).trim().toUpperCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate password strength
    const pwdCheck = validatePasswordStrength(String(password));
    if (!pwdCheck.valid) {
      return NextResponse.json(
        { error: pwdCheck.message || 'Password does not meet security requirements.' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check uniqueness
    const existingStmt = db.prepare(`
      SELECT registration_number, email FROM students 
      WHERE registration_number = ? OR lower(email) = lower(?)
    `);
    const existing = existingStmt.get(cleanReg, cleanEmail) as any;

    if (existing) {
      if (existing.registration_number === cleanReg) {
        return NextResponse.json(
          { error: 'A student with this registration number is already registered.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'A student with this email address is already registered.' },
        { status: 409 }
      );
    }

    // Hash password with memory-hard Scrypt
    const { hash, salt } = hashPassword(String(password));

    // Encrypt personal contact details with AES-256-GCM
    const encContact = encryptField(String(emergencyContact).trim());

    const studentId = 'std-' + crypto.randomUUID();
    const defaultAvatar: AvatarConfig = avatar || {
      gender: 'boy',
      accentColor: '#635BFF',
      hairColor: '#1E293B',
      clothingColor: '#635BFF',
    };

    const insertStudent = db.prepare(`
      INSERT INTO students (
        id, registration_number, name, email, password_hash, salt,
        school, program, term, blood_group, hostel_block,
        emergency_contact_encrypted, emergency_contact_iv, emergency_contact_tag,
        attendance_percentage, avatar_json, role, is_active
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, 'student', 1
      )
    `);

    insertStudent.run(
      studentId,
      cleanReg,
      cleanName,
      cleanEmail,
      hash,
      salt,
      school || 'School of Computer Science and Engineering',
      program || 'B.Tech CSE',
      term,
      bloodGroup,
      hostelBlock,
      encContact.encrypted,
      encContact.iv,
      encContact.tag,
      92.0,
      JSON.stringify(defaultAvatar)
    );

    // Seed default starter courses
    const insertSchedule = db.prepare(`
      INSERT INTO student_schedules (
        id, student_id, course_code, course_name, room_number, building_id,
        start_time, end_time, day, instructor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const starterCourses: Omit<ClassSession, 'id'>[] = [
      {
        courseCode: 'CSE101',
        courseName: 'Foundations of Computer Systems',
        roomNumber: '34-101',
        buildingId: 'b-33-34',
        startTime: '09:00',
        endTime: '10:00',
        day: 'Monday',
        instructor: 'Dr. Mehta',
      },
      {
        courseCode: 'MTH201',
        courseName: 'Discrete Mathematics & Graph Theory',
        roomNumber: '34-202',
        buildingId: 'b-33-34',
        startTime: '11:00',
        endTime: '12:00',
        day: 'Monday',
        instructor: 'Prof. Kapoor',
      },
    ];

    for (let i = 0; i < starterCourses.length; i++) {
      const c = starterCourses[i];
      insertSchedule.run(
        `sch-${i + 1}-${studentId.slice(0, 8)}`,
        studentId,
        c.courseCode,
        c.courseName,
        c.roomNumber,
        c.buildingId,
        c.startTime,
        c.endTime,
        c.day,
        c.instructor
      );
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const insertSession = db.prepare(`
      INSERT INTO sessions (id, student_id, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertSession.run(sessionToken, studentId, expiresAt, ip, userAgent);

    const profile: StudentProfile = {
      registrationNumber: cleanReg,
      name: cleanName,
      email: cleanEmail,
      school: school || 'School of Computer Science and Engineering',
      program: program || 'B.Tech CSE',
      term,
      bloodGroup,
      hostelBlock,
      emergencyContact: String(emergencyContact).trim(),
      attendancePercentage: 92.0,
      avatar: defaultAvatar,
      schedule: starterCourses.map((c, idx) => ({ ...c, id: `sch-${idx + 1}-${studentId.slice(0, 8)}` })),
    };

    const res = NextResponse.json({ success: true, profile }, { status: 201 });

    res.cookies.set('navia_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during registration.' },
      { status: 500 }
    );
  }
}
