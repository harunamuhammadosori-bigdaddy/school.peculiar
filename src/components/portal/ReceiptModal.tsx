import React from 'react';
import { jsPDF } from 'jspdf';
import { FeePayment } from '../../types';
import { SchoolLogo } from '../SchoolLogo';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  receipt: FeePayment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      // Outer border frame
      doc.setDrawColor(6, 78, 59); // Emerald 800
      doc.setLineWidth(1);
      doc.rect(8, 8, 132, 194);
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.3);
      doc.rect(10, 10, 128, 190);

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(6, 78, 59);
      doc.text('PECULIAR COLLEGE DOMA', 74, 22, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9); // Amber 700
      doc.text('BURSARY & ACCOUNTS DEPARTMENT', 74, 28, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Off Ruttu Road, Doma, Nasarawa State, Nigeria', 74, 33, { align: 'center' });
      doc.text('Contact: info@peculiarschools.edu.ng | 08027798369', 74, 37, { align: 'center' });

      // Divider line
      doc.setDrawColor(6, 78, 59);
      doc.setLineWidth(0.6);
      doc.line(16, 41, 132, 41);

      // Receipt badge & Number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('OFFICIAL PAYMENT RECEIPT', 16, 48);

      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(6, 78, 59);
      doc.text(receipt.receiptNumber, 132, 48, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Payment Date: ${receipt.paymentDate}`, 132, 53, { align: 'right' });

      // Amount box
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.roundedRect(16, 56, 116, 19, 2, 2, 'F');
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(16, 56, 116, 19, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(6, 78, 59);
      doc.text('TOTAL AMOUNT PAID', 22, 63);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(2, 44, 34);
      doc.text(`NGN ${receipt.amountPaid.toLocaleString()}`, 22, 71);

      doc.setFontSize(7.5);
      doc.setTextColor(6, 78, 59);
      doc.text('[STATUS: CONFIRMED]', 124, 68, { align: 'right' });

      // Student & Transaction Details Table
      let y = 84;
      const addRow = (label: string, value: string) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label, 18, y);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(value, 130, y, { align: 'right' });

        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.2);
        doc.line(18, y + 2, 130, y + 2);
        y += 8;
      };

      addRow('Student Full Name:', receipt.studentName);
      addRow('Admission Number:', receipt.admissionNo);
      addRow('Class / Grade:', receipt.className);
      addRow('Academic Session:', receipt.session);
      addRow('Term:', receipt.term);
      addRow('Payment Channel:', receipt.paymentMethod);
      addRow('Transaction Reference:', receipt.transactionReference);
      addRow('Processed & Authorized By:', receipt.recordedBy);

      // Official Stamp & Signature Area
      y += 8;
      doc.setDrawColor(6, 78, 59);
      doc.setLineWidth(0.4);
      doc.roundedRect(20, y, 38, 22, 2, 2, 'D');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(6, 78, 59);
      doc.text('PCD BURSARY', 39, y + 8, { align: 'center' });
      doc.text('OFFICIALLY STAMPED', 39, y + 13, { align: 'center' });
      doc.setFontSize(6);
      doc.text('AUDITED & VERIFIED', 39, y + 17, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.line(85, y + 15, 128, y + 15);
      doc.text('Bursar / Authorized Cashier', 106, y + 19, { align: 'center' });

      // Footer Note
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'This is a valid computerized receipt issued by Peculiar College Doma. Retain for school records.',
        74,
        192,
        { align: 'center' }
      );

      const safeReceiptNum = receipt.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`PCD_Receipt_${safeReceiptNum}.pdf`);
    } catch (err) {
      console.error('Error generating receipt PDF:', err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print-modal-backdrop">
      <div className="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8 print-modal-content">
        {/* Actions bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-400">Official Payment Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Download official PDF copy"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Print directly to printer or browser print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-4">
            <div className="flex items-center gap-3">
              <SchoolLogo size="md" showText={false} />
              <div>
                <h2 className="text-xl font-black text-emerald-950">PECULIAR COLLEGE DOMA</h2>
                <p className="text-[11px] font-bold text-amber-700 uppercase">
                  Bursary & Accounts Department
                </p>
                <p className="text-[10px] text-slate-500">Off Ruttu Road, Doma, Nasarawa State</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-700 block">
                {receipt.receiptNumber}
              </span>
              <span className="text-[11px] text-slate-500">Date: {receipt.paymentDate}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-800 font-bold uppercase block">
                Amount Paid (NGN)
              </span>
              <span className="text-2xl font-black text-emerald-950">
                ₦{receipt.amountPaid.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recorded
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-900">{receipt.studentName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Admission Number:</span>
              <span className="font-mono font-bold text-slate-900">{receipt.admissionNo}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Class:</span>
              <span className="font-bold text-slate-900">{receipt.className}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Academic Session / Term:</span>
              <span className="font-semibold text-slate-900">
                {receipt.session} • {receipt.term}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-slate-900">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Transaction Reference:</span>
              <span className="font-mono text-slate-700">{receipt.transactionReference}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Processed By:</span>
              <span className="font-semibold text-slate-900">{receipt.recordedBy}</span>
            </div>
          </div>

          {/* Stamp & Sign */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
            <div>
              <div className="w-24 h-12 border-2 border-dashed border-emerald-700/50 rounded flex items-center justify-center text-[10px] text-emerald-800 font-bold uppercase rotate-[-6deg]">
                PCD BURSARY <br /> PAID STAMP
              </div>
            </div>
            <div className="text-right">
              <span className="block border-b border-slate-400 w-36 mb-1"></span>
              <span className="text-[11px] text-slate-500">Bursar / Cashier Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
