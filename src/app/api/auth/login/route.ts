import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, generateSessionToken, decryptField } from '@/lib/security';
import type { StudentProfile, AvatarConfig, ClassSession } from '@/types/profile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Registration number/email and password are required.' },
        { status: 400 }
      );
    }

    const cleanId = String(identifier).trim();
    const cleanPassword = String(password);
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const db = getDb();
    const now = Date.now();

    // Query student by registration number or email (parameterized query)
    const studentQuery = db.prepare(`
      SELECT * FROM students 
      WHERE registration_number = ? OR lower(email) = lower(?)
    `);
    const student = studentQuery.get(cleanId, cleanId) as any;

    const auditStmt = db.prepare(`
      INSERT INTO login_audit_logs (identifier, success, ip_address, failure_reason)
      VALUES (?, ?, ?, ?)
    `);

    // Constant-time dummy verification if user not found to prevent username enumeration via timing
    if (!student) {
      verifyPassword(cleanPassword, '00'.repeat(64), '00'.repeat(32));
      auditStmt.run(cleanId, 0, ip, 'User not found');
      return NextResponse.json(
        { error: 'Invalid registration number or password.' },
        { status: 401 }
      );
    }

    // Check account lockout
    if (student.locked_until && student.locked_until > now) {
      const waitMinutes = Math.ceil((student.locked_until - now) / (60 * 1000));
      auditStmt.run(cleanId, 0, ip, 'Account locked');
      return NextResponse.json(
        { 
          error: `Account is temporarily locked due to consecutive failed attempts. Try again in ${waitMinutes} minute(s).` 
        },
        { status: 423 }
      );
    }

    // Verify Scrypt password hash
    const isValid = verifyPassword(cleanPassword, student.password_hash, student.salt);

    if (!isValid) {
      const attempts = (student.failed_login_attempts || 0) + 1;
      let lockUntil: number | null = null;
      let lockMsg = '';

      if (attempts >= 5) {
        lockUntil = now + 15 * 60 * 1000; // 15-minute brute-force lockout
        lockMsg = ' Account locked for 15 minutes.';
      }

      const updateAttempts = db.prepare(`
        UPDATE students 
        SET failed_login_attempts = ?, locked_until = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      updateAttempts.run(attempts, lockUntil, student.id);

      auditStmt.run(cleanId, 0, ip, 'Invalid password');

      return NextResponse.json(
        { 
          error: `Invalid registration number or password.${lockMsg}`,
          remainingAttempts: Math.max(0, 5 - attempts)
        },
        { status: 401 }
      );
    }

    // Password is valid - reset lockout counters
    const resetStmt = db.prepare(`
      UPDATE students 
      SET failed_login_attempts = 0, locked_until = NULL, updated_at = datetime('now')
      WHERE id = ?
    `);
    resetStmt.run(student.id);

    // Create secure cryptographic session (7 days validity)
    const sessionToken = generateSessionToken();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const insertSession = db.prepare(`
      INSERT INTO sessions (id, student_id, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertSession.run(sessionToken, student.id, expiresAt, ip, userAgent);

    auditStmt.run(cleanId, 1, ip, null);

    // Fetch schedules
    const scheduleQuery = db.prepare(`
      SELECT id, course_code as courseCode, course_name as courseName,
             room_number as roomNumber, building_id as buildingId,
             start_time as startTime, end_time as endTime, day, instructor
      FROM student_schedules
      WHERE student_id = ?
    `);
    const schedules = scheduleQuery.all(student.id) as any[];

    // Decrypt sensitive emergency contact
    const decryptedContact = decryptField(
      student.emergency_contact_encrypted,
      student.emergency_contact_iv,
      student.emergency_contact_tag
    );

    let parsedAvatar: AvatarConfig;
    try {
      parsedAvatar = JSON.parse(student.avatar_json);
    } catch {
      parsedAvatar = {
        gender: 'boy',
        accentColor: '#635BFF',
        hairColor: '#1E293B',
        clothingColor: '#635BFF',
      };
    }

    const profile: StudentProfile = {
      registrationNumber: student.registration_number,
      name: student.name,
      email: student.email,
      school: student.school,
      program: student.program,
      term: student.term,
      bloodGroup: student.blood_group,
      hostelBlock: student.hostel_block,
      emergencyContact: decryptedContact,
      attendancePercentage: student.attendance_percentage,
      avatar: parsedAvatar,
      schedule: schedules as ClassSession[],
    };

    const res = NextResponse.json({ success: true, profile });

    // Set secure HTTP-only cookie
    res.cookies.set('navia_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
