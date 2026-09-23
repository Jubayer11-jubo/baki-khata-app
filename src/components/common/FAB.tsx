import React, { useState } from 'react';
import { Plus, X, ArrowUpRight, ArrowDownLeft, UserPlus, FileText } from 'lucide-react';
import { Language } from '../../types';
import { sounds } from '../../utils/audio';

interface Props {
  onOpenCreditModal: () => void;
  onOpenPaymentModal: () => void;
  onOpenAddCustomer: () => void;
  onOpenInvoiceMaker: () => void;
  language: Language;
}

export const FAB: React.FC<Props> = ({
  onOpenCreditModal,
  onOpenPaymentModal,
  onOpenAddCustomer,
  onOpenInvoiceMaker,
  language,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    sounds.playClick();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    sounds.playClick();
    setIsOpen(false);
    action();
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:right-8 no-print">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 z-40 mb-2 animate-in slide-in-from-bottom-5 duration-200">
          {/* ইনভয়েস তৈরি করুন */}
          <button
            onClick={() => handleAction(onOpenInvoiceMaker)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition active:scale-95 whitespace-nowrap"
          >
            <span className="text-xs font-semibold">
              {language === 'bn' ? 'ক্যাশ মেমো / ইনভয়েস' : 'Cash Memo / Invoice'}
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </button>

          {/* কাস্টমার যোগ করুন */}
          <button
            onClick={() => handleAction(onOpenAddCustomer)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition active:scale-95 whitespace-nowrap"
          >
            <span className="text-xs font-semibold">
              {language === 'bn' ? 'কাস্টমার যোগ করুন' : 'Add Customer'}
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </button>

          {/* টাকা নিন */}
          <button
            onClick={() => handleAction(onOpenPaymentModal)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition active:scale-95 whitespace-nowrap"
          >
            <span className="text-xs font-bold text-emerald-700">
              {language === 'bn' ? 'টাকা নিন (পেমেন্ট)' : 'Receive Payment'}
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </button>

          {/* বাকি দিন */}
          <button
            onClick={() => handleAction(onOpenCreditModal)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition active:scale-95 whitespace-nowrap"
          >
            <span className="text-xs font-bold text-red-600">
              {language === 'bn' ? '+ বাকি দিন (হিসাব)' : '+ Give Credit'}
            </span>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={toggle}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 relative z-40 ${
          isOpen
            ? 'bg-slate-800 rotate-45 shadow-slate-900/30'
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/40'
        }`}
        aria-label="Speed dial actions"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
