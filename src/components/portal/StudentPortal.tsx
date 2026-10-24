import React from 'react';
import { User, Student, AcademicResult } from '../../types';
import { Download, Printer, User as UserIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface StudentPortalProps {
  user: User;
  students: Student[];
  results: AcademicResult[];
  onOpenReportCard: (result: AcademicResult) => void;
}

const buildStudentResultPdf = (student: Student, result: AcademicResult) => {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(15, 118, 110);
  pdf.rect(0, 0, pageWidth, 74, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text('PECULIAR COLLEGE DOMA', 40, 34);

  pdf.setFontSize(9);
  pdf.setTextColor(220, 252, 231);
  pdf.text('NURSERY • PRIMARY • SECONDARY • EXCELLENCE', 40, 52);

  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  const infoY = 110;
  pdf.setFont('helvetica', 'bold');
  pdf.text('STUDENT RESULT SUMMARY', 40, infoY);
  pdf.setFont('helvetica', 'normal');

  const lines = [
    `Student: ${student.firstName} ${student.lastName}`,
    `Admission No: ${student.admissionNo}`,
    `Class: ${student.className} (${student.arm})`,
    `Session: ${result.academicSession}`,
    `Term: ${result.term}`,
    `Average: ${result.average}%`,
    `Position: ${result.positionInClass ?? '-'} / ${result.totalStudentsInClass ?? '-'}`,
  ];

  lines.forEach((line, index) => {
    pdf.text(line, 40, infoY + 18 + index * 16);
  });

  pdf.setFont('helvetica', 'bold');
  pdf.text('SUBJECTS', 40, 230);
  pdf.setFont('helvetica', 'normal');

  let y = 252;
  result.subjects.forEach((subject, index) => {
    pdf.text(`${index + 1}. ${subject.subject}`, 40, y);
    pdf.text(`${subject.caScore}`, 250, y);
    pdf.text(`${subject.examScore}`, 310, y);
    pdf.text(`${subject.total}`, 370, y);
    pdf.text(`${subject.grade}`, 430, y);
    pdf.text(`${subject.remark}`, 470, y);
    y += 18;
  });

  pdf.setFont('helvetica', 'bold');
  pdf.text('Teacher Remark:', 40, y + 26);
  pdf.setFont('helvetica', 'normal');
  pdf.text(result.teacherRemark, 150, y + 26, { maxWidth: 360 });

  pdf.setFont('helvetica', 'bold');
  pdf.text('Principal Remark:', 40, y + 58);
  pdf.setFont('helvetica', 'normal');
  pdf.text(result.principalRemark, 150, y + 58, { maxWidth: 360 });

  pdf.setTextColor(71, 85, 105);
  pdf.setFontSize(9);
  pdf.text('Official School Result Record | Downloaded by student portal', 40, 760);

  pdf.save(`${student.firstName}_${student.lastName}_${result.term.replace(/\s+/g, '_')}_result.pdf`);
};

export const StudentPortal: React.FC<StudentPortalProps> = ({
  user,
  students = [],
  results = [],
  onOpenReportCard,
}) => {
  const linkedStudentIds = Array.isArray(user.linkedStudentIds) ? user.linkedStudentIds : [];
  const permittedStudents = students.filter((student) => linkedStudentIds.includes(student.id));
  const currentStudent = permittedStudents[0] || null;
  const studentResult = currentStudent
    ? [...results]
        .filter((result) => result.studentId === currentStudent.id)
        .sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''))[0] || null
    : null;

  const handleDownloadResult = () => {
    if (!currentStudent || !studentResult) return;
    buildStudentResultPdf(currentStudent, studentResult);
  };

  if (!currentStudent) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No linked student record found</h3>
        <p className="text-xs text-slate-500 mt-2">
          This student account is not linked to any active student profile. Contact the school administration for access.
        </p>
      </div>
    );
  }

  if (!studentResult) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Printer className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No result has been published yet</h3>
        <p className="text-xs text-slate-500 mt-2">
          Your academic result will appear here once the school publishes the latest report sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
            {currentStudent.firstName[0]}
            {currentStudent.lastName[0]}
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
              Peculiar Student Portal
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              {currentStudent.firstName} {currentStudent.lastName}
            </h1>
            <p className="text-xs text-blue-200 mt-0.5">
              Admission No: <span className="font-mono text-white">{currentStudent.admissionNo}</span> • Class: {currentStudent.className} • Sports House: {currentStudent.sportsHouse}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs text-slate-400 font-semibold block">CURRENT CLASS</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">{currentStudent.className}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs text-slate-400 font-semibold block">SPORTS HOUSE</span>
          <span className="text-lg font-black text-purple-700 mt-1 block">{currentStudent.sportsHouse.split(' ')[0]}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs text-slate-400 font-semibold block">LAST TERM AVERAGE</span>
          <span className="text-lg font-black text-emerald-800 mt-1 block">{studentResult.average}%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs text-slate-400 font-semibold block">CLASS POSITION</span>
          <span className="text-lg font-black text-amber-700 mt-1 block">
            {studentResult.positionInClass ?? '-'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">My Academic Record</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{studentResult.term} Report</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadResult}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => onOpenReportCard(studentResult)}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-3 text-center">CA (40)</th>
                <th className="py-2.5 px-3 text-center">Exam (60)</th>
                <th className="py-2.5 px-3 text-center font-bold">Total (100)</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-4">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {studentResult.subjects.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 px-4 font-bold text-slate-900">{s.subject}</td>
                  <td className="py-2 px-3 text-center font-mono">{s.caScore}</td>
                  <td className="py-2 px-3 text-center font-mono">{s.examScore}</td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">{s.total}</td>
                  <td className="py-2 px-3 text-center font-extrabold">{s.grade}</td>
                  <td className="py-2 px-4 text-slate-500 italic">{s.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
