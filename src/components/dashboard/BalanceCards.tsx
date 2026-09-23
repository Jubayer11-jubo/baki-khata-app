import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Language } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  totalReceivable: number; // মোট পাবেন (>0)
  totalPayable: number;    // মোট দেবেন (<0)
  netDue: number;          // মোট বাকি / নিট
  language: Language;
  digitFormat: 'bn' | 'en';
}

export const BalanceCards: React.FC<Props> = ({
  totalReceivable,
  totalPayable,
  netDue,
  language,
  digitFormat,
}) => {
  const useBnDigits = digitFormat === 'bn';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. মোট পাবেন (Receivable - Green/Blue tone) */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs relative overflow-hidden transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 tracking-tight">
            {language === 'bn' ? 'মোট পাবেন' : 'Total Receivable'}
          </span>
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-emerald-700 tracking-tight tabular-nums">
            {formatCurrency(totalReceivable, { useBengaliDigits: useBnDigits })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'bn' ? 'কাস্টমারদের কাছে বকেয়া' : 'Customer dues owed to you'}
          </p>
        </div>
      </div>

      {/* 2. মোট দেবেন (Payable - Red tone) */}
      <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-xs relative overflow-hidden transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-800 tracking-tight">
            {language === 'bn' ? 'মোট দেবেন' : 'Total Payable'}
          </span>
          <div className="w-7 h-7 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-red-600 tracking-tight tabular-nums">
            {formatCurrency(totalPayable, { useBengaliDigits: useBnDigits })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'bn' ? 'মহাজন বা সরবরাহকারীর দেনা' : 'Supplier loans to pay'}
          </p>
        </div>
      </div>

      {/* 3. মোট বাকি / নেট ব্যালেন্স (Net - Royal Blue tone) */}
      <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs relative overflow-hidden transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-900 tracking-tight">
            {language === 'bn' ? 'মোট বাকি (নিট পাওনা)' : 'Net Due Balance'}
          </span>
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-blue-700 tracking-tight tabular-nums">
            {formatCurrency(netDue, { useBengaliDigits: useBnDigits })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {netDue >= 0
              ? language === 'bn'
                ? 'পাওনা দেনার চেয়ে বেশি'
                : 'Receivables exceed payables'
              : language === 'bn'
              ? 'দেনা পাওনার চেয়ে বেশি'
              : 'Payables exceed receivables'}
          </p>
        </div>
      </div>
    </div>
  );
};
