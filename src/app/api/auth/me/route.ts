import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { decryptField } from '@/lib/security';
import type { StudentProfile, AvatarConfig, ClassSession } from '@/types/profile';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('navia_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const db = getDb();
    const now = Date.now();

    // Verify session
    const sessionQuery = db.prepare(`
      SELECT s.student_id, s.expires_at, st.*
      FROM sessions s
      JOIN students st ON st.id = s.student_id
      WHERE s.id = ? AND s.expires_at > ? AND st.is_active = 1
    `);
    const result = sessionQuery.get(sessionToken, now) as any;

    if (!result) {
      // Invalid or expired session
      const res = NextResponse.json({ authenticated: false }, { status: 401 });
      res.cookies.delete('navia_session');
      return res;
    }

    // Fetch schedules
    const scheduleQuery = db.prepare(`
      SELECT id, course_code as courseCode, course_name as courseName,
             room_number as roomNumber, building_id as buildingId,
             start_time as startTime, end_time as endTime, day, instructor
      FROM student_schedules
      WHERE student_id = ?
    `);
    const schedules = scheduleQuery.all(result.student_id) as any[];

    // Decrypt emergency contact
    const decryptedContact = decryptField(
      result.emergency_contact_encrypted,
      result.emergency_contact_iv,
      result.emergency_contact_tag
    );

    let parsedAvatar: AvatarConfig;
    try {
      parsedAvatar = JSON.parse(result.avatar_json);
    } catch {
      parsedAvatar = {
        gender: 'boy',
        accentColor: '#635BFF',
        hairColor: '#1E293B',
        clothingColor: '#635BFF',
      };
    }

    const profile: StudentProfile = {
      registrationNumber: result.registration_number,
      name: result.name,
      email: result.email,
      school: result.school,
      program: result.program,
      term: result.term,
      bloodGroup: result.blood_group,
      hostelBlock: result.hostel_block,
      emergencyContact: decryptedContact,
      attendancePercentage: result.attendance_percentage,
      avatar: parsedAvatar,
      schedule: schedules as ClassSession[],
    };

    return NextResponse.json({ authenticated: true, profile });
  } catch (err: any) {
    console.error('Session verify error:', err);
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
}
