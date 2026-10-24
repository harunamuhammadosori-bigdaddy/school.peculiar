import React, { useState } from 'react';
import { User, Student, AcademicResult, FeeLedger, FeePayment } from '../../types';
import {
  GraduationCap,
  CreditCard,
  Calendar,
  Award,
  Clock,
  Printer,
  ChevronRight,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';

interface ParentPortalProps {
  user: User;
  students: Student[];
  results: AcademicResult[];
  fees: FeeLedger[];
  onOpenReportCard: (result: AcademicResult) => void;
  onOpenReceipt: (receipt: FeePayment) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  user,
  students = [],
  results = [],
  fees = [],
  onOpenReportCard,
  onOpenReceipt,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'academics' | 'fees' | 'timetable'>('academics');
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('10000');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentResult = results.find((r) => r.studentId === currentStudent?.id);
  const studentFee = fees.find((f) => f.studentId === currentStudent?.id);

  if (!currentStudent) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200">
        <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Student Linked</h3>
        <p className="text-xs text-slate-500">Contact the school administration to link your children's admission profiles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Portal Top Bar */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
              Parent & Guardian Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              Phone: {user.phone || '+234 803 000 0000'} • Email: {user.email}
            </p>
          </div>

          {/* Child Switcher Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-emerald-200 mr-1 font-semibold">Select Ward:</span>
            {students.map((stu) => (
              <button
                key={stu.id}
                onClick={() => setSelectedStudentId(stu.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  stu.id === currentStudent.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-700'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{stu.firstName} {stu.lastName}</span>
                <span className="text-[10px] opacity-80">({stu.className})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Child Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">STUDENT NAME</span>
            <span className="font-bold text-slate-900 text-sm">
              {currentStudent.firstName} {currentStudent.lastName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">ADMISSION NUMBER</span>
            <span className="font-mono font-bold text-slate-900">{currentStudent.admissionNo}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">CLASS & ARM</span>
            <span className="font-semibold text-slate-800">
              {currentStudent.className} ({currentStudent.arm})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">SPORTS HOUSE</span>
            <span className="font-semibold text-purple-700">{currentStudent.sportsHouse}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">ENROLLMENT STATUS</span>
            <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              {currentStudent.status}
            </span>
          </div>
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('academics')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'academics'
              ? 'bg-emerald-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Academic Terminal Results
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'fees'
              ? 'bg-emerald-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          School Fees & Receipts
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'timetable'
              ? 'bg-emerald-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Class Routine & Calendar
        </button>
      </div>

      {/* TAB 1: ACADEMICS */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          {studentResult ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                    Verified Terminal Assessment
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {studentResult.term} • {studentResult.academicSession}
                  </h3>
                </div>
                <button
                  onClick={() => onOpenReportCard(studentResult)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Official Report Card</span>
                </button>
              </div>

              {/* Performance Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-800 block">TERM AVERAGE</span>
                  <span className="text-2xl font-black text-emerald-950">{studentResult.average}%</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-semibold text-amber-800 block">POSITION IN CLASS</span>
                  <span className="text-2xl font-black text-amber-950">
                    {studentResult.positionInClass}
                    <span className="text-xs font-normal text-slate-600"> / {studentResult.totalStudentsInClass}</span>
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[11px] font-semibold text-blue-800 block">TOTAL SCORE</span>
                  <span className="text-2xl font-black text-blue-950">
                    {studentResult.totalScore}
                    <span className="text-xs font-normal text-slate-500"> / {studentResult.maxScore}</span>
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-600 block">ATTENDANCE</span>
                  <span className="text-xl font-black text-slate-900">
                    {studentResult.attendanceDays} / {studentResult.totalDays}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Subject</th>
                      <th className="py-2.5 px-3 text-center">CA (40)</th>
                      <th className="py-2.5 px-3 text-center">Exam (60)</th>
                      <th className="py-2.5 px-3 text-center font-bold">Total (100)</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {studentResult.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-4 font-bold text-slate-900">{sub.subject}</td>
                        <td className="py-2 px-3 text-center font-mono">{sub.caScore}</td>
                        <td className="py-2 px-3 text-center font-mono">{sub.examScore}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                          {sub.total}
                        </td>
                        <td className="py-2 px-3 text-center font-extrabold text-slate-900">
                          {sub.grade}
                        </td>
                        <td className="py-2 px-4 text-slate-500 italic">{sub.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Form Teacher's Remark:</span>
                  <p className="text-slate-800 italic">"{studentResult.teacherRemark}"</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">Principal's Recommendation:</span>
                  <p className="text-slate-800 italic">"{studentResult.principalRemark}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Published Results Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Results for this term are currently being collated and vetted by academic staff.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FEES */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {studentFee ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                    Bursary & Accounts
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {studentFee.term} Fee Statement ({studentFee.session})
                  </h3>
                </div>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Fees / Bank Details</span>
                </button>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block">TOTAL PAYABLE</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₦{studentFee.totalPayable.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block">TOTAL PAID</span>
                  <span className="text-2xl font-black text-emerald-900">
                    ₦{studentFee.totalPaid.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-800 font-semibold block">OUTSTANDING BALANCE</span>
                  <span className="text-2xl font-black text-amber-950">
                    ₦{studentFee.balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Fee Schedule Breakdown:
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-4">Item Description</th>
                        <th className="py-2 px-4 text-right">Amount (NGN)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { description: 'Tuition Fee', amount: studentFee.tuitionFee },
                        { description: 'Development Levy', amount: studentFee.developmentLevy },
                        { description: 'Sports Levy', amount: studentFee.sportsLevy },
                        { description: 'Examination Fee', amount: studentFee.examinationFee },
                        { description: 'Uniform Fee', amount: studentFee.uniformFee },
                      ].map((item) => (
                        <tr key={item.description}>
                          <td className="py-2 px-4 text-slate-800">{item.description}</td>
                          <td className="py-2 px-4 text-right font-mono font-semibold text-slate-900">
                            ₦{item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Receipts History */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Confirmed Payment Receipts:
                </h4>
                <div className="space-y-2">
                  {studentFee.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-emerald-800 block">
                          {p.receiptNumber}
                        </span>
                        <span className="text-slate-500">
                          Paid on {p.paymentDate} via {p.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm font-mono">
                          ₦{p.amountPaid.toLocaleString()}
                        </span>
                        <button
                          onClick={() => onOpenReceipt(p)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Fee Record Available</h4>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Weekly Academic Schedule • {currentStudent.className}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              School opens daily at 7:30 AM. Assembly begins promptly at 7:50 AM.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-emerald-900 text-white font-bold">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Monday</th>
                  <th className="py-2.5 px-3">Tuesday</th>
                  <th className="py-2.5 px-3">Wednesday</th>
                  <th className="py-2.5 px-3">Thursday</th>
                  <th className="py-2.5 px-3">Friday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-amber-50/60 font-semibold text-amber-900">
                  <td className="py-2 px-3">07:50 - 08:20</td>
                  <td colSpan={5} className="py-2 px-3 text-center">
                    Morning Assembly, Devotion, National Anthem & Inspection
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-slate-400">08:20 - 09:00</td>
                  <td className="py-2 px-3 font-semibold">Mathematics</td>
                  <td className="py-2 px-3 font-semibold">English Studies</td>
                  <td className="py-2 px-3 font-semibold">Basic Science</td>
                  <td className="py-2 px-3 font-semibold">Mathematics</td>
                  <td className="py-2 px-3 font-semibold">CRS</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-slate-400">09:00 - 09:40</td>
                  <td className="py-2 px-3 font-semibold">English Studies</td>
                  <td className="py-2 px-3 font-semibold">Mathematics</td>
                  <td className="py-2 px-3 font-semibold">Basic Tech</td>
                  <td className="py-2 px-3 font-semibold">English Studies</td>
                  <td className="py-2 px-3 font-semibold">Civic Education</td>
                </tr>
                <tr className="bg-slate-100/70 font-semibold text-slate-600">
                  <td className="py-1.5 px-3">11:00 - 11:30</td>
                  <td colSpan={5} className="py-1.5 px-3 text-center">
                    Mid-Day Break & Snack Interval
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-slate-400">11:30 - 12:50</td>
                  <td className="py-2 px-3 font-semibold">Agric Science</td>
                  <td className="py-2 px-3 font-semibold">Social Studies</td>
                  <td className="py-2 px-3 font-semibold">Cultural & Arts</td>
                  <td className="py-2 px-3 font-semibold">Computer Studies</td>
                  <td className="py-2 px-3 font-semibold">Sports & House Meet</td>
                </tr>
                <tr className="bg-emerald-50 text-emerald-900 font-semibold">
                  <td className="py-2 px-3">01:30 - 02:00</td>
                  <td colSpan={5} className="py-2 px-3 text-center">
                    Closing Devotion & Orderly Dismissal
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Make School Fee Payment</h3>
            <p className="text-xs text-slate-600">
              Payments can be completed via Direct Bank Transfer or at the school bursary desk in Doma.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Official School Account:</span>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Name:</span>
                <span className="font-bold text-slate-900">First Bank of Nigeria</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Name:</span>
                <span className="font-bold text-slate-900">Peculiar College Doma</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">3098765432</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs">
              <strong>Important:</strong> Use student admission number (<code>{currentStudent.admissionNo}</code>) as the payment narration or remark.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-700"
              >
                Close Payment Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
