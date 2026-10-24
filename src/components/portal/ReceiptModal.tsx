import React from 'react';
import { FeePayment } from '../../types';
import { SchoolLogo } from '../SchoolLogo';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receipt: FeePayment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8">
        {/* Actions bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-400">Official Payment Receipt</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
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
