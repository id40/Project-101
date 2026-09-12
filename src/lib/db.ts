import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { hashPassword, encryptField } from './security';
import type { StudentProfile, AvatarConfig, ClassSession } from '@/types/profile';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'campus_secure.db');
  const db = new DatabaseSync(dbPath);

  // Performance and integrity pragma settings
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // Initialize secure tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      registration_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      school TEXT NOT NULL,
      program TEXT NOT NULL,
      term TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      hostel_block TEXT NOT NULL,
      emergency_contact_encrypted TEXT NOT NULL,
      emergency_contact_iv TEXT NOT NULL,
      emergency_contact_tag TEXT NOT NULL,
      attendance_percentage REAL NOT NULL DEFAULT 85.0,
      avatar_json TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      is_active INTEGER NOT NULL DEFAULT 1,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_schedules (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_code TEXT NOT NULL,
      course_name TEXT NOT NULL,
      room_number TEXT NOT NULL,
      building_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      day TEXT NOT NULL,
      instructor TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS login_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      success INTEGER NOT NULL,
      ip_address TEXT,
      failure_reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_students_reg ON students(registration_number);
    CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_schedules_student ON student_schedules(student_id);
  `);

  dbInstance = db;
  seedInitialStudent(db);
  return db;
}

function seedInitialStudent(db: DatabaseSync) {
  const checkStmt = db.prepare('SELECT id FROM students WHERE registration_number = ?');
  const existing = checkStmt.get('12204589') as { id: string } | undefined;

  if (!existing) {
    const studentId = 'std-' + crypto.randomUUID();
    const { hash, salt } = hashPassword('LpuCampus@2026!');
    const encContact = encryptField('+91 98721 99999');

    const defaultAvatar: AvatarConfig = {
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
      '12204589',
      'Shekh Imamul',
      'shekh.imamul@lpu.in',
      hash,
      salt,
      'School of Computer Science and Engineering',
      'B.Tech CSE (AI & Data Science)',
      'Term 6',
      'O+',
      'Boys Hostel BH-1, Room 412',
      encContact.encrypted,
      encContact.iv,
      encContact.tag,
      88.5,
      JSON.stringify(defaultAvatar)
    );

    const insertSchedule = db.prepare(`
      INSERT INTO student_schedules (
        id, student_id, course_code, course_name, room_number, building_id,
        start_time, end_time, day, instructor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultSchedule: Omit<ClassSession, 'id'>[] = [
      {
        courseCode: 'CSE326',
        courseName: 'Internet Programming & Web Apps',
        roomNumber: '34-201',
        buildingId: 'b-33-34',
        startTime: '09:00',
        endTime: '10:00',
        day: 'Monday',
        instructor: 'Dr. Sharma',
      },
      {
        courseCode: 'INT404',
        courseName: 'Artificial Intelligence Systems',
        roomNumber: '34-105',
        buildingId: 'b-33-34',
        startTime: '11:00',
        endTime: '12:00',
        day: 'Monday',
        instructor: 'Prof. Verma',
      },
      {
        courseCode: 'MGT101',
        courseName: 'Tech Entrepreneurship',
        roomNumber: '13-302',
        buildingId: 'b-13-14',
        startTime: '14:00',
        endTime: '15:00',
        day: 'Monday',
        instructor: 'Dr. Kaur',
      },
    ];

    for (let i = 0; i < defaultSchedule.length; i++) {
      const s = defaultSchedule[i];
      insertSchedule.run(
        `sch-${i + 1}-${studentId.slice(0, 8)}`,
        studentId,
        s.courseCode,
        s.courseName,
        s.roomNumber,
        s.buildingId,
        s.startTime,
        s.endTime,
        s.day,
        s.instructor
      );
    }

    console.log('Default student account seeded: 12204589 (Shekh Imamul)');
  }
}
