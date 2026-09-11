export interface AvatarConfig {
  gender: 'boy' | 'girl';
  accentColor: string; // e.g. '#635BFF'
  hairColor: string;
  clothingColor: string;
}

export interface ClassSession {
  id: string;
  courseCode: string; // e.g. 'CSE326'
  courseName: string; // e.g. 'Internet Programming'
  roomNumber: string; // e.g. '34-204'
  buildingId: string; // e.g. 'loc-002'
  startTime: string; // '09:00'
  endTime: string; // '10:00'
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  instructor: string;
}

export interface StudentProfile {
  registrationNumber: string; // e.g. '12204589'
  name: string;
  email: string;
  school: string; // 'School of Computer Science and Engineering'
  program: string; // 'B.Tech CSE (AI & Data Science)'
  term: string; // 'Term 6'
  bloodGroup: string; // 'O+'
  hostelBlock: string; // 'BH-1, Room 412'
  emergencyContact: string; // '+91 98765 43210'
  attendancePercentage: number; // 88.5
  avatar: AvatarConfig;
  schedule: ClassSession[];
}
