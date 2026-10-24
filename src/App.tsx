import React, { useState, useEffect } from 'react';
import {
  User,
  Student,
  AdmissionApplication,
  AcademicResult,
  FeeLedger,
  NewsArticle,
  GalleryMedia,
  ContactMessage,
  AuditLog,
  FeePayment,
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_ADMISSIONS,
  INITIAL_RESULTS,
  INITIAL_FEES,
  INITIAL_NEWS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { INITIAL_GALLERY_MEDIA } from './data/mediaData';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Views
import { HomeView } from './components/views/HomeView';
import { AboutView } from './components/views/AboutView';
import { AcademicsView } from './components/views/AcademicsView';
import { AdmissionsView } from './components/views/AdmissionsView';
import { GalleryView } from './components/views/GalleryView';
import { NewsView } from './components/views/NewsView';
import { ContactView } from './components/views/ContactView';

// Portal & Modals
import { ParentPortal } from './components/portal/ParentPortal';
import { StudentPortal } from './components/portal/StudentPortal';
import { ApplicantPortal } from './components/portal/ApplicantPortal';
import { AdminDashboard } from './components/portal/AdminDashboard';
import { LoginModal } from './components/auth/LoginModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { ReportCardModal } from './components/portal/ReportCardModal';
import { ReceiptModal } from './components/portal/ReceiptModal';
import { AiAssistantModal } from './components/portal/AiAssistantModal';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<string>('home');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals
  const [activeReportCard, setActiveReportCard] = useState<AcademicResult | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);
  const [selectedGalleryMedia, setSelectedGalleryMedia] = useState<GalleryMedia | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Application Data States
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(INITIAL_ADMISSIONS);
  const [results, setResults] = useState<AcademicResult[]>(INITIAL_RESULTS);
  const [fees, setFees] = useState<FeeLedger[]>(INITIAL_FEES);
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [gallery, setGallery] = useState<GalleryMedia[]>(INITIAL_GALLERY_MEDIA);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(INITIAL_CONTACT_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['home', 'about', 'academics', 'admissions', 'gallery', 'news', 'contact', 'portal'].includes(hash)) {
        setActiveView(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore auth from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pcd_user');
    const savedToken = localStorage.getItem('pcd_token');
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setAuthToken(savedToken);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
  }, []);

  // Fetch dynamic data from API
  const refreshAllData = async () => {
    try {
      // News
      fetch('/api/news')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setNews(data.news || (Array.isArray(data) ? data : [])))
        .catch(() => {});

      // Gallery
      fetch('/api/gallery')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setGallery(data.gallery || (Array.isArray(data) ? data : [])))
        .catch(() => {});

      // Authenticated endpoints
      if (authToken) {
        const authHeaders = { Authorization: `Bearer ${authToken}` };
        const isAdminPrivilegedRole = currentUser && ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'].includes(currentUser.role);
        const canViewFinance = currentUser && ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'PARENT', 'STUDENT'].includes(currentUser.role);

        // Admissions
        if (isAdminPrivilegedRole || currentUser?.role === 'APPLICANT') {
          fetch('/api/admissions', { headers: authHeaders })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setAdmissions(data.admissions || []))
            .catch(() => {});
        }

        // Students
        fetch('/api/students', { headers: authHeaders })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data && setStudents(data.students || []))
          .catch(() => {});

        // Results
        fetch('/api/results', { headers: authHeaders })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data && setResults(data.results || []))
          .catch(() => {});

        // Fees
        if (canViewFinance) {
          fetch('/api/fees', { headers: authHeaders })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setFees(data.fees || []))
            .catch(() => {});
        }

        // Contact messages / audit logs are restricted to admin-level roles
        if (isAdminPrivilegedRole) {
          fetch('/api/contact/messages', { headers: authHeaders })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setContactMessages(data.messages || []))
            .catch(() => {});

          fetch('/api/audit-logs', { headers: authHeaders })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setAuditLogs(data.auditLogs || []))
            .catch(() => {});
        }
      }
    } catch (e) {
      console.warn('API sync fallback to seeded cache', e);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [authToken]);

  // Handle Login
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('pcd_user', JSON.stringify(user));
    localStorage.setItem('pcd_token', token);
    setIsLoginModalOpen(false);
    handleNavigate('portal');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken('');
    localStorage.removeItem('pcd_user');
    localStorage.removeItem('pcd_token');
    handleNavigate('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-amber-300">
      {/* Top Navigation */}
      <Navbar
        currentView={activeView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            newsArticles={news}
            galleryItems={gallery}
            onSelectPhoto={setSelectedGalleryMedia}
            news={news}
            gallery={gallery}
            onSelectGalleryItem={setSelectedGalleryMedia}
          />
        )}

        {activeView === 'about' && <AboutView onNavigate={handleNavigate} />}

        {activeView === 'academics' && <AcademicsView onNavigate={handleNavigate} />}

        {activeView === 'admissions' && (
          <AdmissionsView
            onNavigate={handleNavigate}
            onAdmissionSubmitted={refreshAllData}
          />
        )}

        {activeView === 'gallery' && (
          <GalleryView
            mediaItems={gallery}
            selectedItem={selectedGalleryMedia}
            onSelectItem={setSelectedGalleryMedia}
          />
        )}

        {activeView === 'news' && <NewsView articles={news} />}

        {activeView === 'contact' && <ContactView />}

        {activeView === 'portal' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!currentUser ? (
              <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-black text-xl">
                  🔒
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  School Portal Authentication Required
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Please log in to access confidential student dossiers, academic term report cards, school fee ledgers, or administrative controls.
                </p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  Sign In to Peculiar Portal
                </button>
              </div>
            ) : currentUser.role === 'PARENT' ? (
              <ParentPortal
                user={currentUser}
                students={students}
                results={results}
                fees={fees}
                onOpenReportCard={setActiveReportCard}
                onOpenReceipt={setActiveReceipt}
              />
            ) : currentUser.role === 'STUDENT' ? (
              <StudentPortal
                user={currentUser}
                students={students}
                results={results}
                onOpenReportCard={setActiveReportCard}
              />
            ) : currentUser.role === 'APPLICANT' ? (
              <ApplicantPortal
                user={currentUser}
                admissions={admissions}
                onNavigate={handleNavigate}
              />
            ) : (
              // Staff / Admin / Principal / Accountant
              <AdminDashboard
                user={currentUser}
                token={authToken}
                students={students}
                admissions={admissions}
                results={results}
                fees={fees}
                news={news}
                gallery={gallery}
                contactMessages={contactMessages}
                auditLogs={auditLogs}
                onRefreshData={refreshAllData}
                onOpenReportCard={setActiveReportCard}
                onOpenReceipt={setActiveReceipt}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {currentUser?.mustChangePassword && authToken && (
        <ChangePasswordModal token={authToken} onComplete={handleLogout} />
      )}

      {/* 2. Official Terminal Report Card Modal */}
      <ReportCardModal
        result={activeReportCard}
        onClose={() => setActiveReportCard(null)}
      />

      {/* 3. Official Fee Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* 4. Gemini AI Staff Editorial Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        token={authToken}
      />
    </div>
  );
}
