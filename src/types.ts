export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'PARENT'
  | 'STUDENT'
  | 'APPLICANT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  password?: string;
  avatarUrl?: string;
  linkedStudentIds?: string[]; // For Parents & Students
  assignedClasses?: string[]; // For Teachers
  isActive?: boolean;
  isDemo?: boolean;
  tokenVersion?: number;
  mustChangePassword?: boolean;
  createdAt: string;
}

export type SchoolArm = 'NURSERY' | 'PRIMARY' | 'SECONDARY';

export interface SchoolClass {
  id: string;
  name: string; // e.g. "JSS 1A", "Nursery 2", "Primary 5B", "SSS 2 Science"
  arm: SchoolArm;
  classTeacher: string;
  capacity: number;
  studentCount: number;
  termFee: number;
}

export interface Student {
  id: string;
  admissionNo: string; // e.g. PCD/2024/0142
  firstName: string;
  lastName: string;
  otherName?: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  arm: SchoolArm;
  classId: string;
  className: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  bloodGroup?: string;
  genotype?: string;
  sportsHouse: 'Purple (Faith)' | 'Orange (Grace)' | 'Blue (Peace)' | 'Red (Hope)';
  status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED';
  enrolledDate: string;
  avatarUrl?: string;
}

export type AdmissionStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED';

export interface AdmissionApplication {
  id: string; // PCD-2026-0001
  // Student details
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  classApplying: string;
  arm: SchoolArm;
  previousSchool?: string;
  residentialAddress: string;
  stateOfOrigin: string;
  lga: string;
  // Parent details
  parentFullName: string;
  parentPhone: string;
  parentEmail: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  parentOccupation: string;
  parentAddress: string;
  // Documents
  passportPhotoUrl?: string;
  birthCertificateUrl?: string;
  previousResultUrl?: string;
  // Workflow & Status
  status: AdmissionStatus;
  submissionDate: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  interviewDate?: string;
}

export interface SubjectScore {
  subject: string;
  caScore: number; // 40 max (Continuous Assessment)
  examScore: number; // 60 max (Examination)
  total: number; // 100 max
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  remark: 'Distinction' | 'Very Good' | 'Credit' | 'Pass' | 'Fair' | 'Fail';
}

export interface AcademicResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classId: string;
  className: string;
  arm: SchoolArm;
  academicSession: string; // e.g. "2025/2026"
  term: 'First Term' | 'Second Term' | 'Third Term';
  subjects: SubjectScore[];
  totalScore: number;
  maxScore: number;
  average: number;
  positionInClass?: number;
  totalStudentsInClass?: number;
  attendanceDays: number;
  totalDays: number;
  teacherRemark: string;
  principalRemark: string;
  published: boolean;
  publishedDate?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  recordedBy: string;
  note?: string;
}

export interface FeePayment {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Cash (Bursary)' | 'POS' | 'Online Transfer';
  transactionReference: string;
  term: string;
  session: string;
  recordedBy: string;
}

export interface FeeLedger {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  term: string;
  session: string;
  tuitionFee: number;
  developmentLevy: number;
  sportsLevy: number;
  examinationFee: number;
  uniformFee: number;
  totalPayable: number;
  totalPaid: number;
  balanceDue: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  payments: FeePayment[];
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Academic' | 'Sports' | 'Events' | 'Announcement' | 'Notice';
  featuredImage: string;
  author: string;
  authorRole: string;
  publishDate: string;
  published: boolean;
  isImportantNotice?: boolean;
}

export interface GalleryMedia {
  id: string;
  title: string;
  category:
    | 'Assembly'
    | 'Sports'
    | 'Classroom'
    | 'Nursery'
    | 'Primary'
    | 'Secondary'
    | 'Awards'
    | 'School Life'
    | 'Facilities';
  description: string;
  imageUrl: string;
  date: string;
  published: boolean;
  featured?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
  ipAddress?: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: string;
  subject: string;
  teacher: string;
}
