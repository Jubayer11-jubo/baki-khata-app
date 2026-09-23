import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowUpRight, ArrowDownLeft, Calendar, Filter, Receipt, Trash2 } from 'lucide-react';
import { Transaction, CustomerWithBalance, Language } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportTransactionsToCSV } from '../../services/exportImport';
import { sounds } from '../../utils/audio';

interface Props {
  transactions: Transaction[];
  customers: CustomerWithBalance[];
  onViewReceipt: (tx: Transaction, customer: CustomerWithBalance) => void;
  onDeleteTransaction: (txId: string) => void;
  language: Language;
  digitFormat: 'bn' | 'en';
}

type TxFilter = 'all' | 'credit' | 'payment' | 'loan_taken' | 'loan_paid';

export const TransactionListView: React.FC<Props> = ({
  transactions,
  customers,
  onViewReceipt,
  onDeleteTransaction,
  language,
  digitFormat,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TxFilter>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const customerMap = useMemo(() => {
    const map = new Map<string, CustomerWithBalance>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const customerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filter !== 'all' && tx.type !== filter) return false;

      // Payment method filter
      if (selectedMethod !== 'all' && tx.paymentMethod !== selectedMethod) return false;

      // Search filter
      const q = search.toLowerCase().trim();
      if (!q) return true;

      const customer = customerMap.get(tx.customerId);
      const custName = customer?.name.toLowerCase() || '';
      const custPhone = customer?.phone || '';
      const desc = tx.description.toLowerCase();
      const ref = (tx.reference || '').toLowerCase();
      const amountStr = String(tx.amount);

      return (
        custName.includes(q) ||
        custPhone.includes(q) ||
        desc.includes(q) ||
        ref.includes(q) ||
        amountStr.includes(q) ||
        tx.id.includes(q)
      );
    });
  }, [transactions, filter, selectedMethod, search, customerMap]);

  const useBnDigits = digitFormat === 'bn';

  return (
    <div className="space-y-3 pb-24">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'bn' ? 'কাস্টমার, বিবরণ বা টাকার পরিমাণ দিয়ে খুঁজুন...' : 'Search by customer, note or amount...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              exportTransactionsToCSV(filteredTransactions, customerNameMap);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition shrink-0"
            title={language === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: 'all', label: language === 'bn' ? 'সব লেনদেন' : 'All' },
            { id: 'credit', label: language === 'bn' ? 'বাকি' : 'Credit' },
            { id: 'payment', label: language === 'bn' ? 'আদায় / পেমেন্ট' : 'Payment' },
            { id: 'loan_taken', label: language === 'bn' ? 'ধার নেওয়া' : 'Loan' },
            { id: 'loan_paid', label: language === 'bn' ? 'ধার শোধ' : 'Loan Repay' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                sounds.playClick();
                setFilter(f.id as TxFilter);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                filter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Records List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-2">
          <p className="text-slate-400 text-xs font-medium">
            {language === 'bn' ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি' : 'No transactions found'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const customer = customerMap.get(tx.customerId);
            const isCredit = tx.type === 'credit';
            const isPayment = tx.type === 'payment';
            const isLoanTaken = tx.type === 'loan_taken';

            return (
              <div
                key={tx.id}
                className="bg-white hover:bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 group transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCredit
                        ? 'bg-red-100 text-red-600'
                        : isPayment
                        ? 'bg-emerald-100 text-emerald-700'
                        : isLoanTaken
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">
                        {customer ? customer.name : 'অজ্ঞাত কাস্টমার'}
                      </h4>
                      {tx.paymentMethod && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                          {tx.paymentMethod}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{formatDate(tx.date, { lang: language })}</span>
                      {tx.time && <span>· {tx.time}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Receipt button */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <div
                      className={`text-sm font-bold tabular-nums tracking-tight ${
                        isCredit
                          ? 'text-red-600'
                          : isPayment
                          ? 'text-emerald-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {isCredit ? '+' : isPayment ? '-' : ''}
                      {formatCurrency(tx.amount, { useBengaliDigits: useBnDigits })}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 block">
                      {isCredit
                        ? language === 'bn' ? 'বাকি' : 'Due'
                        : isPayment
                        ? language === 'bn' ? 'আদায়' : 'Received'
                        : 'ধার'}
                    </span>
                  </div>

                  {customer && (
                    <button
                      onClick={() => onViewReceipt(tx, customer)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      title={language === 'bn' ? 'রসিদ দেখুন' : 'View receipt'}
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
