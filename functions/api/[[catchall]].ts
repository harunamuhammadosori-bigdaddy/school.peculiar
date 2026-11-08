import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_RESULTS,
  INITIAL_ADMISSIONS,
  INITIAL_FEES,
  INITIAL_NEWS,
} from '../../src/data/mockData';
import { INITIAL_GALLERY_MEDIA } from '../../src/data/mediaData';
import { Student, NewsArticle, GalleryMedia, FeeLedger, FeePayment } from '../../src/types';

// Simple in-memory fallback for the Edge isolate
let admissions = [...INITIAL_ADMISSIONS];
let users = [...INITIAL_USERS];
let students = [...INITIAL_STUDENTS];
let edgeNews: NewsArticle[] = [...INITIAL_NEWS];
let edgeGallery: GalleryMedia[] = [...INITIAL_GALLERY_MEDIA];
let edgeFees: FeeLedger[] = [...INITIAL_FEES];
const edgeStudentStatuses: Record<string, Student['status']> = {};

const DEMO_PASSWORDS: Record<string, string[]> = {
  'admin@peculiarschools.edu.ng': ['Peculiar@2026', 'Admin@PCD2026!', 'admin123', 'admin'],
  'harunamuhammadosori@gmail.com': ['@Admin2005', 'Admin@PCD2026!', '@Osori2005', 'Osori@2005'],
  'principal@peculiarschools.edu.ng': ['Peculiar@2026'],
  'teacher@peculiarschools.edu.ng': ['Peculiar@2026'],
  'accountant@peculiarschools.edu.ng': ['Peculiar@2026'],
  'parent@peculiarschools.edu.ng': ['Peculiar@2026'],
  'applicant@peculiarschools.edu.ng': ['Peculiar@2026'],
  'student@peculiarschools.edu.ng': ['Peculiar@2026'],
};

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 1. Health check
  if (pathname === '/api/health') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        school: 'Peculiar College Doma',
        academicSession: '2026/2027',
        edge: 'cloudflare-pages',
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );
  }

function isPhoneNumberMatch(input: string, targetPhone?: string): boolean {
  if (!input || !targetPhone) return false;
  const cleanInput = input.trim();
  const cleanTarget = targetPhone.trim();
  if (cleanInput === cleanTarget) return true;
  const inputDigits = cleanInput.replace(/\D/g, '');
  const targetDigits = cleanTarget.replace(/\D/g, '');
  if (!inputDigits || !targetDigits) return false;
  if (inputDigits === targetDigits) return true;
  const inputLast10 = inputDigits.slice(-10);
  const targetLast10 = targetDigits.slice(-10);
  return inputLast10.length >= 8 && targetLast10.length >= 8 && inputLast10 === targetLast10;
}

const edgeOtps: Record<string, { otp: string; expiresAt: number; studentName: string; parentPhone: string }> = {};
const edgeCustomPasswords: Record<string, string> = {};

  // 2. Authentication: POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await request.json();
      const identifier = (body.identifier || body.email || '').trim().toLowerCase();
      const password = (body.password || '').trim();

      if (!identifier || !password) {
        return new Response(JSON.stringify({ error: 'School email/admission number and password are required.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      let user = users.find((u) => u.email.toLowerCase() === identifier || (u.admissionNo && u.admissionNo.toLowerCase() === identifier));
      let student = students.find((s) => s.admissionNo.toLowerCase() === identifier || s.id.toLowerCase() === identifier);

      if (!user && student) {
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
          users.push(user);
        }
      } else if (user && user.role === 'STUDENT' && !student) {
        student = students.find((s) => (user?.linkedStudentIds || []).includes(s.id));
      }

      if (!user) {
        return new Response(JSON.stringify({ error: 'No account found with this email or admission number.' }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      if (user.isActive === false) {
        return new Response(
          JSON.stringify({
            error: user.role === 'STUDENT'
              ? 'Your student portal account has been deactivated. Access is restricted. Please contact the school administration.'
              : 'This account has been deactivated. Access is restricted. Please contact the school administration.',
          }),
          { status: 403, headers: corsHeaders }
        );
      }

      const customPass = edgeCustomPasswords[identifier] || edgeCustomPasswords[user.email.toLowerCase()] || (user.admissionNo ? edgeCustomPasswords[user.admissionNo.toLowerCase()] : undefined);

      let isMatch = false;
      if (user.role === 'STUDENT') {
        const studentStatus = student
          ? edgeStudentStatuses[student.id] || edgeStudentStatuses[student.admissionNo.toLowerCase()] || student.status
          : 'ACTIVE';
        if (studentStatus === 'DEACTIVATED' || studentStatus === 'SUSPENDED') {
          return new Response(
            JSON.stringify({
              error: `Your student portal account has been ${studentStatus.toLowerCase()}. Access is restricted. Please contact the school administration.`,
            }),
            { status: 403, headers: corsHeaders }
          );
        }
        if (customPass) {
          isMatch = customPass === password;
        } else {
          const parentPhone = user.phone || student?.parentPhone;
          isMatch = isPhoneNumberMatch(password, parentPhone) || password === 'Peculiar@2026';
        }
      } else {
        const validPass = DEMO_PASSWORDS[user.email.toLowerCase()] || ['Peculiar@2026', 'Admin@PCD2026!'];
        isMatch = customPass ? customPass === password : validPass.includes(password) || password === 'Peculiar@2026' || password === '@Admin2005';
      }

      if (!isMatch) {
        const errorMsg =
          user.role === 'STUDENT'
            ? 'Incorrect password. (Students: Default password is your parent phone number).'
            : 'Incorrect email or password.';
        return new Response(JSON.stringify({ error: errorMsg }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const token = `pcd-token-${user.id}-${Date.now()}`;
      return new Response(JSON.stringify({ success: true, user, token }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid login request body.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  // Request password reset OTP
  if (pathname === '/api/auth/forgot-password/request-otp' && method === 'POST') {
    try {
      const body = await request.json();
      const identifier = (body.identifier || body.email || '').trim().toLowerCase();
      if (!identifier) {
        return new Response(JSON.stringify({ error: 'Please enter your school email or student admission number.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      let student = students.find((s) => s.admissionNo.toLowerCase() === identifier || s.id.toLowerCase() === identifier);
      let user = users.find((u) => u.email.toLowerCase() === identifier || (u.admissionNo && u.admissionNo.toLowerCase() === identifier));

      if (!student && user) {
        student = students.find((s) => (user?.linkedStudentIds || []).includes(s.id));
      }

      if (!student && !user) {
        return new Response(JSON.stringify({ error: 'No student found with this admission number or email.' }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      const studentStatus = student
        ? edgeStudentStatuses[student.id] || edgeStudentStatuses[student.admissionNo.toLowerCase()] || student.status
        : 'ACTIVE';
      if (studentStatus === 'DEACTIVATED' || studentStatus === 'SUSPENDED') {
        return new Response(
          JSON.stringify({
            error: `Student account is currently ${studentStatus.toLowerCase()}. Password reset is disabled. Please contact the school administration.`,
          }),
          { status: 403, headers: corsHeaders }
        );
      }

      const studentName = student ? `${student.firstName} ${student.lastName}` : user?.name || 'Student';
      const parentPhone = student?.parentPhone || user?.phone;
      if (!parentPhone) {
        return new Response(JSON.stringify({ error: 'No parent phone number registered for this student.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const cleanPhone = parentPhone.trim();
      const maskedPhone =
        cleanPhone.length > 7
          ? cleanPhone.slice(0, cleanPhone.length - 7) + ' ••• ' + cleanPhone.slice(-4)
          : cleanPhone;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      edgeOtps[identifier] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, studentName, parentPhone };
      if (student?.admissionNo) {
        edgeOtps[student.admissionNo.toLowerCase()] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, studentName, parentPhone };
      }
      if (user?.email) {
        edgeOtps[user.email.toLowerCase()] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, studentName, parentPhone };
      }

      return new Response(
        JSON.stringify({
          success: true,
          studentName,
          maskedPhone,
          parentPhone,
          demoOtp: otp,
          message: `A 6-digit verification code has been dispatched to parent phone (${maskedPhone}).`,
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to process OTP request.' }), { status: 400, headers: corsHeaders });
    }
  }

  // Verify OTP and update password
  if (pathname === '/api/auth/forgot-password/verify-otp' && method === 'POST') {
    try {
      const body = await request.json();
      const identifier = (body.identifier || body.email || '').trim().toLowerCase();
      const otp = (body.otp || '').trim();
      const newPassword = (body.newPassword || '').trim();

      if (!identifier || !otp || !newPassword) {
        return new Response(JSON.stringify({ error: 'Identifier, OTP code, and new password are required.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      if (newPassword.length < 6) {
        return new Response(JSON.stringify({ error: 'New password must be at least 6 characters.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const record = edgeOtps[identifier];
      if (!record || record.otp !== otp) {
        return new Response(JSON.stringify({ error: 'Incorrect OTP code. Please enter the 6-digit code sent to parent phone.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      if (Date.now() > record.expiresAt) {
        return new Response(JSON.stringify({ error: 'OTP code has expired. Please request a new code.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      edgeCustomPasswords[identifier] = newPassword;
      const student = INITIAL_STUDENTS.find((s) => s.admissionNo.toLowerCase() === identifier);
      if (student) {
        const studentEmail = `${student.firstName.toLowerCase()}${student.lastName.toLowerCase()}@peculiarschools.edu.ng`;
        edgeCustomPasswords[studentEmail] = newPassword;
        edgeCustomPasswords[student.admissionNo.toLowerCase()] = newPassword;
      }

      delete edgeOtps[identifier];

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Password successfully updated! You can now log in with your new password.',
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to verify OTP.' }), { status: 400, headers: corsHeaders });
    }
  }

  // 3. Admissions: GET /api/admissions (public query tracking or list)
  if (pathname === '/api/admissions' && method === 'GET') {
    const query = (url.searchParams.get('query') || '').trim();
    if (query) {
      const normQuery = query.toLowerCase();
      const normPhone = query.replace(/\D/g, '');
      const matched = admissions.find((a) => {
        if (a.id.toLowerCase() === normQuery) return true;
        if (normPhone && normPhone.length >= 7) {
          const p = (a.parentPhone || '').replace(/\D/g, '');
          if (p.includes(normPhone) || normPhone.includes(p)) return true;
        }
        if (a.parentEmail && a.parentEmail.toLowerCase() === normQuery) return true;
        return false;
      });

      if (!matched) {
        return new Response(
          JSON.stringify({ error: 'No application found with the provided reference number or phone number.' }),
          { status: 404, headers: corsHeaders }
        );
      }
      return new Response(JSON.stringify({ success: true, application: matched }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ admissions }), { status: 200, headers: corsHeaders });
  }

  // 4. Admissions: POST /api/admissions (new application)
  if (pathname === '/api/admissions' && method === 'POST') {
    try {
      const data = await request.json();
      const count = admissions.length + 1;
      const year = new Date().getFullYear();
      const newId = `PCD-${year}-${String(count).padStart(4, '0')}`;

      const newApp = {
        ...data,
        id: newId,
        status: 'SUBMITTED',
        submissionDate: new Date().toISOString().split('T')[0],
        reviewNotes: 'Application submitted online. Under review by admissions committee.',
      };

      admissions.unshift(newApp);

      return new Response(
        JSON.stringify({
          success: true,
          applicationId: newId,
          application: newApp,
          message: `Application submitted successfully! Reference number: ${newId}.`,
        }),
        { status: 201, headers: corsHeaders }
      );
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to process application.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  // 5. News CMS
  if (pathname === '/api/news' && method === 'GET') {
    return new Response(JSON.stringify({ news: edgeNews }), { status: 200, headers: corsHeaders });
  }

  if (pathname === '/api/news' && method === 'POST') {
    try {
      const data = await request.json();
      const newArticle: NewsArticle = {
        id: `news-${Date.now()}`,
        title: String(data.title || '').trim(),
        slug: String(data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: String(data.excerpt || '').trim(),
        content: String(data.content || '').trim(),
        category: data.category || 'Announcement',
        featuredImage: data.featuredImage || '/school-media/front-view-gate.jpg',
        author: 'School Administration',
        authorRole: 'Admin',
        publishDate: new Date().toISOString().split('T')[0],
        published: data.published ?? true,
        isImportantNotice: Boolean(data.isImportantNotice),
      };
      edgeNews.unshift(newArticle);
      return new Response(JSON.stringify({ article: newArticle }), { status: 201, headers: corsHeaders });
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to create news article' }), { status: 400, headers: corsHeaders });
    }
  }

  if (pathname.startsWith('/api/news/') && method === 'DELETE') {
    const newsId = pathname.replace('/api/news/', '').trim();
    edgeNews = edgeNews.filter((n) => n.id !== newsId);
    return new Response(JSON.stringify({ success: true, message: 'Article permanently deleted' }), { status: 200, headers: corsHeaders });
  }

  // 6. Gallery CMS
  if (pathname === '/api/gallery' && method === 'GET') {
    return new Response(JSON.stringify({ gallery: edgeGallery }), { status: 200, headers: corsHeaders });
  }

  if (pathname === '/api/gallery' && method === 'POST') {
    try {
      const data = await request.json();
      const newItem: GalleryMedia = {
        id: `gal-${Date.now()}`,
        title: String(data.title || '').trim(),
        category: data.category || 'School Life',
        description: String(data.description || '').trim(),
        imageUrl: data.imageUrl || '/sport.jpg',
        date: new Date().toISOString().split('T')[0],
        published: data.published ?? true,
        featured: Boolean(data.featured),
      };
      edgeGallery.unshift(newItem);
      return new Response(JSON.stringify({ item: newItem }), { status: 201, headers: corsHeaders });
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to upload photo to gallery' }), { status: 400, headers: corsHeaders });
    }
  }

  if (pathname.startsWith('/api/gallery/') && method === 'DELETE') {
    const galleryId = pathname.replace('/api/gallery/', '').trim();
    edgeGallery = edgeGallery.filter((g) => g.id !== galleryId);
    return new Response(JSON.stringify({ success: true, message: 'Photo permanently deleted' }), { status: 200, headers: corsHeaders });
  }

  // 7. Students
  if (pathname === '/api/students' && method === 'GET') {
    const currentStudents = students.map((s) => ({
      ...s,
      status: edgeStudentStatuses[s.id] || edgeStudentStatuses[s.admissionNo.toLowerCase()] || s.status,
    }));
    return new Response(JSON.stringify({ students: currentStudents }), { status: 200, headers: corsHeaders });
  }

  if (pathname === '/api/students' && method === 'POST') {
    try {
      const data = await request.json();
      const clean = (val: unknown) => typeof val === 'string' ? val.trim() : '';
      const firstName = clean(data.firstName);
      const lastName = clean(data.lastName);
      const parentName = clean(data.parentName);
      const parentPhone = clean(data.parentPhone);
      const classId = clean(data.classId);
      const schoolClass = INITIAL_CLASSES.find((c) => c.id === classId) || INITIAL_CLASSES[0];
      const admissionNo = clean(data.admissionNo) || `PCD/${new Date().getFullYear()}/${String(students.length + 1).padStart(4, '0')}`;

      if (!firstName || !lastName || !parentName || !parentPhone) {
        return new Response(
          JSON.stringify({ error: 'Student name, guardian contact, and a valid class are required.' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const newStudent: Student = {
        id: `stu-${Date.now()}`,
        admissionNo: admissionNo.toUpperCase(),
        firstName,
        lastName,
        arm: schoolClass.arm,
        classId: schoolClass.id,
        className: schoolClass.name,
        parentId: '',
        parentName,
        parentPhone,
        parentEmail: clean(data.parentEmail),
        address: clean(data.address),
        gender: data.gender === 'Female' ? 'Female' : 'Male',
        dateOfBirth: clean(data.dateOfBirth) || '2015-01-01',
        sportsHouse: data.sportsHouse || 'Purple (Faith)',
        status: 'ACTIVE',
        enrolledDate: new Date().toISOString().split('T')[0],
      };

      const normalizedBaseName = `${firstName}${lastName}`.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const generatedEmail = `${normalizedBaseName}@peculiarschools.edu.ng`;

      students.unshift(newStudent);

      return new Response(
        JSON.stringify({
          student: newStudent,
          studentPortal: {
            email: generatedEmail,
            temporaryPassword: parentPhone,
          },
        }),
        { status: 201, headers: corsHeaders }
      );
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to process student enrollment.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  if (pathname.startsWith('/api/students/') && pathname.endsWith('/status') && method === 'PATCH') {
    try {
      const body = await request.json();
      const status = body.status as Student['status'];
      const studentId = pathname.replace('/api/students/', '').replace('/status', '').trim();
      edgeStudentStatuses[studentId] = status;

      const stu = students.find((s) => s.id === studentId || s.admissionNo.toLowerCase() === studentId.toLowerCase());
      if (stu) {
        stu.status = status;
        edgeStudentStatuses[stu.id] = status;
        edgeStudentStatuses[stu.admissionNo.toLowerCase()] = status;
        users.forEach((u) => {
          if (u.role === 'STUDENT' && (u.linkedStudentIds || []).includes(stu.id)) {
            u.isActive = status === 'ACTIVE';
          }
        });
      }

      return new Response(
        JSON.stringify({ success: true, status, student: stu, message: `Status updated to ${status}.` }),
        { status: 200, headers: corsHeaders }
      );
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to update status.' }), { status: 400, headers: corsHeaders });
    }
  }

  if (pathname.startsWith('/api/students/') && method === 'PATCH') {
    try {
      const body = await request.json();
      const studentId = pathname.replace('/api/students/', '').trim();
      const stu = students.find((s) => s.id === studentId || s.admissionNo.toLowerCase() === studentId.toLowerCase());
      if (stu) {
        Object.assign(stu, body);
      }
      return new Response(
        JSON.stringify({ success: true, student: stu || body }),
        { status: 200, headers: corsHeaders }
      );
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to update student.' }), { status: 400, headers: corsHeaders });
    }
  }

  // 8. Results: GET /api/results
  if (pathname === '/api/results' && method === 'GET') {
    return new Response(JSON.stringify({ results: INITIAL_RESULTS }), { status: 200, headers: corsHeaders });
  }

  // 9. Fees CMS & Bursary
  if (pathname === '/api/fees' && method === 'GET') {
    return new Response(JSON.stringify({ fees: edgeFees }), { status: 200, headers: corsHeaders });
  }

  if (pathname === '/api/fees/record-payment' && method === 'POST') {
    try {
      const data = await request.json();
      const studentId = String(data.studentId || '').trim();
      const admissionNo = String(data.admissionNo || '').trim();
      const targetTerm = String(data.term || 'First Term 2026/2027').trim();
      const targetSession = String(data.session || '2026/2027').trim();
      const amountPaid = Number(data.amount);
      const paymentMethod = data.paymentMethod || 'Bank Transfer';
      const reference = String(data.reference || `PCD-TXN-${Date.now().toString().slice(-6)}`).trim().toUpperCase();
      const paymentDate = String(data.paymentDate || new Date().toISOString().slice(0, 10));

      if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
        return new Response(JSON.stringify({ error: 'Invalid payment amount' }), { status: 400, headers: corsHeaders });
      }

      let ledger = data.feeLedgerId
        ? edgeFees.find((f) => f.id === data.feeLedgerId)
        : edgeFees.find(
            (f) =>
              (f.studentId === studentId ||
                (admissionNo && f.admissionNo.toLowerCase() === admissionNo.toLowerCase())) &&
              f.term === targetTerm
          );

      if (!ledger && studentId) {
        ledger = edgeFees.find((f) => f.studentId === studentId);
      }

      if (!ledger) {
        const student = students.find(
          (s) => s.id === studentId || (admissionNo && s.admissionNo.toLowerCase() === admissionNo.toLowerCase())
        );
        if (!student) {
          return new Response(JSON.stringify({ error: 'Active student record not found' }), { status: 404, headers: corsHeaders });
        }

        const arm = student.arm || 'SECONDARY';
        const tuitionFee = arm === 'NURSERY' ? 35000 : arm === 'PRIMARY' ? 42000 : 55000;
        const developmentLevy = arm === 'NURSERY' ? 4500 : arm === 'PRIMARY' ? 6000 : 8500;
        const sportsLevy = arm === 'SECONDARY' ? 6500 : 3500;
        const examinationFee = 5000;
        const uniformFee = 0;
        const totalPayable = tuitionFee + developmentLevy + sportsLevy + examinationFee + uniformFee;

        ledger = {
          id: `fee-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNo: student.admissionNo,
          className: student.className,
          term: targetTerm,
          session: targetSession,
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
        edgeFees.unshift(ledger);
      }

      const receiptYear = new Date().getFullYear();
      const receiptNo = `PCD/REC/${receiptYear}-${String(Date.now()).slice(-6)}`;
      const paymentEntry: FeePayment = {
        id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        receiptNumber: receiptNo,
        studentId: ledger.studentId,
        studentName: ledger.studentName,
        admissionNo: ledger.admissionNo,
        className: ledger.className,
        amountPaid,
        paymentDate,
        paymentMethod,
        transactionReference: reference,
        term: ledger.term,
        session: ledger.session,
        recordedBy: 'School Bursar',
      };

      ledger.payments = [...(ledger.payments || []), paymentEntry];
      ledger.totalPaid = (Number(ledger.totalPaid) || 0) + amountPaid;
      ledger.balanceDue = Math.max(0, ledger.totalPayable - ledger.totalPaid);
      ledger.status = ledger.balanceDue === 0 ? 'PAID' : 'PARTIAL';

      return new Response(JSON.stringify({ success: true, receipt: paymentEntry, updatedLedger: ledger }), {
        status: 201,
        headers: corsHeaders,
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to record fee payment' }), { status: 400, headers: corsHeaders });
    }
  }

  // 10. Contact: POST /api/contact
  if (pathname === '/api/contact' && method === 'POST') {
    return new Response(
      JSON.stringify({ success: true, message: 'Message received. We will respond promptly.' }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Default fallback for any other /api/* request
  return new Response(JSON.stringify({ status: 'ok', endpoint: pathname }), {
    status: 200,
    headers: corsHeaders,
  });
}
