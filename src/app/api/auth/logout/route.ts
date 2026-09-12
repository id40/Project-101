import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('navia_session')?.value;

    if (sessionToken) {
      const db = getDb();
      const deleteStmt = db.prepare('DELETE FROM sessions WHERE id = ?');
      deleteStmt.run(sessionToken);
    }

    const res = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    res.cookies.delete('navia_session');
    return res;
  } catch (err: any) {
    console.error('Logout error:', err);
    const res = NextResponse.json({ success: true });
    res.cookies.delete('navia_session');
    return res;
  }
}
