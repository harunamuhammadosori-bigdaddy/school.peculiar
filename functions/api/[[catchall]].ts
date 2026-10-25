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

// Simple in-memory fallback for the Edge isolate
let admissions = [...INITIAL_ADMISSIONS];
let users = [...INITIAL_USERS];

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

  // 2. Authentication: POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await request.json();
      const email = (body.email || '').trim().toLowerCase();
      const password = (body.password || '').trim();

      const user = users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        return new Response(JSON.stringify({ error: 'No account found with this email address.' }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const validPass = DEMO_PASSWORDS[email] || ['Peculiar@2026', 'Admin@PCD2026!'];
      if (!validPass.includes(password) && password !== 'Peculiar@2026' && password !== '@Admin2005') {
        return new Response(JSON.stringify({ error: 'Incorrect email or password.' }), {
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

  // 5. News: GET /api/news
  if (pathname === '/api/news' && method === 'GET') {
    return new Response(JSON.stringify({ news: INITIAL_NEWS }), { status: 200, headers: corsHeaders });
  }

  // 6. Gallery: GET /api/gallery
  if (pathname === '/api/gallery' && method === 'GET') {
    return new Response(JSON.stringify({ gallery: INITIAL_GALLERY_MEDIA }), { status: 200, headers: corsHeaders });
  }

  // 7. Students: GET /api/students
  if (pathname === '/api/students' && method === 'GET') {
    return new Response(JSON.stringify({ students: INITIAL_STUDENTS }), { status: 200, headers: corsHeaders });
  }

  // 8. Results: GET /api/results
  if (pathname === '/api/results' && method === 'GET') {
    return new Response(JSON.stringify({ results: INITIAL_RESULTS }), { status: 200, headers: corsHeaders });
  }

  // 9. Fees: GET /api/fees
  if (pathname === '/api/fees' && method === 'GET') {
    return new Response(JSON.stringify({ fees: INITIAL_FEES }), { status: 200, headers: corsHeaders });
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
