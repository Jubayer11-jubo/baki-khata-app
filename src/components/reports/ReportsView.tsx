import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownLeft, Printer, Calendar } from 'lucide-react';
import { CustomerWithBalance, Transaction, Language, Business } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface Props {
  customers: CustomerWithBalance[];
  transactions: Transaction[];
  business: Business;
  language: Language;
  digitFormat: 'bn' | 'en';
}

type Period = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all';

export const ReportsView: React.FC<Props> = ({
  customers,
  transactions,
  business,
  language,
  digitFormat,
}) => {
  const [period, setPeriod] = useState<Period>('month');

  const useBnDigits = digitFormat === 'bn';

  // Filter transactions by period
  const filteredTxs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    const currentYear = today.substring(0, 4);

    return transactions.filter((t) => {
      if (period === 'today') return t.date === today;
      if (period === 'yesterday') return t.date === yesterday;
      if (period === 'month') return t.date.startsWith(currentMonth);
      if (period === 'year') return t.date.startsWith(currentYear);
      if (period === 'week') {
        const d = new Date(t.date);
        const now = new Date();
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 7;
      }
      return true;
    });
  }, [transactions, period]);

  // Aggregate stats
  const stats = useMemo(() => {
    let credit = 0;
    let payment = 0;
    let loanTaken = 0;
    let loanPaid = 0;

    filteredTxs.forEach((t) => {
      if (t.type === 'credit') credit += t.amount;
      if (t.type === 'payment') payment += t.amount;
      if (t.type === 'loan_taken') loanTaken += t.amount;
      if (t.type === 'loan_paid') loanPaid += t.amount;
    });

    let totalReceivable = 0;
    let totalPayable = 0;
    customers.forEach((c) => {
      if (c.currentBalance > 0) totalReceivable += c.currentBalance;
      if (c.currentBalance < 0) totalPayable += Math.abs(c.currentBalance);
    });

    return {
      credit,
      payment,
      loanTaken,
      loanPaid,
      totalReceivable,
      totalPayable,
      txCount: filteredTxs.length,
      customerCount: customers.length,
    };
  }, [filteredTxs, customers]);

  // Top Customers by Due
  const topDebtors = useMemo(() => {
    return [...customers]
      .filter((c) => c.currentBalance > 0)
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 5);
  }, [customers]);

  // Top Customers by Payment
  const topPayers = useMemo(() => {
    return [...customers]
      .filter((c) => c.totalPayment > 0)
      .sort((a, b) => b.totalPayment - a.totalPayment)
      .slice(0, 5);
  }, [customers]);

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Filter Tabs & Print Button */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar no-print">
        <div className="flex items-center gap-1">
          {[
            { id: 'today', label: language === 'bn' ? 'আজ' : 'Today' },
            { id: 'yesterday', label: language === 'bn' ? 'গতকাল' : 'Yesterday' },
            { id: 'week', label: language === 'bn' ? 'এই সপ্তাহ' : 'Week' },
            { id: 'month', label: language === 'bn' ? 'এই মাস' : 'Month' },
            { id: 'year', label: language === 'bn' ? 'এই বছর' : 'Year' },
            { id: 'all', label: language === 'bn' ? 'সব' : 'All' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setPeriod(tab.id as Period);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                period === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* বাকি দেওয়া */}
        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-xs">
          <span className="text-xs font-semibold text-red-800 block">
            {language === 'bn' ? 'মোট বাকি দিয়েছেন' : 'Credit Given'}
          </span>
          <div className="text-xl font-bold text-red-600 mt-1 tabular-nums">
            {formatCurrency(stats.credit, { useBengaliDigits: useBnDigits })}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {language === 'bn' ? 'নির্বাচিত সময়ের হিসাব' : 'Selected period'}
          </span>
        </div>

        {/* আদায় / পেমেন্ট */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 block">
            {language === 'bn' ? 'মোট আদায় করেছেন' : 'Payment Received'}
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {formatCurrency(stats.payment, { useBengaliDigits: useBnDigits })}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {language === 'bn' ? 'ক্যাশ ও ডিজিটাল পেমেন্ট' : 'Cash & Digital'}
          </span>
        </div>

        {/* মোট বকেয়া পাওনা */}
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs">
          <span className="text-xs font-semibold text-blue-900 block">
            {language === 'bn' ? 'মোট বকেয়া পাবেন' : 'Total Receivable'}
          </span>
          <div className="text-xl font-bold text-blue-700 mt-1 tabular-nums">
            {formatCurrency(stats.totalReceivable, { useBengaliDigits: useBnDigits })}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {stats.customerCount} {language === 'bn' ? 'জন কাস্টমার' : 'customers'}
          </span>
        </div>

        {/* লেনদেন সংখ্যা */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-700 block">
            {language === 'bn' ? 'মোট লেনদেন' : 'Transactions'}
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {stats.txCount} {language === 'bn' ? 'টি' : ''}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {language === 'bn' ? 'রেকর্ডকৃত ডাটা' : 'Recorded entries'}
          </span>
        </div>
      </div>

      {/* Credit vs Collection Ratio Visual Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>{language === 'bn' ? 'বাকি বনাম আদায় তুলনা' : 'Credit vs Collection'}</span>
          <span className="text-xs text-slate-500 font-normal">
            {language === 'bn' ? 'অনুপাত চিত্র' : 'Ratio breakdown'}
          </span>
        </h3>

        {/* Comparison Visual Bar */}
        {stats.credit + stats.payment > 0 ? (
          <div className="space-y-2">
            <div className="h-6 w-full rounded-xl bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-red-500 rounded-l-lg transition-all duration-500"
                style={{
                  width: `${(stats.credit / (stats.credit + stats.payment)) * 100}%`,
                }}
              />
              <div
                className="bg-emerald-600 rounded-r-lg transition-all duration-500"
                style={{
                  width: `${(stats.payment / (stats.credit + stats.payment)) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <span className="text-red-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                বাকি: {Math.round((stats.credit / (stats.credit + stats.payment)) * 100)}%
              </span>
              <span className="text-emerald-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                আদায়: {Math.round((stats.payment / (stats.credit + stats.payment)) * 100)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            {language === 'bn' ? 'এই সময়ের মধ্যে কোনো লেনদেন হয়নি' : 'No transactions in this period'}
          </p>
        )}
      </div>

      {/* Top 5 Debtors & Best Payers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* সবচেয়ে বেশি বাকি */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span>{language === 'bn' ? 'সবচেয়ে বেশি বাকি যাদের কাছে' : 'Top Due Customers'}</span>
          </h4>

          {topDebtors.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              {language === 'bn' ? 'কারো কাছে বকেয়া বাকি নেই' : 'No outstanding dues'}
            </p>
          ) : (
            <div className="space-y-2">
              {topDebtors.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 font-bold text-[10px] flex items-center justify-center text-slate-700">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.phone}</span>
                    </div>
                  </div>
                  <span className="font-bold text-red-600 tabular-nums">
                    {formatCurrency(c.currentBalance, { useBengaliDigits: useBnDigits })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* সেরা পেমেন্টকারী */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'সেরা পেমেন্টকারী কাস্টমার' : 'Best Paying Customers'}</span>
          </h4>

          {topPayers.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              {language === 'bn' ? 'কোনো পেমেন্ট রেকর্ড নেই' : 'No payments recorded'}
            </p>
          ) : (
            <div className="space-y-2">
              {topPayers.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 font-bold text-[10px] flex items-center justify-center text-emerald-800">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.phone}</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(c.totalPayment, { useBengaliDigits: useBnDigits })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
