import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  Sparkles,
  FileCheck,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Phone,
  User,
  MapPin,
  Upload,
  ArrowRight,
  Printer,
  Download,
} from 'lucide-react';
import { AdmissionApplication } from '../../types';
import { SchoolLogo } from '../SchoolLogo';

interface AdmissionsViewProps {
  onNavigate: (view: string) => void;
  onAdmissionSubmitted: () => void | Promise<void>;
}

const money = (val: number) => `₦${val.toLocaleString()}`;

const getFeeSummaryForApplication = (arm: 'NURSERY' | 'PRIMARY' | 'SECONDARY', classApplying: string) => {
  const baseTuition = arm === 'NURSERY' ? 35000 : arm === 'PRIMARY' ? 42000 : 55000;
  const developmentLevy = arm === 'NURSERY' ? 4500 : arm === 'PRIMARY' ? 6000 : 8500;
  const sportsLevy = arm === 'SECONDARY' ? 6500 : 3500;
  const uniformFee = arm === 'SECONDARY' ? 12000 : 8000;
  const applicationFee = 5000;
  const examFee = 15000;
  const totalPayable = baseTuition + developmentLevy + sportsLevy + uniformFee + applicationFee + examFee;

  return {
    programName: classApplying,
    arm,
    applicationFee,
    examFee,
    baseTuition,
    developmentLevy,
    sportsLevy,
    uniformFee,
    totalPayable,
  };
};

const drawSchoolEmblem = (pdf: jsPDF, x: number, y: number) => {
  pdf.setFillColor(255, 255, 255);
  pdf.circle(x + 18, y + 18, 16, 'F');
  pdf.setDrawColor(234, 179, 8);
  pdf.setLineWidth(1.5);
  pdf.circle(x + 18, y + 18, 16, 'S');
  pdf.setFillColor(6, 78, 59);
  pdf.circle(x + 18, y + 18, 10, 'F');
  pdf.setTextColor(234, 179, 8);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('P', x + 15, y + 23);
  pdf.setDrawColor(234, 179, 8);
  pdf.setLineWidth(1);
  pdf.line(x + 5, y + 30, x + 28, y + 30);
};

const addPdfHeader = (pdf: jsPDF, title: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(6, 78, 59);
  pdf.rect(0, 0, pageWidth, 78, 'F');
  drawSchoolEmblem(pdf, 38, 16);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('PECULIAR COLLEGE DOMA', 78, 44);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Nurturing Minds • Building Character', 78, 60);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(title, 40, 102);
  pdf.setTextColor(15, 23, 42);
};

const buildApplicationSummaryPdf = (application: AdmissionApplication) => {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const feeSummary = getFeeSummaryForApplication(application.arm, application.classApplying);
  const examStatus = getAdmissionExamStatus(application);

  addPdfHeader(pdf, 'Application Summary');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Applicant Information', 40, 130);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const applicantLines = [
    `Applicant: ${application.firstName} ${application.middleName || ''} ${application.lastName}`,
    `Reference Number: ${application.id}`,
    `Class Applying: ${application.classApplying} (${application.arm})`,
    `Status: ${application.status}`,
    `Date of Birth: ${application.dateOfBirth}`,
    `Gender: ${application.gender}`,
  ];
  applicantLines.forEach((line, index) => pdf.text(line, 40, 148 + index * 16));

  pdf.setFont('helvetica', 'bold');
  pdf.text('Parent / Guardian Details', 320, 130);
  pdf.setFont('helvetica', 'normal');
  const parentLines = [
    `Parent / Guardian: ${application.parentFullName}`,
    `Phone: ${application.parentPhone}`,
    `Email: ${application.parentEmail || 'Not provided'}`,
    `Address: ${application.residentialAddress}`,
    `Relationship: ${application.relationship || 'Parent'}`,
  ];
  parentLines.forEach((line, index) => pdf.text(line, 320, 148 + index * 16));

  pdf.setFont('helvetica', 'bold');
  pdf.text('Admission Guidelines', 40, 330);
  pdf.setFont('helvetica', 'normal');
  const guidelines = [
    '1. Keep your application reference number safe for updates and follow-up.',
    '2. Bring all required documents including birth certificate and academic records.',
    '3. Applicants must attend the admission screening/interview and placement examination.',
    '4. The school will communicate exam dates through phone, SMS, or WhatsApp.',
  ];
  guidelines.forEach((line, index) => pdf.text(line, 40, 348 + index * 18));

  pdf.setFont('helvetica', 'bold');
  pdf.text('Fee Summary', 40, 440);
  pdf.setFont('helvetica', 'normal');
  const feeLines = [
    `Application Fee: ${money(feeSummary.applicationFee)}`,
    `Screening / Exam Fee: ${money(feeSummary.examFee)}`,
    `Tuition / Class Fee: ${money(feeSummary.baseTuition)}`,
    `Development Levy: ${money(feeSummary.developmentLevy)}`,
    `Sports Levy: ${money(feeSummary.sportsLevy)}`,
    `Uniform Fee: ${money(feeSummary.uniformFee)}`,
    `Estimated Total: ${money(feeSummary.totalPayable)}`,
  ];
  feeLines.forEach((line, index) => pdf.text(line, 40, 458 + index * 16));

  pdf.setFont('helvetica', 'bold');
  pdf.text('Exam / Screening Status', 320, 330);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const statusLines = pdf.splitTextToSize(`${examStatus.label}. ${examStatus.message}`, 200);
  pdf.text(statusLines, 320, 350);
  if (application.interviewDate) {
    pdf.text(`Screening Date: ${application.interviewDate}`, 320, 390);
  }

  pdf.setDrawColor(202, 138, 4);
  pdf.setLineWidth(1);
  pdf.line(40, 600, 555, 600);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Generated by Peculiar College Doma Admissions Office', 40, 618);

  return pdf;
};

const buildAdmissionLetterPdf = (application: AdmissionApplication) => {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const feeSummary = getFeeSummaryForApplication(application.arm, application.classApplying);

  addPdfHeader(pdf, 'Official Admission Letter');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const letterDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  pdf.text(`Date: ${letterDate}`, 40, 130);
  pdf.text(`To: ${application.parentFullName}`, 40, 152);
  pdf.text(`Ref No: ${application.id}`, 40, 170);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('PROVISIONAL ADMISSION OFFER', 40, 205);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const paragraphs = [
    `Dear ${application.parentFullName},`,
    '',
    `We are pleased to inform you that ${application.firstName} ${application.lastName} has been offered provisional admission into Peculiar College Doma for the ${application.classApplying} class under the ${application.arm} section for the 2026/2027 academic session.`,
    'This offer is subject to the completion of all required admission formalities and evidence of the student’s supporting documents during registration.',
    'The school expects the candidate to attend the designated orientation and registration schedule, and to present the original copies of all required documents at the school office.',
    `Estimated school fees for ${application.classApplying} are as follows: ${money(feeSummary.baseTuition)} tuition / class fee, ${money(feeSummary.developmentLevy)} development levy, ${money(feeSummary.sportsLevy)} sports levy, ${money(feeSummary.uniformFee)} uniform fee, plus the admission and exam charges of ${money(feeSummary.applicationFee)} and ${money(feeSummary.examFee)}. Total estimated commitment: ${money(feeSummary.totalPayable)}.`,
    'We congratulate the family on this opportunity and look forward to a productive and disciplined academic journey.',
  ];
  paragraphs.forEach((line, index) => {
    if (line === '') {
      return;
    }
    const wrapped = pdf.splitTextToSize(line, 500);
    pdf.text(wrapped, 40, 228 + index * 18);
  });

  pdf.setFont('helvetica', 'bold');
  pdf.text('School Fees Summary', 40, 430);
  pdf.setFont('helvetica', 'normal');
  const feeText = [
    `Application Fee: ${money(feeSummary.applicationFee)}`,
    `Screening / Exam Fee: ${money(feeSummary.examFee)}`,
    `Tuition / Class Fee: ${money(feeSummary.baseTuition)}`,
    `Development Levy: ${money(feeSummary.developmentLevy)}`,
    `Sports Levy: ${money(feeSummary.sportsLevy)}`,
    `Uniform Fee: ${money(feeSummary.uniformFee)}`,
    `Total Estimated Fees: ${money(feeSummary.totalPayable)}`,
  ];
  feeText.forEach((line, index) => pdf.text(line, 40, 450 + index * 18));

  pdf.setDrawColor(16, 185, 129);
  pdf.setLineWidth(1);
  pdf.line(400, 560, 540, 560);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Mrs. R. A. Adams', 400, 575);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Principal', 400, 592);
  pdf.text('Peculiar College Doma', 400, 608);

  return pdf;
};

const buildGeneralGuidelinesPdf = () => {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  addPdfHeader(pdf, 'Guidelines & School Fees Summary');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Admission Policy Guidelines', 40, 130);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const policyText = [
    '• Complete the online or hardcopy admission form before the closing date in the academic session.',
    '• Submit the student’s birth certificate, recent passport photograph, and previous academic records where required.',
    '• All applicants for nursery, primary, and secondary classes must undergo the admission screening or oral interview.',
    '• The school communicates results and assessment dates to parents through phone, email, or WhatsApp.',
    '• The school reserves the right to accept, shortlist, or decline applications based on assessment and available spaces.',
  ];
  policyText.forEach((line, index) => pdf.text(line, 40, 150 + index * 18));

  pdf.setFont('helvetica', 'bold');
  pdf.text('Required Documents', 320, 130);
  pdf.setFont('helvetica', 'normal');
  const documents = [
    '• Completed application form',
    '• Birth certificate or age declaration',
    '• Two recent passport photographs',
    '• Previous school report / testimonial',
    '• Medical fitness/ immunization record',
    '• Transfer certificate for transfer students',
  ];
  documents.forEach((line, index) => pdf.text(line, 320, 150 + index * 18));

  pdf.setFont('helvetica', 'bold');
  pdf.text('School Fees Summary by Section', 40, 330);
  pdf.setFont('helvetica', 'normal');

  const feeRows = [
    ['Nursery', 'Creche / Nursery 1-3', `${money(35000)} tuition • ${money(4500)} development • ${money(3500)} sports • ${money(8000)} uniform`],
    ['Primary', 'Primary 1-6', `${money(42000)} tuition • ${money(6000)} development • ${money(3500)} sports • ${money(8000)} uniform`],
    ['Secondary', 'JSS 1-3 / SSS 1-3', `${money(55000)} tuition • ${money(8500)} development • ${money(6500)} sports • ${money(12000)} uniform`],
  ];
  feeRows.forEach((row, index) => {
    pdf.text(`${row[0]}: ${row[1]}`, 40, 348 + index * 26);
    pdf.text(row[2], 40, 360 + index * 26);
  });

  pdf.setFont('helvetica', 'bold');
  pdf.text('General Admission Charges', 40, 470);
  pdf.setFont('helvetica', 'normal');
  const charges = [
    `Application Fee: ${money(5000)}`,
    `Entrance / Screening Exam Fee: ${money(15000)}`,
    `Estimated Total Commitment: ${money(60000)}`,
  ];
  charges.forEach((line, index) => pdf.text(line, 40, 488 + index * 18));

  pdf.setFont('helvetica', 'bold');
  pdf.text('Screening & Interview', 320, 330);
  pdf.setFont('helvetica', 'normal');
  const screening = [
    '• Nursery candidates undergo a friendly oral assessment.',
    '• Primary and Secondary candidates sit for English, Mathematics, and General Knowledge tests.',
    '• Oral interview is conducted for shortlisted applicants.',
    '• Parents should keep phone numbers active for updates.',
  ];
  screening.forEach((line, index) => pdf.text(line, 320, 350 + index * 18));

  pdf.setDrawColor(202, 138, 4);
  pdf.setLineWidth(1);
  pdf.line(40, 600, 555, 600);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Peculiar College Doma • Admissions Office', 40, 618);

  return pdf;
};

const triggerPdfDownload = (pdf: jsPDF, filename: string) => {
  pdf.save(filename);
};

const getAdmissionExamStatus = (application: AdmissionApplication) => {
  if (application.status === 'ACCEPTED') {
    return {
      label: 'Exam completed / admission confirmed',
      message: 'The candidate is cleared to continue and has satisfied the admission screening requirement.',
      isScheduled: true,
    };
  }

  if (application.status === 'SHORTLISTED' || application.status === 'UNDER_REVIEW') {
    return {
      label: 'Screening exam is required',
      message: 'A placement/entrance assessment is scheduled for this candidate and the school will confirm the date.',
      isScheduled: Boolean(application.interviewDate),
    };
  }

  if (application.interviewDate) {
    return {
      label: 'Exam scheduled',
      message: `The candidate has an exam or screening date on ${application.interviewDate}.`,
      isScheduled: true,
    };
  }

  return {
    label: 'No exam scheduled yet',
    message: 'The candidate has submitted the application and will be notified about the screening exam date.',
    isScheduled: false,
  };
};

const downloadAdmissionSummary = (application: AdmissionApplication | null) => {
  if (!application) return;
  triggerPdfDownload(buildApplicationSummaryPdf(application), `admission-summary-${application.id}.pdf`);
};

const downloadAdmissionLetter = (application: AdmissionApplication | null) => {
  if (!application || application.status !== 'ACCEPTED') return;
  triggerPdfDownload(buildAdmissionLetterPdf(application), `admission-letter-${application.id}.pdf`);
};

const downloadGeneralGuidelinesPdf = () => {
  triggerPdfDownload(buildGeneralGuidelinesPdf(), 'peculiar-college-guidelines-and-fees.pdf');
};

export const AdmissionsView: React.FC<AdmissionsViewProps> = ({ onNavigate, onAdmissionSubmitted }) => {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'apply' | 'track'>('apply');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '2016-05-12',
    arm: 'SECONDARY' as 'NURSERY' | 'PRIMARY' | 'SECONDARY',
    classApplying: 'JSS 1',
    previousSchool: '',
    residentialAddress: 'Doma, Nasarawa State',
    stateOfOrigin: 'Nasarawa',
    lga: 'Doma',
    parentFullName: '',
    parentPhone: '',
    parentEmail: '',
    relationship: 'Father',
    parentOccupation: '',
    parentAddress: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedApp, setTrackedApp] = useState<AdmissionApplication | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = window.localStorage.getItem('pcd-last-submitted-admission');
      if (saved) {
        const parsed = JSON.parse(saved) as AdmissionApplication;
        if (parsed?.id) {
          setSubmittedApp(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to restore saved admission summary', err);
    }
  }, []);

  const resetApplicationForm = () => {
    setSubmittedApp(null);
    setSubmitError(null);
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'Male',
      dateOfBirth: '2016-05-12',
      arm: 'SECONDARY',
      classApplying: 'JSS 1',
      previousSchool: '',
      residentialAddress: 'Doma, Nasarawa State',
      stateOfOrigin: 'Nasarawa',
      lga: 'Doma',
      parentFullName: '',
      parentPhone: '',
      parentEmail: '',
      relationship: 'Father',
      parentOccupation: '',
      parentAddress: '',
    });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('pcd-last-submitted-admission');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          passportPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmittedApp(data.application);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('pcd-last-submitted-admission', JSON.stringify(data.application));
      }
      await onAdmissionSubmitted();
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check all required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackError(null);
    setTrackedApp(null);
    setTrackingLoading(true);

    try {
      const res = await fetch(`/api/admissions?query=${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No matching application found');
      }
      setTrackedApp(data.application);
    } catch (err: any) {
      setTrackError(err.message || 'Application not found with provided reference or phone number');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-8 pb-20">
      {/* Banner */}
      <section className="bg-gradient-to-b from-emerald-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026/2027 Academic Session Admissions Open</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Admissions & Student Enrollment
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Begin your child's journey toward academic distinction and moral character. Apply online in minutes or track your application status.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'apply'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              1. Online Application Form
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              2. Track Application Status
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'guidelines'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              3. Guidelines & Fees
            </button>
          </div>
        </div>

        {/* TAB 1: APPLY */}
        {activeTab === 'apply' && (
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-sm">
            {submittedApp ? (
              <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Application Submitted Successfully!</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Your application for <strong>{submittedApp.firstName} {submittedApp.lastName}</strong> has been registered in our admissions system.
                  </p>
                </div>

                <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-2">
                  <div className="flex justify-between items-center border-b border-amber-200/80 pb-2">
                    <span className="text-xs font-bold text-amber-900 uppercase">Application Reference No</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {submittedApp.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-500 block">Class Applying:</span>
                      <span className="font-semibold">{submittedApp.classApplying} ({submittedApp.arm})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Parent / Guardian:</span>
                      <span className="font-semibold">{submittedApp.parentFullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number:</span>
                      <span className="font-semibold">{submittedApp.parentPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Submission Date:</span>
                      <span className="font-semibold">{submittedApp.submissionDate}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 text-left space-y-2">
                  <span className="font-bold text-slate-900 block">Next Steps:</span>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Keep your reference number safe (<strong>{submittedApp.id}</strong>).</li>
                    <li>You will receive an SMS / WhatsApp message regarding the entrance assessment and oral interview date.</li>
                    <li>Bring 2 passport photographs and birth certificate photocopy on the screening date.</li>
                  </ol>
                </div>

                <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Application Summary</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">{submittedApp.status}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 block">Application Guidelines</span>
                        <ul className="mt-2 list-disc pl-4 space-y-1">
                          <li>Keep the application reference safe for updates.</li>
                          <li>Bring all required documents for the oral screening.</li>
                          <li>All applicants must attend the admissions exam or interview.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 block">Fees Summary</span>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between"><span>Application fee</span><strong>₦5,000</strong></div>
                          <div className="flex justify-between"><span>Screening / exam fee</span><strong>₦15,000</strong></div>
                          <div className="flex justify-between"><span>Tuition / class fee</span><strong>₦{getFeeSummaryForApplication(submittedApp.arm, submittedApp.classApplying).baseTuition.toLocaleString()}</strong></div>
                          <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200"><span>Total estimated</span><strong>₦{getFeeSummaryForApplication(submittedApp.arm, submittedApp.classApplying).totalPayable.toLocaleString()}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 block">Exam / Screening Status</span>
                    <p className="mt-2 text-sm text-slate-700">
                      {getAdmissionExamStatus(submittedApp).label}.
                      {submittedApp.interviewDate ? ` ${submittedApp.interviewDate}` : ' The schedule will be shared by SMS / WhatsApp.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => downloadAdmissionSummary(submittedApp)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Summary PDF</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedApp(null);
                      setActiveTab('track');
                      setTrackQuery(submittedApp.id);
                    }}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                  >
                    Track This Application →
                  </button>
                  <button
                    onClick={resetApplicationForm}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    Apply Another Candidate
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-8">
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Section A: Student Bio-Data */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center">
                        1
                      </span>
                      <span>Student Bio-Data</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter the prospective student's legal names as on birth certificate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleFormChange}
                        placeholder="e.g. Emmanuel"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleFormChange}
                        placeholder="e.g. Daniel"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Surname / Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleFormChange}
                        placeholder="e.g. Adamu"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        School Arm *
                      </label>
                      <select
                        name="arm"
                        value={formData.arm}
                        onChange={(e) => {
                          const arm = e.target.value as any;
                          setFormData({
                            ...formData,
                            arm,
                            classApplying: arm === 'NURSERY' ? 'Nursery 1' : arm === 'PRIMARY' ? 'Primary 1' : 'JSS 1',
                          });
                        }}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      >
                        <option value="NURSERY">Nursery Arm</option>
                        <option value="PRIMARY">Primary Arm</option>
                        <option value="SECONDARY">Secondary College</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Class Applying For *
                      </label>
                      <select
                        name="classApplying"
                        value={formData.classApplying}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      >
                        {formData.arm === 'NURSERY' && (
                          <>
                            <option value="Creche">Creche (Ages 1 - 2)</option>
                            <option value="Nursery 1">Nursery 1</option>
                            <option value="Nursery 2">Nursery 2</option>
                            <option value="Nursery 3 / Transition">Nursery 3 / Transition</option>
                          </>
                        )}
                        {formData.arm === 'PRIMARY' && (
                          <>
                            <option value="Primary 1">Primary 1</option>
                            <option value="Primary 2">Primary 2</option>
                            <option value="Primary 3">Primary 3</option>
                            <option value="Primary 4">Primary 4</option>
                            <option value="Primary 5">Primary 5</option>
                            <option value="Primary 6">Primary 6</option>
                          </>
                        )}
                        {formData.arm === 'SECONDARY' && (
                          <>
                            <option value="JSS 1">JSS 1 (Junior Secondary)</option>
                            <option value="JSS 2">JSS 2 (Transfer)</option>
                            <option value="JSS 3">JSS 3 (Transfer)</option>
                            <option value="SSS 1 (Science)">SSS 1 (Science Dept)</option>
                            <option value="SSS 1 (Arts)">SSS 1 (Arts Dept)</option>
                            <option value="SSS 1 (Commercial)">SSS 1 (Commercial Dept)</option>
                            <option value="SSS 2 (Science)">SSS 2 (Science Dept)</option>
                            <option value="SSS 2 (Arts)">SSS 2 (Arts Dept)</option>
                            <option value="SSS 2 (Commercial)">SSS 2 (Commercial Dept)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Previous School Attended
                      </label>
                      <input
                        type="text"
                        name="previousSchool"
                        value={formData.previousSchool}
                        onChange={handleFormChange}
                        placeholder="e.g. St. John's Primary, Doma"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        State of Origin
                      </label>
                      <input
                        type="text"
                        name="stateOfOrigin"
                        value={formData.stateOfOrigin}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        LGA of Origin
                      </label>
                      <input
                        type="text"
                        name="lga"
                        value={formData.lga}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Parent / Guardian Information */}
                <div className="space-y-4 pt-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center">
                        2
                      </span>
                      <span>Parent / Guardian Details</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      We will use these details to communicate admission status and interview schedules.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parent Full Name *
                      </label>
                      <input
                        type="text"
                        name="parentFullName"
                        required
                        value={formData.parentFullName}
                        onChange={handleFormChange}
                        placeholder="e.g. Mr. John Adamu"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number (WhatsApp preferred) *
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        required
                        value={formData.parentPhone}
                        onChange={handleFormChange}
                        placeholder="e.g. 0803 123 4567"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleFormChange}
                        placeholder="parent@gmail.com"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Relationship to Child
                      </label>
                      <select
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Legal Guardian</option>
                        <option value="Sponsor">Sponsor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="parentOccupation"
                        value={formData.parentOccupation}
                        onChange={handleFormChange}
                        placeholder="e.g. Civil Servant / Trader"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Residential Address in Doma / Nasarawa *
                      </label>
                      <input
                        type="text"
                        name="residentialAddress"
                        required
                        value={formData.residentialAddress}
                        onChange={handleFormChange}
                        placeholder="e.g. Sabon Gari, Doma"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    * Required fields for official 2026/2027 registration
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={resetApplicationForm}
                      className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-all"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Application Now'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TRACK APPLICATION */}
        {activeTab === 'track' && (
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Track Admission Application</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Enter your application reference number (e.g. <code className="text-emerald-700 font-bold">PCD-2026-0001</code>) or parent's phone number.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-md mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="PCD-2026-0001 or 0803..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                {trackingLoading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {trackError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-xs text-red-700 mb-6">
                {trackError}
              </div>
            )}

            {trackedApp && (
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Applicant Name
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      {trackedApp.firstName} {trackedApp.middleName || ''} {trackedApp.lastName}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Class: <strong>{trackedApp.classApplying}</strong> • Ref: <span className="font-mono text-emerald-800 font-bold">{trackedApp.id}</span>
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        trackedApp.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : trackedApp.status === 'SHORTLISTED'
                          ? 'bg-blue-100 text-blue-800'
                          : trackedApp.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {trackedApp.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Status Timeline Stepper */}
                <div className="py-4">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1 shadow-xs">
                        ✓
                      </div>
                      <span className="text-emerald-900">Submitted</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs ${
                          trackedApp.status !== 'SUBMITTED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-400 text-slate-950 animate-pulse'
                        }`}
                      >
                        {trackedApp.status !== 'SUBMITTED' ? '✓' : '2'}
                      </div>
                      <span className="text-slate-700">Under Review</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs ${
                          trackedApp.status === 'SHORTLISTED' || trackedApp.status === 'ACCEPTED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {trackedApp.status === 'ACCEPTED' ? '✓' : '3'}
                      </div>
                      <span className="text-slate-700">Screening/Exam</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs ${
                          trackedApp.status === 'ACCEPTED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        4
                      </div>
                      <span className="text-slate-700">Decision</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
                    <span className="font-bold text-slate-900 block">Guidelines & Fees Summary</span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Bring birth certificate, passport photographs, and previous report for review.</li>
                      <li>All applicants must attend the admissions screening and interview.</li>
                      <li>Estimated cost: ₦{getFeeSummaryForApplication(trackedApp.arm, trackedApp.classApplying).totalPayable.toLocaleString()} total.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-slate-700 space-y-2">
                    <span className="font-bold text-amber-900 block">Exam / Screening Status</span>
                    <p>{getAdmissionExamStatus(trackedApp).label}.</p>
                    <p>{getAdmissionExamStatus(trackedApp).message}</p>
                    {trackedApp.interviewDate && (
                      <div className="pt-1 font-semibold text-amber-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        <span>{trackedApp.interviewDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {trackedApp.status === 'ACCEPTED' && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => downloadAdmissionLetter(trackedApp)}
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Admission Letter PDF
                    </button>
                  </div>
                )}

                {/* Admission Office Remarks */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-emerald-900 block">Admissions Committee Notes:</span>
                  <p className="text-slate-700 leading-relaxed">
                    {trackedApp.reviewNotes || 'Your application has been received and logged into our admissions database. Kindly keep your phone active for notification.'}
                  </p>
                  {trackedApp.interviewDate && (
                    <div className="pt-2 font-semibold text-emerald-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span>Screening / Interview Date: {trackedApp.interviewDate} (8:30 AM at Secondary Hall)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GUIDELINES & CRITERIA */}
        {activeTab === 'guidelines' && (
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Admission Policy & Guidelines</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Peculiar College Doma welcomes prospective students of all backgrounds who demonstrate willingness to adhere to the school's moral and academic standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>Required Documents for Admission</span>
                </h4>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-2">
                  <li>• Completed Online or Hardcopy Application Form.</li>
                  <li>• Photocopy of Student's Official Birth Certificate or Declaration of Age.</li>
                  <li>• Two (2) recent clear passport photographs (white/red background).</li>
                  <li>• Last Terminal Report Sheet from previous school (Primary 2 – SSS 2 transfers).</li>
                  <li>• Medical Fitness Certificate / Immunization record.</li>
                  <li>• Transfer Certificate / Testimonial (for Senior Secondary transfer applicants).</li>
                </ul>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span>Age Placement Guidelines</span>
                </h4>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-2">
                  <li>• <strong>Creche / Pre-Nursery:</strong> 18 months – 2 years.</li>
                  <li>• <strong>Nursery 1 – 3:</strong> 3 – 5 years of age.</li>
                  <li>• <strong>Basic / Primary 1:</strong> Minimum of 5 to 6 years of age.</li>
                  <li>• <strong>Junior Secondary (JSS 1):</strong> Minimum of 10 to 11 years of age.</li>
                  <li>• <strong>Senior Secondary (SSS 1):</strong> Completed BECE / Junior WAEC certificate.</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Entrance Screening Examination & Oral Interview
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Candidates applying for Primary 1 through SSS 2 sit for a placement test in English Language, Mathematics, and General Knowledge. Nursery pupils participate in a friendly oral assessment.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={downloadGeneralGuidelinesPdf}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Guidelines & School Fees PDF
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
