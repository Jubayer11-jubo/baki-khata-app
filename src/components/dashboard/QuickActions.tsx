import React from 'react';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, MinusCircle, UserPlus } from 'lucide-react';
import { Language } from '../../types';
import { sounds } from '../../utils/audio';

interface Props {
  onOpenCreditModal: () => void;
  onOpenPaymentModal: () => void;
  onOpenTakeLoanModal: () => void;
  onOpenPayLoanModal: () => void;
  onOpenAddCustomer: () => void;
  language: Language;
}

export const QuickActions: React.FC<Props> = ({
  onOpenCreditModal,
  onOpenPaymentModal,
  onOpenTakeLoanModal,
  onOpenPayLoanModal,
  onOpenAddCustomer,
  language,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        {language === 'bn' ? 'দ্রুত লেনদেন ও সেবা' : 'Quick Actions'}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* 1. + বাকি দিন */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenCreditModal();
          }}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-200/70 text-red-700 transition active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 leading-tight">
            {language === 'bn' ? '+ বাকি দিন' : '+ Give Credit'}
          </span>
          <span className="text-[10px] text-red-700/80 font-medium mt-0.5">
            {language === 'bn' ? 'কাস্টমার দেনাদার' : 'Record Due'}
          </span>
        </button>

        {/* 2. টাকা নিন */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenPaymentModal();
          }}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-800 transition active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 leading-tight">
            {language === 'bn' ? 'টাকা নিন' : 'Receive Money'}
          </span>
          <span className="text-[10px] text-emerald-800/80 font-medium mt-0.5">
            {language === 'bn' ? 'পেমেন্ট জমা' : 'Record Payment'}
          </span>
        </button>

        {/* 3. + ধার নিন */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenTakeLoanModal();
          }}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 text-amber-800 transition active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 leading-tight">
            {language === 'bn' ? '+ ধার নিন' : '+ Take Loan'}
          </span>
          <span className="text-[10px] text-amber-800/80 font-medium mt-0.5">
            {language === 'bn' ? 'মহাজনের দেনা' : 'Borrow Money'}
          </span>
        </button>

        {/* 4. টাকা দিন */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenPayLoanModal();
          }}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <MinusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 leading-tight">
            {language === 'bn' ? 'টাকা দিন' : 'Pay Supplier'}
          </span>
          <span className="text-[10px] text-slate-600 font-medium mt-0.5">
            {language === 'bn' ? 'দেনা পরিশোধ' : 'Repay Loan'}
          </span>
        </button>

        {/* 5. কাস্টমার যোগ করুন */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenAddCustomer();
          }}
          className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/70 text-blue-700 transition active:scale-95 group text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 leading-tight">
            {language === 'bn' ? '+ কাস্টমার' : '+ Customer'}
          </span>
          <span className="text-[10px] text-blue-700/80 font-medium mt-0.5">
            {language === 'bn' ? 'নতুন খাতা খুলুন' : 'Add New'}
          </span>
        </button>
      </div>
    </div>
  );
};
