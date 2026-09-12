import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { encryptField } from '@/lib/security';

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('navia_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const db = getDb();
    const now = Date.now();

    const sessionQuery = db.prepare(`
      SELECT student_id FROM sessions
      WHERE id = ? AND expires_at > ?
    `);
    const session = sessionQuery.get(sessionToken, now) as { student_id: string } | undefined;

    if (!session) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
    }

    const body = await req.json();
    const { avatar, emergencyContact, hostelBlock } = body;

    if (avatar) {
      const updateAvatar = db.prepare(`
        UPDATE students SET avatar_json = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      updateAvatar.run(JSON.stringify(avatar), session.student_id);
    }

    if (emergencyContact) {
      const enc = encryptField(String(emergencyContact).trim());
      const updateContact = db.prepare(`
        UPDATE students SET emergency_contact_encrypted = ?, emergency_contact_iv = ?, emergency_contact_tag = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      updateContact.run(enc.encrypted, enc.iv, enc.tag, session.student_id);
    }

    if (hostelBlock) {
      const updateHostel = db.prepare(`
        UPDATE students SET hostel_block = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      updateHostel.run(String(hostelBlock).trim(), session.student_id);
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err: any) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
