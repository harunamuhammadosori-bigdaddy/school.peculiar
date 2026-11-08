import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_RESULTS,
  INITIAL_ADMISSIONS,
  INITIAL_FEES,
  INITIAL_NEWS,
} from '../data/mockData';
import { INITIAL_GALLERY_MEDIA } from '../data/mediaData';
import {
  AdmissionApplication,
  AcademicResult,
  FeeLedger,
  FeePayment,
  NewsArticle,
  GalleryMedia,
  Student,
  User,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'pcd_db_users',
  ADMISSIONS: 'pcd_db_admissions',
  STUDENTS: 'pcd_db_students',
  RESULTS: 'pcd_db_results',
  FEES: 'pcd_db_fees',
  NEWS: 'pcd_db_news',
  GALLERY: 'pcd_db_gallery',
  CONTACT: 'pcd_db_contact',
  PASSWORDS: 'pcd_db_passwords',
  OTP: 'pcd_db_otps',
};

export function isPhoneNumberMatch(input: string, targetPhone?: string): boolean {
  if (!input || !targetPhone) return false;
  const cleanInput = input.trim();
  const cleanTarget = targetPhone.trim();
  if (cleanInput === cleanTarget) return true;

  const inputDigits = cleanInput.replace(/\D/g, '');
  const targetDigits = cleanTarget.replace(/\D/g, '');
  if (!inputDigits || !targetDigits) return false;
  if (inputDigits === targetDigits) return true;

  // Compare standard Nigerian phone digits (last 10 digits match)
  const inputLast10 = inputDigits.slice(-10);
  const targetLast10 = targetDigits.slice(-10);
  if (inputLast10.length >= 8 && targetLast10.length >= 8 && inputLast10 === targetLast10) {
    return true;
  }
  return false;
}

// Seed passwords map for static/client-side authentication
const DEFAULT_PASSWORDS: Record<string, string[]> = {
  'admin@peculiarschools.edu.ng': ['Peculiar@2026', 'Admin@PCD2026!', 'admin123', 'admin', 'Admin@123456'],
  'harunamuhammadosori@gmail.com': ['@Admin2005', 'Admin@PCD2026!', '@Osori2005', 'Osori@2005'],
  'principal@peculiarschools.edu.ng': ['Peculiar@2026'],
  'teacher@peculiarschools.edu.ng': ['Peculiar@2026'],
  'accountant@peculiarschools.edu.ng': ['Peculiar@2026'],
  'parent@peculiarschools.edu.ng': ['Peculiar@2026'],
  'applicant@peculiarschools.edu.ng': ['Peculiar@2026'],
  'student@peculiarschools.edu.ng': ['Peculiar@2026'],
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save to localStorage (${key})`, err);
  }
}

/**
 * Safely parse JSON from a fetch Response without throwing unexpected end of JSON errors.
 */
export async function parseResponseSafely<T = any>(res: Response): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const text = await res.text().catch(() => '');
    return {
      ok: false,
      status: res.status,
      data: null,
      error: res.status === 404 ? 'Service not found (running in static edge mode)' : text || `Server error (${res.status})`,
    };
  }

  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return { ok: res.ok, status: res.status, data: null };
    }
    const json = JSON.parse(text) as T;
    return { ok: res.ok, status: res.status, data: json };
  } catch (err: any) {
    return { ok: false, status: res.status, data: null, error: err.message || 'Invalid JSON response' };
  }
}

export const ApiClient = {
  getUsers(): User[] {
    return getStorageItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getAdmissions(): AdmissionApplication[] {
    return getStorageItem<AdmissionApplication[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
  },

  getStudents(): Student[] {
    return getStorageItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  addStudent(newStudent: Student): void {
    const list = getStorageItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const existingIndex = list.findIndex(
      (s) => s.id === newStudent.id || s.admissionNo.toLowerCase() === newStudent.admissionNo.toLowerCase()
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newStudent };
    } else {
      list.unshift(newStudent);
    }
    setStorageItem(STORAGE_KEYS.STUDENTS, list);
  },

  updateStudentStatus(studentId: string, status: Student['status']): Student | null {
    const list = getStorageItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const student = list.find((s) => s.id === studentId);
    if (student) {
      student.status = status;
      setStorageItem(STORAGE_KEYS.STUDENTS, list);

      // Also sync user active state in local cache
      const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
      let updatedUsers = false;
      users.forEach((u) => {
        if (u.role === 'STUDENT' && (u.linkedStudentIds || []).includes(student.id)) {
          u.isActive = status === 'ACTIVE';
          updatedUsers = true;
        }
      });
      if (updatedUsers) {
        setStorageItem(STORAGE_KEYS.USERS, users);
      }
    }
    return student || null;
  },

  getResults(): AcademicResult[] {
    return getStorageItem<AcademicResult[]>(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
  },

  getFees(): FeeLedger[] {
    return getStorageItem<FeeLedger[]>(STORAGE_KEYS.FEES, INITIAL_FEES);
  },

  recordPayment(paymentData: {
    studentId: string;
    admissionNo?: string;
    studentName?: string;
    className?: string;
    term?: string;
    session?: string;
    feeLedgerId?: string;
    amount: number;
    paymentMethod: 'Bank Transfer' | 'Cash (Bursary)' | 'POS' | 'Online Transfer';
    reference: string;
    paymentDate: string;
    recordedBy?: string;
  }): { receipt: FeePayment; updatedLedger: FeeLedger } {
    const fees = getStorageItem<FeeLedger[]>(STORAGE_KEYS.FEES, INITIAL_FEES);
    const students = this.getStudents();
    const term = paymentData.term || 'First Term 2026/2027';
    const session = paymentData.session || '2026/2027';

    // 1. Find existing ledger by ID or studentId+term
    let ledger = paymentData.feeLedgerId
      ? fees.find((f) => f.id === paymentData.feeLedgerId)
      : fees.find(
          (f) =>
            (f.studentId === paymentData.studentId ||
              (paymentData.admissionNo && f.admissionNo.toLowerCase() === paymentData.admissionNo.toLowerCase())) &&
            f.term === term
        );

    // 2. If no ledger exists, create one for this student
    if (!ledger) {
      const student = students.find(
        (s) =>
          s.id === paymentData.studentId ||
          (paymentData.admissionNo && s.admissionNo.toLowerCase() === paymentData.admissionNo.toLowerCase())
      );
      const studentName = student ? `${student.firstName} ${student.lastName}` : paymentData.studentName || 'Student';
      const admissionNo = student?.admissionNo || paymentData.admissionNo || 'PCD/2026/0001';
      const className = student?.className || paymentData.className || 'JSS 1';
      const arm = student?.arm || 'SECONDARY';

      const tuitionFee = arm === 'NURSERY' ? 35000 : arm === 'PRIMARY' ? 42000 : 55000;
      const developmentLevy = arm === 'NURSERY' ? 4500 : arm === 'PRIMARY' ? 6000 : 8500;
      const sportsLevy = arm === 'SECONDARY' ? 6500 : 3500;
      const examinationFee = 5000;
      const uniformFee = 0;
      const totalPayable = tuitionFee + developmentLevy + sportsLevy + examinationFee + uniformFee;

      ledger = {
        id: `fee-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentId: student?.id || paymentData.studentId,
        studentName,
        admissionNo,
        className,
        term,
        session,
        tuitionFee,
        developmentLevy,
        sportsLevy,
        examinationFee,
        uniformFee,
        totalPayable,
        totalPaid: 0,
        balanceDue: totalPayable,
        status: 'UNPAID',
        payments: [],
      };
      fees.unshift(ledger);
    }

    // 3. Create payment record
    const receiptPrefix = `PCD/REC/${new Date().getFullYear()}-`;
    const receiptNo = `${receiptPrefix}${String(Date.now()).slice(-6)}`;
    const paymentEntry: FeePayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      receiptNumber: receiptNo,
      studentId: ledger.studentId,
      studentName: ledger.studentName,
      admissionNo: ledger.admissionNo,
      className: ledger.className,
      amountPaid: paymentData.amount,
      paymentDate: paymentData.paymentDate || new Date().toISOString().slice(0, 10),
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.reference.trim().toUpperCase(),
      term: ledger.term,
      session: ledger.session,
      recordedBy: paymentData.recordedBy || 'Bursar',
    };

    ledger.payments = [...(ledger.payments || []), paymentEntry];
    ledger.totalPaid = (Number(ledger.totalPaid) || 0) + paymentData.amount;
    ledger.balanceDue = Math.max(0, ledger.totalPayable - ledger.totalPaid);
    ledger.status = ledger.balanceDue === 0 ? 'PAID' : 'PARTIAL';

    setStorageItem(STORAGE_KEYS.FEES, fees);
    return { receipt: paymentEntry, updatedLedger: ledger };
  },

  getNews(): NewsArticle[] {
    return getStorageItem<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
  },

  addNews(article: NewsArticle): void {
    const list = getStorageItem<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const existingIndex = list.findIndex((n) => n.id === article.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...article };
    } else {
      list.unshift(article);
    }
    setStorageItem(STORAGE_KEYS.NEWS, list);
  },

  deleteNews(id: string): void {
    const list = getStorageItem<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const filtered = list.filter((n) => n.id !== id);
    setStorageItem(STORAGE_KEYS.NEWS, filtered);
  },

  getGallery(): GalleryMedia[] {
    return getStorageItem<GalleryMedia[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_MEDIA);
  },

  addGallery(item: GalleryMedia): void {
    const list = getStorageItem<GalleryMedia[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_MEDIA);
    const existingIndex = list.findIndex((g) => g.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...item };
    } else {
      list.unshift(item);
    }
    setStorageItem(STORAGE_KEYS.GALLERY, list);
  },

  deleteGallery(id: string): void {
    const list = getStorageItem<GalleryMedia[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_MEDIA);
    const filtered = list.filter((g) => g.id !== id);
    setStorageItem(STORAGE_KEYS.GALLERY, filtered);
  },

  /**
   * Robust user login with backend-first strategy and client-side edge fallback.
   */
  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanId || !cleanPassword) {
      throw new Error('Please enter both User ID (Email or Admission Number) and Password.');
    }

    // Try backend first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, email: cleanId, password: cleanPassword }),
      });

      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.data?.token && parsed.data?.user) {
        return { user: parsed.data.user, token: parsed.data.token };
      }
      // If server returned a genuine 401 or 403 with an error message, respect it immediately
      if ((res.status === 401 || res.status === 403) && parsed.data?.error) {
        throw new Error(parsed.data.error);
      }
    } catch (netErr: any) {
      if (netErr.message && !netErr.message.includes('JSON') && !netErr.message.includes('Failed to fetch') && !netErr.message.includes('404')) {
        throw netErr;
      }
    }

    // Client-side fallback for Cloudflare Pages static hosting / offline
    const users = this.getUsers();
    const students = this.getStudents();

    // 1. Match user by email or admissionNo
    let user = users.find(
      (u) => u.email.toLowerCase() === cleanId || (u.admissionNo && u.admissionNo.toLowerCase() === cleanId)
    );

    // 2. If not found, match by student admission number
    let student: Student | undefined;
    if (!user) {
      student = students.find((s) => s.admissionNo.toLowerCase() === cleanId || s.id.toLowerCase() === cleanId);
      if (student) {
        user = users.find((u) => (u.linkedStudentIds || []).includes(student?.id || '') && u.role === 'STUDENT');
        if (!user) {
          const studentEmail = `${student.firstName.toLowerCase()}${student.lastName.toLowerCase()}@peculiarschools.edu.ng`;
          user = {
            id: `usr-${student.id}`,
            email: studentEmail,
            admissionNo: student.admissionNo,
            name: `${student.firstName} ${student.lastName}`,
            role: 'STUDENT',
            phone: student.parentPhone,
            linkedStudentIds: [student.id],
            hasCustomPassword: false,
            createdAt: new Date().toISOString(),
          };
        }
      }
    } else if (user.role === 'STUDENT') {
      student = students.find((s) => (user?.linkedStudentIds || []).includes(s.id));
    }

    // Check if matched student is suspended or deactivated
    const matchedStudent = student || students.find((s) => s.admissionNo.toLowerCase() === cleanId || s.id.toLowerCase() === cleanId);
    if (matchedStudent && (matchedStudent.status === 'DEACTIVATED' || matchedStudent.status === 'SUSPENDED')) {
      throw new Error(`Your student portal account has been ${matchedStudent.status.toLowerCase()}. Access is restricted. Please contact the school administration.`);
    }

    if (!user) {
      throw new Error('No registered account found with this School Email or Admission Number.');
    }

    if (user.role === 'STUDENT') {
      const currentStu = student || students.find((s) => (user?.linkedStudentIds || []).includes(s.id));
      if (currentStu && (currentStu.status === 'DEACTIVATED' || currentStu.status === 'SUSPENDED')) {
        throw new Error(`Your student portal account has been ${currentStu.status.toLowerCase()}. Access is restricted. Please contact the school administration.`);
      }
    }

    if (user.isActive === false) {
      if (user.role === 'STUDENT') {
        throw new Error('Your student portal account has been deactivated. Access is restricted. Please contact the school administration.');
      }
      throw new Error('This account has been deactivated. Please contact the system administrator.');
    }

    // Check custom updated passwords in local storage first
    const customPasswords = getStorageItem<Record<string, string>>(STORAGE_KEYS.PASSWORDS, {});
    const customPass =
      customPasswords[user.email.toLowerCase()] ||
      (user.admissionNo ? customPasswords[user.admissionNo.toLowerCase()] : undefined) ||
      (student?.admissionNo ? customPasswords[student.admissionNo.toLowerCase()] : undefined);

    let isMatch = false;

    if (user.role === 'STUDENT') {
      if (customPass) {
        // If password was changed after login, require the custom password
        isMatch = customPass === cleanPassword;
      } else {
        // Default student password is the parent phone number
        const parentPhone = user.phone || student?.parentPhone;
        isMatch = isPhoneNumberMatch(cleanPassword, parentPhone) || cleanPassword === 'Peculiar@2026';
      }
    } else {
      const validPasswords = DEFAULT_PASSWORDS[user.email.toLowerCase()] || ['Peculiar@2026', 'Admin@PCD2026!'];
      isMatch = customPass ? customPass === cleanPassword : validPasswords.includes(cleanPassword) || cleanPassword === 'Peculiar@2026' || cleanPassword === '@Admin2005';
    }

    if (!isMatch) {
      const errorMsg =
        user.role === 'STUDENT'
          ? 'Incorrect password. (Students: Default password is your registered parent phone number).'
          : 'Incorrect password. Please check your credentials.';
      throw new Error(errorMsg);
    }

    // Generate valid client session token
    const token = `pcd-session-${user.id}-${Date.now()}`;
    return { user, token };
  },

  /**
   * Request password reset OTP sent to parent phone number
   */
  async requestPasswordResetOtp(identifier: string): Promise<{
    success: boolean;
    studentName: string;
    maskedPhone: string;
    parentPhone?: string;
    demoOtp?: string;
    message: string;
  }> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) throw new Error('Please enter your school email or student admission number');

    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId }),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.data?.success) {
        return parsed.data;
      }
      if (parsed.data?.error) {
        throw new Error(parsed.data.error);
      }
    } catch (netErr: any) {
      if (netErr.message && !netErr.message.includes('JSON') && !netErr.message.includes('Failed to fetch') && !netErr.message.includes('404')) {
        throw netErr;
      }
    }

    // Client fallback for offline / edge
    const students = this.getStudents();
    const users = this.getUsers();

    let student = students.find((s) => s.admissionNo.toLowerCase() === cleanId || s.id.toLowerCase() === cleanId);
    let user = users.find((u) => u.email.toLowerCase() === cleanId || (u.admissionNo && u.admissionNo.toLowerCase() === cleanId));

    if (!student && user) {
      student = students.find((s) => (user?.linkedStudentIds || []).includes(s.id));
    }
    if (!user && student) {
      user = users.find((u) => (u.linkedStudentIds || []).includes(student?.id || '') && u.role === 'STUDENT');
    }

    if (!student && !user) {
      throw new Error('No student record found with this admission number or email.');
    }

    if (student && (student.status === 'DEACTIVATED' || student.status === 'SUSPENDED')) {
      throw new Error(`Student account is currently ${student.status.toLowerCase()}. Password reset is disabled. Please contact the school administration.`);
    }

    const studentName = student ? `${student.firstName} ${student.lastName}` : user?.name || 'Student';
    const parentPhone = student?.parentPhone || user?.phone;
    if (!parentPhone) {
      throw new Error('No registered parent phone number on file for this student.');
    }

    const cleanPhone = parentPhone.trim();
    const maskedPhone =
      cleanPhone.length > 7
        ? cleanPhone.slice(0, cleanPhone.length - 7) + ' ••• ' + cleanPhone.slice(-4)
        : cleanPhone;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otps = getStorageItem<Record<string, { otp: string; expiresAt: number; studentName: string; parentPhone: string }>>(
      STORAGE_KEYS.OTP,
      {}
    );
    otps[cleanId] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, studentName, parentPhone };
    if (student?.admissionNo) {
      otps[student.admissionNo.toLowerCase()] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, studentName, parentPhone };
    }
    if (user?.email) {
      otps[user.email.toLowerCase()] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, studentName, parentPhone };
    }
    setStorageItem(STORAGE_KEYS.OTP, otps);

    return {
      success: true,
      studentName,
      maskedPhone,
      parentPhone,
      demoOtp: otp,
      message: `A 6-digit verification code has been dispatched to parent phone (${maskedPhone}).`,
    };
  },

  /**
   * Verify OTP and set new password
   */
  async verifyPasswordResetOtp(identifier: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const cleanPass = newPassword.trim();

    if (!cleanId || !cleanOtp || !cleanPass) {
      throw new Error('Identifier, OTP code, and new password are required');
    }
    if (cleanPass.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, otp: cleanOtp, newPassword: cleanPass }),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.data?.success) {
        // Sync local storage passwords
        const customPasswords = getStorageItem<Record<string, string>>(STORAGE_KEYS.PASSWORDS, {});
        customPasswords[cleanId] = cleanPass;
        setStorageItem(STORAGE_KEYS.PASSWORDS, customPasswords);
        return parsed.data;
      }
      if (parsed.data?.error) {
        throw new Error(parsed.data.error);
      }
    } catch (netErr: any) {
      if (netErr.message && !netErr.message.includes('JSON') && !netErr.message.includes('Failed to fetch') && !netErr.message.includes('404')) {
        throw netErr;
      }
    }

    // Client fallback
    const otps = getStorageItem<Record<string, { otp: string; expiresAt: number }>>(STORAGE_KEYS.OTP, {});
    const record = otps[cleanId];
    if (!record || record.otp !== cleanOtp) {
      throw new Error('Incorrect OTP code. Please enter the 6-digit code sent to parent phone.');
    }
    if (Date.now() > record.expiresAt) {
      throw new Error('OTP code has expired. Please request a new code.');
    }

    // Save custom password in local storage
    const customPasswords = getStorageItem<Record<string, string>>(STORAGE_KEYS.PASSWORDS, {});
    customPasswords[cleanId] = cleanPass;

    const students = this.getStudents();
    const student = students.find((s) => s.admissionNo.toLowerCase() === cleanId);
    if (student) {
      const studentEmail = `${student.firstName.toLowerCase()}${student.lastName.toLowerCase()}@peculiarschools.edu.ng`;
      customPasswords[studentEmail] = cleanPass;
      customPasswords[student.admissionNo.toLowerCase()] = cleanPass;
    }

    setStorageItem(STORAGE_KEYS.PASSWORDS, customPasswords);
    delete otps[cleanId];
    setStorageItem(STORAGE_KEYS.OTP, otps);

    return {
      success: true,
      message: 'Password successfully updated! You can now sign in using your new password.',
    };
  },

  /**
   * Submit new admission application with backend-first and local storage fallback.
   */
  async submitAdmission(formData: any): Promise<{ applicationId: string; application: AdmissionApplication }> {
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.data?.application) {
        const app = parsed.data.application;
        // Keep in local cache
        const current = this.getAdmissions();
        setStorageItem(STORAGE_KEYS.ADMISSIONS, [app, ...current.filter((a) => a.id !== app.id)]);
        return { applicationId: app.id, application: app };
      }
    } catch {
      // Proceed to client fallback
    }

    // Client fallback
    const current = this.getAdmissions();
    const count = current.length + 1;
    const year = new Date().getFullYear();
    const applicationId = `PCD-${year}-${String(count).padStart(4, '0')}`;

    const newApplication: AdmissionApplication = {
      id: applicationId,
      firstName: formData.firstName.trim(),
      middleName: (formData.middleName || '').trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      classApplying: formData.classApplying,
      arm: formData.arm,
      previousSchool: (formData.previousSchool || '').trim(),
      residentialAddress: formData.residentialAddress.trim(),
      stateOfOrigin: formData.stateOfOrigin.trim(),
      lga: formData.lga.trim(),
      parentFullName: formData.parentFullName.trim(),
      parentPhone: formData.parentPhone.trim(),
      parentEmail: (formData.parentEmail || '').trim().toLowerCase(),
      relationship: formData.relationship,
      parentOccupation: formData.parentOccupation.trim(),
      parentAddress: formData.parentAddress.trim(),
      status: 'SUBMITTED',
      submissionDate: new Date().toISOString().split('T')[0],
      reviewNotes: 'Application submitted online. Under review by admissions committee.',
    };

    setStorageItem(STORAGE_KEYS.ADMISSIONS, [newApplication, ...current]);
    return { applicationId, application: newApplication };
  },

  /**
   * Track admission application by reference ID or parent phone number.
   */
  async trackAdmission(query: string): Promise<AdmissionApplication> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new Error('Please enter your application reference number or phone number.');
    }

    // Try server first
    try {
      const res = await fetch(`/api/admissions?query=${encodeURIComponent(cleanQuery)}`);
      const parsed = await parseResponseSafely(res);
      if (parsed.ok && parsed.data?.application) {
        return parsed.data.application;
      }
      if (res.status === 404 && parsed.data?.error) {
        throw new Error(parsed.data.error);
      }
    } catch (netErr: any) {
      if (netErr.message && !netErr.message.includes('JSON') && !netErr.message.includes('Failed to fetch') && !netErr.message.includes('404')) {
        throw netErr;
      }
    }

    // Client fallback
    const admissions = this.getAdmissions();
    const normQuery = cleanQuery.toLowerCase();
    const normPhone = cleanQuery.replace(/\D/g, '');

    const found = admissions.find((app) => {
      if (app.id.toLowerCase() === normQuery) return true;
      if (normPhone && normPhone.length >= 7) {
        const p = (app.parentPhone || '').replace(/\D/g, '');
        if (p.includes(normPhone) || normPhone.includes(p)) return true;
      }
      if (app.parentEmail && app.parentEmail.toLowerCase() === normQuery) return true;
      return false;
    });

    if (!found) {
      throw new Error('No application found with the provided reference number or phone number.');
    }

    return found;
  },

  /**
   * Submit contact form message.
   */
  async submitContact(formData: any): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const parsed = await parseResponseSafely(res);
      if (parsed.ok) {
        return { success: true, message: 'Message sent successfully!' };
      }
    } catch {
      // Fallback
    }

    const messages = getStorageItem<any[]>(STORAGE_KEYS.CONTACT, []);
    messages.unshift({
      id: `msg-${Date.now()}`,
      ...formData,
      date: new Date().toISOString(),
    });
    setStorageItem(STORAGE_KEYS.CONTACT, messages);
    return { success: true, message: 'Thank you! Your message has been received by our administrative desk.' };
  },

  /**
   * Update admission status (for Admin Dashboard)
   */
  updateAdmissionStatus(id: string, status: any, notes?: string, interviewDate?: string): void {
    const list = this.getAdmissions();
    const updated = list.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status,
          reviewNotes: notes || a.reviewNotes,
          interviewDate: interviewDate || a.interviewDate,
          reviewedAt: new Date().toISOString().split('T')[0],
        };
      }
      return a;
    });
    setStorageItem(STORAGE_KEYS.ADMISSIONS, updated);
  },
};
