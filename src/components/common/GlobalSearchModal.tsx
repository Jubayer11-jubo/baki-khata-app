import React, { useState, useMemo } from 'react';
import { Search, X, User, ArrowLeftRight, Package, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CustomerWithBalance, Transaction, Product, Language } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerWithBalance[];
  transactions: Transaction[];
  products: Product[];
  onSelectCustomer: (id: string) => void;
  language: Language;
  digitFormat: 'bn' | 'en';
}

export const GlobalSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customers,
  transactions,
  products,
  onSelectCustomer,
  language,
  digitFormat,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const useBnDigits = digitFormat === 'bn';
  const q = query.toLowerCase().trim();

  // Matched Customers
  const matchedCustomers = useMemo(() => {
    if (!q) return [];
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.area && c.area.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [customers, q]);

  // Matched Transactions
  const matchedTransactions = useMemo(() => {
    if (!q) return [];
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        String(t.amount).includes(q) ||
        (t.reference && t.reference.toLowerCase().includes(q)) ||
        t.date.includes(q)
    ).slice(0, 5);
  }, [transactions, q]);

  // Matched Products
  const matchedProducts = useMemo(() => {
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [products, q]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-12 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Search input header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'কাস্টমার, মোবাইল, টাকার পরিমাণ, লেনদেন বা পণ্য খুঁজুন...'
                : 'Search customers, phones, amounts, transactions...'
            }
            className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {!q ? (
            <p className="text-center py-8 text-slate-400">
              {language === 'bn' ? 'খুঁজতে টাইপ করা শুরু করুন' : 'Type to start searching'}
            </p>
          ) : (
            <>
              {/* Customers Section */}
              {matchedCustomers.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-2">
                    কাস্টমার ({matchedCustomers.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          sounds.playClick();
                          onClose();
                          onSelectCustomer(c.id);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl text-white font-bold text-xs flex items-center justify-center"
                            style={{ backgroundColor: c.avatarColor || '#2563EB' }}
                          >
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{c.name}</span>
                            <span className="text-[10px] text-slate-500">{c.phone}</span>
                          </div>
                        </div>
                        <span
                          className={`font-bold tabular-nums ${
                            c.currentBalance > 0
                              ? 'text-emerald-700'
                              : c.currentBalance < 0
                              ? 'text-red-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(Math.abs(c.currentBalance), { useBengaliDigits: useBnDigits })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Section */}
              {matchedTransactions.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-2">
                    লেনদেন ({matchedTransactions.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{tx.description}</span>
                          <span className="text-[10px] text-slate-500">{formatDate(tx.date, { lang: language })}</span>
                        </div>
                        <span
                          className={`font-bold tabular-nums ${
                            tx.type === 'credit' ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {formatCurrency(tx.amount, { useBengaliDigits: useBnDigits })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {matchedProducts.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-2">
                    পণ্য ও স্টক ({matchedProducts.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] text-slate-500">স্টক: {p.stock} {p.unit}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800 tabular-nums">
                          ৳{p.sellingPrice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedCustomers.length === 0 && matchedTransactions.length === 0 && matchedProducts.length === 0 && (
                <p className="text-center py-6 text-slate-400">
                  {language === 'bn' ? 'কোনো ফলাফল মেলেনি' : 'No matches found'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
