import React from 'react';
import { AcademicResult } from '../../types';
import { SchoolLogo } from '../SchoolLogo';
import { X, Printer, Award, ShieldCheck, Calendar, User } from 'lucide-react';

interface ReportCardModalProps {
  result: AcademicResult | null;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8">
        {/* Modal Actions Bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Official Terminal Report Sheet</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Report Card</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Sheet Document */}
        <div className="p-8 sm:p-12 text-slate-900 space-y-6">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-emerald-800 pb-6 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <SchoolLogo size="lg" showText={false} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  PECULIAR COLLEGE DOMA
                </h1>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Nursery • Primary • Secondary Education
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Off Ruttu Road / 09 Peace Road, Doma, Nasarawa State, Nigeria
                </p>
                <p className="text-[11px] text-slate-500">
                  Tel: +234 904 339 0882 • Email: peculiarschoolsdoma2006@gmail.com
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
              <span className="inline-block bg-emerald-900 text-amber-300 font-extrabold text-xs px-3 py-1 rounded">
                CONTINUOUS ASSESSMENT DOSSIER
              </span>
              <p className="text-xs font-bold text-slate-800 mt-1">
                {result.term.toUpperCase()} REPORT SHEET
              </p>
              <p className="text-xs text-slate-600">Session: {result.academicSession}</p>
            </div>
          </div>

          {/* Student Profile Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">STUDENT NAME:</span>
              <span className="font-bold text-slate-900 text-sm">{result.studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">ADMISSION NO:</span>
              <span className="font-bold text-slate-900 font-mono">{result.admissionNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">CLASS:</span>
              <span className="font-bold text-slate-900">{result.className} ({result.arm})</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">ATTENDANCE:</span>
              <span className="font-bold text-slate-900">
                {result.attendanceDays} of {result.totalDays} Days
              </span>
            </div>
          </div>

          {/* Performance Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">TOTAL SCORE</span>
              <span className="text-lg font-black text-emerald-950">
                {result.totalScore} / {result.maxScore}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-xs text-blue-800 font-semibold block">TERM AVERAGE</span>
              <span className="text-lg font-black text-blue-950">{result.average}%</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800 font-semibold block">POSITION IN CLASS</span>
              <span className="text-lg font-black text-amber-950">
                {result.positionInClass}
                <span className="text-xs font-normal text-slate-600"> / {result.totalStudentsInClass}</span>
              </span>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <span className="text-xs text-purple-800 font-semibold block">DECISION</span>
              <span className="text-lg font-black text-purple-950">
                {result.average >= 50 ? 'PASSED' : 'REMEDIAL'}
              </span>
            </div>
          </div>

          {/* Subject Scores Table */}
          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200">#</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Subject</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">CA (40)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">Exam (60)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 font-extrabold">Total (100)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">Grade</th>
                  <th className="py-2.5 px-4">Subject Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {result.subjects.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-bold text-slate-900">
                      {sub.subject}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">
                      {sub.caScore}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">
                      {sub.examScore}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200 font-mono font-bold text-emerald-900">
                      {sub.total}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200 font-extrabold">
                      <span
                        className={
                          sub.grade === 'A'
                            ? 'text-emerald-700'
                            : sub.grade === 'B'
                            ? 'text-blue-700'
                            : sub.grade === 'C'
                            ? 'text-teal-700'
                            : sub.grade === 'D'
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }
                      >
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-600 text-[11px] italic">{sub.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Teacher and Principal Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-bold text-slate-700 block uppercase">Class Teacher's Remark:</span>
              <p className="text-slate-800 italic">"{result.teacherRemark}"</p>
              <div className="pt-2 flex justify-between text-[11px] text-slate-500">
                <span>Sign: Mr. D. E. Silas</span>
                <span>Date: {result.publishedDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="font-bold text-emerald-900 block uppercase">Principal's Recommendation:</span>
              <p className="text-slate-800 italic">"{result.principalRemark}"</p>
              <div className="pt-2 flex justify-between text-[11px] text-emerald-800">
                <span className="font-semibold">Mrs. R. A. Adams (Principal)</span>
                <span className="text-emerald-700 font-bold">[OFFICIALLY VERIFIED]</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
            <span>Motto: Knowledge, Character and Excellence</span>
            <span>Resumption Date for Next Term: Monday, 14th September 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
