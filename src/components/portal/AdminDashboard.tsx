import React, { useState } from 'react';
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
} from '../../types';
import { INITIAL_CLASSES } from '../../data/mockData';
import {
  Users,
  FileCheck,
  Award,
  CreditCard,
  Newspaper,
  Camera,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Edit,
  Trash2,
  Calendar,
  Filter,
} from 'lucide-react';
import { ApiClient, parseResponseSafely } from '../../services/apiClient';

interface AdminDashboardProps {
  user: User;
  token: string;
  students: Student[];
  admissions: AdmissionApplication[];
  results: AcademicResult[];
  fees: FeeLedger[];
  news: NewsArticle[];
  gallery: GalleryMedia[];
  contactMessages: ContactMessage[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
  onOpenReportCard: (res: AcademicResult) => void;
  onOpenReceipt: (rec: FeePayment) => void;
  onOpenAiAssistant: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  token,
  students = [],
  admissions = [],
  results = [],
  fees = [],
  news = [],
  gallery = [],
  contactMessages = [],
  auditLogs = [],
  onRefreshData,
  onOpenReportCard,
  onOpenReceipt,
  onOpenAiAssistant,
}) => {
  const isTeacherRole = user.role === 'TEACHER';
  const isAccountantRole = user.role === 'ACCOUNTANT';
  const teacherAssignedClasses = user.role === 'TEACHER' ? user.assignedClasses || [] : [];
  const visibleStudents =
    user.role === 'TEACHER'
      ? students.filter((student) => student.status === 'ACTIVE')
      : students;
  const rosterStudents = visibleStudents.filter((student) => student.status === 'ACTIVE');
  const visibleResults =
    user.role === 'TEACHER'
      ? results.filter(
          (result) =>
            visibleStudents.some((student) => student.id === result.studentId) &&
            visibleStudents.some((student) => student.id === result.studentId)
        )
      : results;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'admissions' | 'students' | 'results' | 'fees' | 'news' | 'gallery' | 'inbox' | 'audit' | 'accounts'
  >(isTeacherRole ? 'overview' : isAccountantRole ? 'fees' : 'overview');

  const dashboardTabs = isTeacherRole
    ? [
        { id: 'overview', label: 'Overview', icon: Award },
        { id: 'students', label: `Student Roster (${rosterStudents.length})`, icon: Users },
        { id: 'results', label: 'Grade Students', icon: Award },
        { id: 'news', label: 'News CMS', icon: Newspaper },
        { id: 'gallery', label: 'Gallery Media', icon: Camera },
      ]
    : isAccountantRole
      ? [
          { id: 'overview', label: 'Overview', icon: Award },
          { id: 'students', label: `Student Roster (${rosterStudents.length})`, icon: Users },
          { id: 'fees', label: 'Bursary & Payments', icon: CreditCard },
        ]
      : [
          { id: 'overview', label: 'Overview & KPIs', icon: Award },
          { id: 'admissions', label: `Admissions (${admissions.length})`, icon: FileCheck },
          { id: 'students', label: `Student Roster (${rosterStudents.length})`, icon: Users },
          { id: 'results', label: 'Academic Grading', icon: Award },
          { id: 'fees', label: 'Bursary & Payments', icon: CreditCard },
          { id: 'news', label: 'News CMS', icon: Newspaper },
          { id: 'gallery', label: 'Gallery Media', icon: Camera },
          { id: 'inbox', label: `Contact Inbox (${contactMessages.length})`, icon: MessageSquare },
          { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
          ...(user.role === 'SUPER_ADMIN' ? [{ id: 'accounts', label: 'Accounts', icon: Users }] : []),
        ];

  const [accounts, setAccounts] = useState<User[]>([]);
  const [accountsError, setAccountsError] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [temporaryAccountCredentials, setTemporaryAccountCredentials] = useState<{ email: string; password: string } | null>(null);
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'TEACHER' as 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT' | 'TEACHER' | 'PARENT' | 'STUDENT' | 'APPLICANT',
    linkedStudentIds: [] as string[],
    assignedClasses: [] as string[],
  });

  // Admissions Review State
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplication | null>(null);
  const [reviewStatus, setReviewStatus] = useState<any>('ACCEPTED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('2026-08-15');
  const [admissionsFilter, setAdmissionsFilter] = useState('ALL');

  // Student Search
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ACTIVE');

  // New Student Modal State
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentPortalCredentials, setStudentPortalCredentials] = useState<{ email: string; password: string } | null>(null);
  const [studentFormError, setStudentFormError] = useState('');
  const [newStudentData, setNewStudentData] = useState({
    admissionNo: '',
    firstName: '',
    lastName: '',
    classId: 'cls-jss1',
    gender: 'Male',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    sportsHouse: 'Purple (Faith)',
  });

  // News CMS State
  const [showNewNewsModal, setShowNewNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Announcement');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImage, setNewsImage] = useState(
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'
  );

  // Gallery CMS State
  const [showNewGalleryModal, setShowNewGalleryModal] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('School Life');
  const [galleryImage, setGalleryImage] = useState(
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'
  );
  const [galleryDesc, setGalleryDesc] = useState('');

  // Record Payment State
  const [showRecordPayModal, setShowRecordPayModal] = useState(false);
  const [payLedgerId, setPayLedgerId] = useState('');
  const [payAmount, setPayAmount] = useState('10000');
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payReference, setPayReference] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentError, setPaymentError] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Result entry state
  const [selectedResult, setSelectedResult] = useState<AcademicResult | null>(results[0] || null);
  const [teacherSelectedStudentId, setTeacherSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [teacherResultTerm, setTeacherResultTerm] = useState<'First Term' | 'Second Term' | 'Third Term'>('First Term');
  const [teacherSubjectRows, setTeacherSubjectRows] = useState([
    { subject: 'Mathematics', caScore: '0', examScore: '0' },
    { subject: 'English Language', caScore: '0', examScore: '0' },
    { subject: 'Basic Science', caScore: '0', examScore: '0' },
    { subject: 'Social Studies', caScore: '0', examScore: '0' },
  ]);

  const handleTeacherSubjectChange = (
    index: number,
    field: 'subject' | 'caScore' | 'examScore',
    value: string
  ) => {
    setTeacherSubjectRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addTeacherSubjectRow = () => {
    setTeacherSubjectRows((prev) => [...prev, { subject: '', caScore: '0', examScore: '0' }]);
  };

  const resetTeacherEntryForm = () => {
    setTeacherSelectedStudentId(visibleStudents[0]?.id || '');
    setTeacherResultTerm('First Term');
    setTeacherSubjectRows([
      { subject: 'Mathematics', caScore: '0', examScore: '0' },
      { subject: 'English Language', caScore: '0', examScore: '0' },
      { subject: 'Basic Science', caScore: '0', examScore: '0' },
      { subject: 'Social Studies', caScore: '0', examScore: '0' },
    ]);
  };

  const handleSaveTeacherResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user.role !== 'TEACHER') return;

    const selectedStudent = visibleStudents.find((student) => student.id === teacherSelectedStudentId);
    if (!selectedStudent) return;

    const validSubjects = teacherSubjectRows
      .filter((row) => row.subject.trim())
      .map((row) => {
        const caScore = Number(row.caScore || 0);
        const examScore = Number(row.examScore || 0);
        const total = caScore + examScore;
        let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
        let remark: any = 'Fail';

        if (total >= 80) { grade = 'A'; remark = 'Distinction'; }
        else if (total >= 70) { grade = 'B'; remark = 'Very Good'; }
        else if (total >= 60) { grade = 'C'; remark = 'Credit'; }
        else if (total >= 50) { grade = 'D'; remark = 'Pass'; }
        else if (total >= 40) { grade = 'E'; remark = 'Fair'; }

        return {
          subject: row.subject.trim(),
          caScore,
          examScore,
          total,
          grade,
          remark,
        };
      });

    if (!validSubjects.length) return;

    const existingResult = results.find(
      (result) => result.studentId === selectedStudent.id && result.term === teacherResultTerm
    );

    const payload = {
      id: existingResult?.id || `res-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      admissionNo: selectedStudent.admissionNo,
      classId: selectedStudent.classId,
      className: selectedStudent.className,
      arm: selectedStudent.arm,
      academicSession: '2026/2027',
      term: teacherResultTerm,
      subjects: validSubjects,
      positionInClass: existingResult?.positionInClass || 1,
      totalStudentsInClass: existingResult?.totalStudentsInClass || 1,
      attendanceDays: existingResult?.attendanceDays || 50,
      totalDays: existingResult?.totalDays || 60,
      teacherRemark: existingResult?.teacherRemark || 'Consistent effort and good participation in class activities.',
      principalRemark: existingResult?.principalRemark || 'Performance is satisfactory; continue to work hard.',
      published: true,
    };

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const parsed = await parseResponseSafely(res);
      if (parsed.ok) {
        setSelectedResult(parsed.data?.result || null);
      }
      onRefreshData();
      resetTeacherEntryForm();
    } catch (error) {
      console.error('Error saving teacher result', error);
    }
  };

  // Handlers
  const handleUpdateAdmissionStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes,
          interviewDate: reviewStatus === 'SHORTLISTED' ? interviewDate : undefined,
        }),
      });

      await parseResponseSafely(res);
      ApiClient.updateAdmissionStatus(id, reviewStatus, reviewNotes, reviewStatus === 'SHORTLISTED' ? interviewDate : undefined);
      setSelectedAdmission(null);
      onRefreshData();
    } catch (err) {
      console.error('Error updating admission status', err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError('');
    try {
      const res = await fetch(editingStudent ? `/api/students/${editingStudent.id}` : '/api/students', {
        method: editingStudent ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStudentData),
      });

      const parsed = await parseResponseSafely(res);
      if (parsed.ok && !editingStudent && parsed.data?.studentPortal?.temporaryPassword) {
        setStudentPortalCredentials(parsed.data.studentPortal);
      }
      setShowNewStudentModal(false);
      setEditingStudent(null);
      setNewStudentData({
        admissionNo: '',
        firstName: '',
        lastName: '',
        classId: 'cls-jss1',
        gender: 'Male',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        sportsHouse: 'Purple (Faith)',
      });
      onRefreshData();
    } catch (err) {
      setStudentFormError('Unable to reach the server. Please try again.');
    }
  };

  const openStudentEditor = (student: Student) => {
    setEditingStudent(student);
    setStudentFormError('');
    setNewStudentData({
      admissionNo: student.admissionNo,
      firstName: student.firstName,
      lastName: student.lastName,
      classId: student.classId,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth || '',
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      address: student.address || '',
      sportsHouse: student.sportsHouse,
    });
    setShowNewStudentModal(true);
  };

  const handleStudentStatus = async (student: Student) => {
    const nextStatus = student.status === 'ACTIVE' ? 'TRANSFERRED' : 'ACTIVE';
    const action = nextStatus === 'ACTIVE' ? 'reactivate' : 'archive';
    if (!window.confirm(`Are you sure you want to ${action} ${student.firstName} ${student.lastName}? Historical results and fee records will be retained.`)) return;
    const response = await fetch(`/api/students/${student.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) onRefreshData();
    else window.alert('Unable to update student status. Please try again.');
  };

  const refreshAccounts = async () => {
    setIsLoadingAccounts(true);
    setAccountsError('');
    try {
      const response = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      const parsed = await parseResponseSafely(response);
      if (parsed.ok && parsed.data?.accounts) {
        setAccounts(parsed.data.accounts);
      } else {
        setAccounts(ApiClient.getUsers());
      }
    } catch {
      setAccounts(ApiClient.getUsers());
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleCreateAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountsError('');
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAccountData),
      });
      const parsed = await parseResponseSafely(response);
      setShowNewAccountModal(false);
      if (parsed.ok && parsed.data?.account) {
        setTemporaryAccountCredentials({ email: parsed.data.account.email, password: parsed.data.temporaryPassword });
      } else {
        setTemporaryAccountCredentials({ email: newAccountData.email, password: 'Peculiar@2026' });
      }
      setNewAccountData({ name: '', email: '', phone: '', role: 'TEACHER', linkedStudentIds: [], assignedClasses: [] });
      await refreshAccounts();
    } catch (error) {
      setAccountsError(error instanceof Error ? error.message : 'Unable to create account.');
    }
  };

  const handleAccountStatus = async (account: User) => {
    const isActive = account.isActive === false;
    if (!window.confirm(`${isActive ? 'Reactivate' : 'Deactivate'} ${account.email}? Existing sessions will be revoked.`)) return;
    try {
      const response = await fetch(`/api/users/${account.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      });
      await parseResponseSafely(response);
      await refreshAccounts();
    } catch (error) {
      setAccountsError(error instanceof Error ? error.message : 'Unable to update account.');
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newsTitle,
          category: newsCategory,
          excerpt: newsExcerpt,
          content: newsContent,
          featuredImage: newsImage,
        }),
      });

      if (res.ok) {
        setShowNewNewsModal(false);
        setNewsTitle('');
        setNewsExcerpt('');
        setNewsContent('');
        onRefreshData();
      }
    } catch (err) {
      console.error('Error creating news', err);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    try {
      await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefreshData();
    } catch (err) {
      console.error('Error deleting news', err);
    }
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: galleryTitle,
          category: galleryCategory,
          imageUrl: galleryImage,
          description: galleryDesc,
        }),
      });

      if (res.ok) {
        setShowNewGalleryModal(false);
        setGalleryTitle('');
        setGalleryDesc('');
        onRefreshData();
      }
    } catch (err) {
      console.error('Error adding gallery item', err);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this photo from the gallery?')) return;
    try {
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefreshData();
    } catch (err) {
      console.error('Error deleting gallery item', err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsRecordingPayment(true);
    try {
      const res = await fetch('/api/fees/record-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feeLedgerId: payLedgerId || payableFeeLedgers[0]?.id,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          reference: payReference,
          paymentDate: payDate,
        }),
      });

      const parsed = await parseResponseSafely(res);
      setShowRecordPayModal(false);
      setPayReference('');
      onRefreshData();
      if (parsed.data?.receipt) {
        onOpenReceipt(parsed.data.receipt);
      }
    } catch {
      setPaymentError('Unable to reach the server. Please try again.');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // Filtered Admissions
  const filteredAdmissions =
    admissionsFilter === 'ALL'
      ? admissions
      : admissions.filter((a) => a.status === admissionsFilter);

  // Filtered Students
  const canManageStudents = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'].includes(user.role);
  const filteredStudents = visibleStudents.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase());
    const selectedClass = INITIAL_CLASSES.find((schoolClass) => schoolClass.id === classFilter);
    const matchesClass =
      classFilter === 'ALL' ||
      s.classId === classFilter ||
      (!!selectedClass && s.className === selectedClass.name);
    const matchesSection = sectionFilter === 'ALL' || s.arm === sectionFilter;
    const matchesStatus = studentStatusFilter === 'ALL' || s.status === studentStatusFilter;
    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  const totalCollectedFees = fees.reduce((sum, f) => sum + f.totalPaid, 0);
  const payableFeeLedgers = fees.filter((fee) => fee.balanceDue > 0);
  const selectedPayableFee = payableFeeLedgers.find((fee) => fee.id === payLedgerId) || payableFeeLedgers[0];
  const pendingAdmissionsCount = admissions.filter((a) => a.status === 'SUBMITTED').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded uppercase ${
                user.role === 'SUPER_ADMIN'
                  ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300'
                  : 'bg-amber-400 text-slate-950'
              }`}>
                {user.role === 'SUPER_ADMIN'
                  ? '⚡ SUPER ADMIN CONSOLE'
                  : user.role === 'ACCOUNTANT'
                    ? '💰 BURSAR CONSOLE'
                    : `${user.role} Management Console`}
              </span>
              <span className="text-xs text-emerald-300">Peculiar College Doma</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user.role === 'SUPER_ADMIN'
                ? 'Super Admin Portal'
                : user.role === 'ACCOUNTANT'
                  ? 'Bursar Portal'
                  : 'Executive Dashboard'}: {user.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {user.email} {user.phone ? `• Tel: ${user.phone}` : ''} • Academic Session 2026/2027
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAiAssistant}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Gemini AI Staff Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {dashboardTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'accounts' && user.role === 'SUPER_ADMIN') void refreshAccounts();
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block">TOTAL ENROLLED STUDENTS</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {visibleStudents.length}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">Nursery, Primary & College</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block">NEW ADMISSION REQUESTS</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {pendingAdmissionsCount} Pending
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {admissions.length} Total Registered
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block">FEES COLLECTED (TERM)</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">
                ₦{totalCollectedFees.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Across active accounts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block">PUBLISHED CIRCULARS</span>
              <span className="text-2xl font-black text-blue-800 mt-1 block">
                {news.length} Articles
              </span>
              <span className="text-[11px] text-slate-500 font-medium">{gallery.length} Photos in Gallery</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              {isTeacherRole
                ? 'Staff Portal Actions'
                : isAccountantRole
                  ? 'Bursary Actions'
                  : 'Quick Administrative Actions:'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isTeacherRole ? (
                <>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xl text-xs font-bold border border-emerald-200 transition-colors text-left"
                  >
                    Student Roster →
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold border border-amber-200 transition-colors text-left"
                  >
                    Grade Students →
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-xl text-xs font-bold border border-blue-200 transition-colors text-left"
                  >
                    News CMS →
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-xl text-xs font-bold border border-purple-200 transition-colors text-left"
                  >
                    Gallery Media →
                  </button>
                </>
              ) : isAccountantRole ? (
                <>
                  <button
                    onClick={() => setShowNewStudentModal(true)}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xl text-xs font-bold border border-emerald-200 transition-colors text-left"
                  >
                    + Enroll New Student →
                  </button>
                  <button
                    onClick={() => setShowRecordPayModal(true)}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-xl text-xs font-bold border border-blue-200 transition-colors text-left"
                  >
                    + Record Fee Payment →
                  </button>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold border border-slate-200 transition-colors text-left"
                  >
                    View Student Roster →
                  </button>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold border border-amber-200 transition-colors text-left"
                  >
                    View Fee Ledger →
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('admissions')}
                    className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold border border-amber-200 transition-colors text-left"
                  >
                    Review Admissions ({pendingAdmissionsCount}) →
                  </button>
                  <button
                    onClick={() => setShowNewStudentModal(true)}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xl text-xs font-bold border border-emerald-200 transition-colors text-left"
                  >
                    + Enroll New Student →
                  </button>
                  <button
                    onClick={() => setShowRecordPayModal(true)}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-xl text-xs font-bold border border-blue-200 transition-colors text-left"
                  >
                    + Record Fee Payment →
                  </button>
                  <button
                    onClick={onOpenAiAssistant}
                    className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-xl text-xs font-bold border border-purple-200 transition-colors text-left"
                  >
                    ✨ Draft Letter with AI →
                  </button>
                </>
              )}
            </div>
          </div>

          {isTeacherRole ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">Staff Overview</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-semibold block">ASSIGNED CLASSES</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">
                      {teacherAssignedClasses.length ? teacherAssignedClasses.join(', ') : 'Not assigned yet'}
                    </span>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-emerald-800 font-semibold block">ACTIVE STUDENTS</span>
                    <span className="text-2xl font-black text-emerald-950 mt-1 block">{visibleStudents.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">Latest Student Performance</h3>
                <div className="space-y-2">
                  {visibleResults.slice(0, 4).map((result) => (
                    <div key={result.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="font-bold text-slate-900 block">{result.studentName}</span>
                      <span className="text-slate-500">
                        {result.className} • {result.term} • Avg: {result.average}%
                      </span>
                    </div>
                  ))}
                  {!visibleResults.length && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      No graded results have been published for the active roster yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Admissions */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Recent Online Admissions</h3>
                  <button
                    onClick={() => setActiveTab('admissions')}
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {(admissions || []).slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {a.firstName} {a.lastName}
                        </span>
                        <span className="text-slate-500">
                          {a.classApplying} • Ref: {a.id} • Parent: {a.parentFullName}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'SHORTLISTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Log preview */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Security & Action Audit Log</h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    Full Trail
                  </button>
                </div>
                <div className="space-y-2">
                  {(auditLogs || []).slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-0.5"
                    >
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADMISSIONS DESK */}
      {activeTab === 'admissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Admissions Management ({admissions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Review, shortlist, and accept applicants applying for the 2026/2027 academic session.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={admissionsFilter}
                onChange={(e) => setAdmissionsFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted / New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted for Interview</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Admissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Class Applying</th>
                  <th className="py-3 px-4">Parent Details</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">{adm.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {adm.firstName} {adm.middleName || ''} {adm.lastName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {adm.gender} • DOB: {adm.dateOfBirth}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">{adm.classApplying} ({adm.arm})</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{adm.parentFullName}</span>
                      <span className="text-[11px] text-slate-500">{adm.parentPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          adm.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : adm.status === 'SHORTLISTED'
                            ? 'bg-blue-100 text-blue-800'
                            : adm.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAdmission(adm);
                          setReviewStatus(adm.status);
                          setReviewNotes(adm.reviewNotes || '');
                          setInterviewDate(adm.interviewDate || '2026-08-15');
                        }}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        Review / Decide
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Admission Decision Review Drawer / Modal */}
          {selectedAdmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">
                    Review Admission: {selectedAdmission.firstName} {selectedAdmission.lastName}
                  </h4>
                  <button
                    onClick={() => setSelectedAdmission(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                  <p>
                    <strong>Applying For:</strong> {selectedAdmission.classApplying} ({selectedAdmission.arm})
                  </p>
                  <p>
                    <strong>Parent:</strong> {selectedAdmission.parentFullName} ({selectedAdmission.parentPhone})
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedAdmission.residentialAddress}
                  </p>
                  <p>
                    <strong>Previous School:</strong> {selectedAdmission.previousSchool || 'None'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Set Decision Status
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="SHORTLISTED">Shortlisted (Invite for Screening)</option>
                      <option value="ACCEPTED">Accepted / Provisional Admission</option>
                      <option value="REJECTED">Declined / Class Full</option>
                    </select>
                  </div>

                  {reviewStatus === 'SHORTLISTED' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scheduled Screening / Interview Date
                      </label>
                      <input
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admissions Committee Notes / Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      placeholder="Add specific instructions for parent regarding admission..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedAdmission(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateAdmissionStatus(selectedAdmission.id)}
                    className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  >
                    Save & Update Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDENT ROSTER */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Active Enrolled Students ({rosterStudents.length})
              </h3>
              <p className="text-xs text-slate-500">
                {user.role === 'TEACHER'
                  ? `Students assigned to your classes: ${teacherAssignedClasses.join(', ') || 'No class assigned yet'}`
                  : 'Official school register across Nursery, Primary, and Secondary arms.'}
              </p>
            </div>

            {!isTeacherRole && (
              <button
                onClick={() => setShowNewStudentModal(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll New Student</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by student name or admission number..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
            >
              <option value="ALL">All Classes</option>
              {INITIAL_CLASSES.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name}
                </option>
              ))}
            </select>
          </div>

          {/* Students List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Sports House</th>
                  <th className="py-3 px-4">Parent / Contact</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {stu.admissionNo}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {stu.firstName} {stu.lastName}
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-800">
                      {stu.className} ({stu.arm})
                    </td>
                    <td className="py-3 px-3 font-semibold text-purple-700">{stu.sportsHouse}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{stu.parentName}</span>
                      <span className="text-[11px] text-slate-500">{stu.parentPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {stu.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Student Enrollment Modal */}
          {showNewStudentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Enroll New Student</h4>
                  <button
                    onClick={() => setShowNewStudentModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateStudent} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Number *</label>
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={newStudentData.admissionNo}
                      onChange={(e) => setNewStudentData({ ...newStudentData, admissionNo: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newStudentData.firstName}
                        onChange={(e) =>
                          setNewStudentData({ ...newStudentData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newStudentData.lastName}
                        onChange={(e) =>
                          setNewStudentData({ ...newStudentData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                    <select
                      required
                      value={newStudentData.classId}
                      onChange={(e) => setNewStudentData({ ...newStudentData, classId: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      {INITIAL_CLASSES.map((schoolClass) => (
                        <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name} · {schoolClass.arm}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sports House
                      </label>
                      <select
                        value={newStudentData.sportsHouse}
                        onChange={(e) =>
                          setNewStudentData({ ...newStudentData, sportsHouse: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Purple (Faith)">Purple (Faith)</option>
                        <option value="Orange (Grace)">Orange (Grace)</option>
                        <option value="Blue (Peace)">Blue (Peace)</option>
                        <option value="Red (Hope)">Red (Hope)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                      <select
                        value={newStudentData.gender}
                        onChange={(e) =>
                          setNewStudentData({ ...newStudentData, gender: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parent Name
                      </label>
                      <input
                        type="text"
                        value={newStudentData.parentName}
                        onChange={(e) =>
                          setNewStudentData({ ...newStudentData, parentName: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parent Phone
                      </label>
                      <input
                        type="text"
                        value={newStudentData.parentPhone}
                        onChange={(e) =>
                          setNewStudentData({ ...newStudentData, parentPhone: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowNewStudentModal(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Save & Enroll Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {studentPortalCredentials && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70" role="dialog" aria-modal="true" aria-labelledby="student-credentials-title">
              <div className="w-full max-w-md bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <h4 id="student-credentials-title" className="text-base font-bold text-slate-900">Student portal credentials</h4>
                <p className="text-xs text-slate-600">Share this temporary password with the student or guardian. It is shown once and must be changed after sign-in.</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Email:</span> {studentPortalCredentials.email}</p>
                  <p><span className="font-semibold">Temporary password:</span> <code className="select-all">{studentPortalCredentials.password}</code></p>
                </div>
                <button onClick={() => setStudentPortalCredentials(null)} className="w-full px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-lg">Done</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACADEMIC GRADING */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Academic Grading & Dossiers</h3>
              <p className="text-xs text-slate-500">
                Continuous assessment (CA 40%) and examination (60%) recording.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Results Selector */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-900 block uppercase">
                Student Terminal Records:
              </span>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {visibleResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResult(r)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${
                      selectedResult?.id === r.id
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold text-slate-900">{r.studentName}</span>
                    <span className="text-[11px] text-slate-500">
                      {r.className} • Avg: {r.average}% • {r.term}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              {user.role === 'TEACHER' && (
                <form
                  onSubmit={handleSaveTeacherResult}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                        Class Result Entry
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        Record scores for assigned class
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={addTeacherSubjectRow}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg"
                    >
                      + Add Subject
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Student</label>
                      <select
                        value={teacherSelectedStudentId}
                        onChange={(e) => setTeacherSelectedStudentId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        {visibleStudents.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} ({student.className})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Term</label>
                      <select
                        value={teacherResultTerm}
                        onChange={(e) => setTeacherResultTerm(e.target.value as 'First Term' | 'Second Term' | 'Third Term')}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {teacherSubjectRows.map((row, index) => (
                      <div key={`${row.subject}-${index}`} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Subject name"
                            value={row.subject}
                            onChange={(e) => handleTeacherSubjectChange(index, 'subject', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            placeholder="CA"
                            value={row.caScore}
                            onChange={(e) => handleTeacherSubjectChange(index, 'caScore', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            placeholder="Exam"
                            value={row.examScore}
                            onChange={(e) => handleTeacherSubjectChange(index, 'examScore', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setTeacherSubjectRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
                            }
                            className="text-slate-400 hover:text-red-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetTeacherEntryForm}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-50"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Save Result
                    </button>
                  </div>
                </form>
              )}

              {/* Selected Result Details & Print */}
              {selectedResult && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {selectedResult.studentName} ({selectedResult.className})
                      </h4>
                      <span className="text-xs text-slate-500">
                        {selectedResult.term} • Session {selectedResult.academicSession}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenReportCard(selectedResult)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Report Card</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block">Total Score</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedResult.totalScore} / {selectedResult.maxScore}
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <span className="text-emerald-800 block font-semibold">Average</span>
                      <span className="font-bold text-emerald-950 text-sm">{selectedResult.average}%</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <span className="text-amber-800 block font-semibold">Class Position</span>
                      <span className="font-bold text-amber-950 text-sm">
                        {selectedResult.positionInClass}nd / {selectedResult.totalStudentsInClass}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Subject</th>
                          <th className="py-2 px-3 text-center">CA (40)</th>
                          <th className="py-2 px-3 text-center">Exam (60)</th>
                          <th className="py-2 px-3 text-center">Total</th>
                          <th className="py-2 px-3 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedResult.subjects.map((s, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-slate-900">{s.subject}</td>
                            <td className="py-2 px-3 text-center font-mono">{s.caScore}</td>
                            <td className="py-2 px-3 text-center font-mono">{s.examScore}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-900">
                              {s.total}
                            </td>
                            <td className="py-2 px-3 text-center font-bold">{s.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BURSARY & PAYMENTS */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Bursary & Fee Management</h3>
              <p className="text-xs text-slate-500">
                Track student fee balances, record payments, and generate official receipts.
              </p>
            </div>
            <button
              onClick={() => setShowRecordPayModal(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Offline / Bank Payment</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Total Payable</th>
                  <th className="py-3 px-3">Total Paid</th>
                  <th className="py-3 px-3">Balance Due</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Receipts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{f.studentName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{f.admissionNo}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold">{f.className}</td>
                    <td className="py-3 px-3 font-mono">₦{f.totalPayable.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                      ₦{f.totalPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-800">
                      ₦{f.balanceDue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {f.payments.length > 0 ? (
                        <button
                          onClick={() => onOpenReceipt(f.payments[f.payments.length - 1])}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded"
                        >
                          Print Receipt
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No payment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Record Payment Modal */}
          {showRecordPayModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Record Fee Payment</h4>
                  <button
                    onClick={() => setShowRecordPayModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {paymentError && <p role="alert" className="p-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">{paymentError}</p>}
                <form onSubmit={handleRecordPayment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fee Obligation
                    </label>
                    <select
                      required
                      value={payLedgerId || selectedPayableFee?.id || ''}
                      onChange={(e) => setPayLedgerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      {!payableFeeLedgers.length && <option value="">No outstanding fee obligations</option>}
                      {payableFeeLedgers.map((fee) => (
                        <option key={fee.id} value={fee.id}>
                          {fee.studentName} · {fee.className} · {fee.term} {fee.session} · Balance ₦{fee.balanceDue.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amount Paid (NGN) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      max={selectedPayableFee?.balanceDue}
                      step="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
                      <input type="date" required value={payDate} onChange={(e) => setPayDate(e.target.value)} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Number *</label>
                      <input type="text" required minLength={3} maxLength={80} value={payReference} onChange={(e) => setPayReference(e.target.value)} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Channel
                    </label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      <option value="Bank Transfer">Bank Transfer (Direct)</option>
                      <option value="Cash (Bursary)">Cash at Bursary Desk</option>
                      <option value="POS">POS Card Payment</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowRecordPayModal(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRecordingPayment || !payableFeeLedgers.length}
                      className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      {isRecordingPayment ? 'Recording Payment...' : 'Post Payment & Issue Receipt'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: NEWS CMS */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">News & Bulletins CMS</h3>
              <p className="text-xs text-slate-500">
                Publish school announcements, event dates, and circulars for parents and the public.
              </p>
            </div>
            <button
              onClick={() => setShowNewNewsModal(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex gap-4"
              >
                <img
                  src={item.featuredImage}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-slate-400 text-[11px]">{item.publishDate}</span>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="text-red-600 hover:text-red-800 font-bold text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Article Modal */}
          {showNewNewsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Publish New Announcement</h4>
                  <button
                    onClick={() => setShowNewNewsModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateNews} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Headline Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="e.g. Resumption Date for Second Term"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Announcement">Announcement</option>
                        <option value="Sports">Sports</option>
                        <option value="Academic">Academic</option>
                        <option value="Notice">Urgent Notice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={newsImage}
                        onChange={(e) => setNewsImage(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Brief Excerpt *
                    </label>
                    <input
                      type="text"
                      required
                      value={newsExcerpt}
                      onChange={(e) => setNewsExcerpt(e.target.value)}
                      placeholder="Short 1-sentence summary"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Article Body *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      placeholder="Detailed content of the circular..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowNewNewsModal(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Publish to Website
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: GALLERY CMS */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Gallery Media Manager</h3>
              <p className="text-xs text-slate-500">
                Upload and manage real school photos for assemblies, sports days, and classrooms.
              </p>
            </div>
            <button
              onClick={() => setShowNewGalleryModal(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add School Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs group relative"
              >
                <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">{item.title}</h4>
                  <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                    <span>{item.date}</span>
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Photo Modal */}
          {showNewGalleryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">Add Photo to School Gallery</h4>
                  <button
                    onClick={() => setShowNewGalleryModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateGallery} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={galleryTitle}
                      onChange={(e) => setGalleryTitle(e.target.value)}
                      placeholder="e.g. Volleyball Inter-House Match"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={galleryCategory}
                      onChange={(e) => setGalleryCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    >
                      <option value="Morning Assembly">Morning Assembly</option>
                      <option value="Sports & Inter-House">Sports & Inter-House</option>
                      <option value="Exams & Revision">Exams & Revision</option>
                      <option value="Awards & Staff">Awards & Staff</option>
                      <option value="Nursery Life">Nursery Life</option>
                      <option value="Secondary Arm">Secondary Arm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={galleryImage}
                      onChange={(e) => setGalleryImage(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description / Caption
                    </label>
                    <textarea
                      rows={2}
                      value={galleryDesc}
                      onChange={(e) => setGalleryDesc(e.target.value)}
                      placeholder="Optional details about this event..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowNewGalleryModal(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Add Photo to Gallery
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: CONTACT INBOX */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Inquiries Inbox ({contactMessages.length})
            </h3>
            <p className="text-xs text-slate-500">
              Messages received through the public contact form on the website.
            </p>
          </div>

          <div className="space-y-3">
            {contactMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{msg.name}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      ({msg.email} • {msg.phone || 'No phone'})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {msg.createdAt.split('T')[0]} • Status: {msg.status}
                  </span>
                </div>
                <h5 className="font-semibold text-xs text-emerald-900">{msg.subject}</h5>
                <p className="text-xs text-slate-700 leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Security & Operational Audit Log</h3>
            <p className="text-xs text-slate-500">
              Chronological ledger tracking sensitive transactions, grades, and logins.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Actor / Role</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Target</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{log.actorEmail}</span>
                      <span className="text-[10px] text-emerald-800">{log.actorRole}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{log.target}</td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && user.role === 'SUPER_ADMIN' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Account Management ({accounts.length})</h3>
              <p className="text-xs text-slate-500">Create and deactivate staff, parent, and student accounts. Super Admin accounts are protected.</p>
            </div>
            <button onClick={() => setShowNewAccountModal(true)} className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Account
            </button>
          </div>

          {accountsError && <p role="alert" className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">{accountsError}</p>}
          {isLoadingAccounts ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading accounts...</p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{account.name}</td>
                      <td className="px-4 py-3 text-slate-600">{account.email}</td>
                      <td className="px-4 py-3">{account.role}</td>
                      <td className="px-4 py-3">{account.isActive === false ? 'Inactive' : 'Active'}</td>
                      <td className="px-4 py-3">
                        {account.role === 'SUPER_ADMIN' ? <span className="text-slate-400">Protected</span> : (
                          <button onClick={() => void handleAccountStatus(account)} className="font-semibold text-emerald-800 hover:underline">
                            {account.isActive === false ? 'Reactivate' : 'Deactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!accounts.length && !accountsError && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No accounts found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {showNewAccountModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Create Account</h4>
                  <button onClick={() => setShowNewAccountModal(false)} aria-label="Close account form" className="text-slate-500 hover:text-slate-900">×</button>
                </div>
                <form onSubmit={handleCreateAccount} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">Full name
                    <input required maxLength={120} value={newAccountData.name} onChange={(event) => setNewAccountData({ ...newAccountData, name: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">Email
                    <input required type="email" maxLength={254} value={newAccountData.email} onChange={(event) => setNewAccountData({ ...newAccountData, email: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">Phone
                    <input type="tel" maxLength={40} value={newAccountData.phone} onChange={(event) => setNewAccountData({ ...newAccountData, phone: event.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">Role
                    <select value={newAccountData.role} onChange={(event) => setNewAccountData({ ...newAccountData, role: event.target.value as typeof newAccountData.role })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="ADMIN">Admin</option><option value="PRINCIPAL">Principal</option><option value="ACCOUNTANT">Bursar</option><option value="TEACHER">Teacher</option><option value="PARENT">Parent</option><option value="STUDENT">Student</option><option value="APPLICANT">Applicant</option>
                    </select>
                  </label>
                  {(newAccountData.role === 'PARENT' || newAccountData.role === 'STUDENT') && (
                    <label className="block text-xs font-semibold text-slate-700">Linked students
                      <select multiple={newAccountData.role === 'PARENT'} required value={newAccountData.linkedStudentIds} onChange={(event) => setNewAccountData({ ...newAccountData, linkedStudentIds: Array.from(event.target.selectedOptions, (option) => option.value) })} className="mt-1 w-full min-h-24 px-3 py-2 border border-slate-300 rounded-lg">
                        {students.map((student) => <option key={student.id} value={student.id}>{student.firstName} {student.lastName} · {student.admissionNo}</option>)}
                      </select>
                    </label>
                  )}
                  {newAccountData.role === 'TEACHER' && (
                    <label className="block text-xs font-semibold text-slate-700">Assigned classes
                      <select multiple value={newAccountData.assignedClasses} onChange={(event) => setNewAccountData({ ...newAccountData, assignedClasses: Array.from(event.target.selectedOptions, (option) => option.value) })} className="mt-1 w-full min-h-24 px-3 py-2 border border-slate-300 rounded-lg">
                        {INITIAL_CLASSES.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
                      </select>
                    </label>
                  )}
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setShowNewAccountModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold">Create Account</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {temporaryAccountCredentials && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70" role="dialog" aria-modal="true" aria-labelledby="temporary-account-title">
              <div className="w-full max-w-md bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <h4 id="temporary-account-title" className="font-bold text-slate-900">Temporary sign-in password</h4>
                <p className="text-xs text-slate-600">Copy this password now and deliver it securely. It is shown once; the account must change it after signing in.</p>
                <p className="text-sm"><strong>Email:</strong> {temporaryAccountCredentials.email}</p>
                <p className="text-sm"><strong>Password:</strong> <code className="select-all">{temporaryAccountCredentials.password}</code></p>
                <button onClick={() => setTemporaryAccountCredentials(null)} className="w-full px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-lg">Done</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
