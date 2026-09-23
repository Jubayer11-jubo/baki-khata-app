import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Phone, MessageSquare, ArrowUpRight, ArrowDownLeft, ChevronRight, UserX, SlidersHorizontal, Download } from 'lucide-react';
import { CustomerWithBalance, Language } from '../../types';
import { formatCurrency, getRelativeDateString } from '../../utils/formatters';
import { exportCustomersToCSV } from '../../services/exportImport';
import { sounds } from '../../utils/audio';

interface Props {
  customers: CustomerWithBalance[];
  onSelectCustomer: (customerId: string) => void;
  onOpenAddCustomer: () => void;
  language: Language;
  digitFormat: 'bn' | 'en';
}

type FilterTab = 'all' | 'receivable' | 'payable' | 'settled';
type SortOption = 'due_desc' | 'recent' | 'name';

export const CustomerListView: React.FC<Props> = ({
  customers,
  onSelectCustomer,
  onOpenAddCustomer,
  language,
  digitFormat,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('due_desc');

  const filteredCustomers = useMemo(() => {
    let list = customers.filter((c) => {
      // Search filter
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.area && c.area.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Status filter
      if (filter === 'receivable') return c.currentBalance > 0;
      if (filter === 'payable') return c.currentBalance < 0;
      if (filter === 'settled') return c.currentBalance === 0;
      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'due_desc') {
        return b.currentBalance - a.currentBalance;
      }
      if (sortBy === 'recent') {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      return a.name.localeCompare(b.name, 'bn');
    });

    return list;
  }, [customers, search, filter, sortBy]);

  const useBnDigits = digitFormat === 'bn';

  return (
    <div className="space-y-3 pb-24">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'bn' ? 'নাম বা মোবাইল দিয়ে খুঁজুন...' : 'Search by name or phone...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenAddCustomer();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ কাস্টমার' : '+ Customer'}</span>
          </button>
        </div>

        {/* Filter Tabs & Sort & Export */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-0.5">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
            {(
              [
                { id: 'all', label: language === 'bn' ? 'সবাই' : 'All', count: customers.length },
                {
                  id: 'receivable',
                  label: language === 'bn' ? 'পাবেন' : 'Due',
                  count: customers.filter((c) => c.currentBalance > 0).length,
                },
                {
                  id: 'payable',
                  label: language === 'bn' ? 'দেবেন' : 'Payable',
                  count: customers.filter((c) => c.currentBalance < 0).length,
                },
                {
                  id: 'settled',
                  label: language === 'bn' ? 'পরিশোধিত' : 'Settled',
                  count: customers.filter((c) => c.currentBalance === 0).length,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setFilter(tab.id);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1 text-[10px] opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Export to CSV */}
          <button
            onClick={() => {
              sounds.playClick();
              exportCustomersToCSV(filteredCustomers);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition shrink-0"
            title={language === 'bn' ? 'কাস্টমার তালিকা এক্সপোর্ট করুন' : 'Export customers to CSV'}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              {language === 'bn' ? 'কোনো কাস্টমার পাওয়া যায়নি' : 'No customers found'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {search
                ? language === 'bn'
                  ? 'আপনার খোঁজার সাথে কোনো ফলাফল মেলেনি'
                  : 'No results matched your search'
                : language === 'bn'
                ? 'নতুন কাস্টমার যোগ করে ডিজিটাল খাতা শুরু করুন'
                : 'Add a customer to start tracking ledger'}
            </p>
          </div>
          <button
            onClick={onOpenAddCustomer}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            {language === 'bn' ? '+ কাস্টমার যোগ করুন' : '+ Add Customer'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCustomers.map((customer) => {
            const isOwed = customer.currentBalance > 0;
            const isPayable = customer.currentBalance < 0;
            const isSettled = customer.currentBalance === 0;

            return (
              <div
                key={customer.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectCustomer(customer.id);
                }}
                className="bg-white hover:bg-slate-50/80 active:bg-slate-100 rounded-2xl p-3.5 border border-slate-200/80 shadow-xs cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: customer.avatarColor || '#2563EB' }}
                  >
                    {customer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm truncate leading-tight group-hover:text-blue-600 transition-colors">
                        {customer.name}
                      </h4>
                      {customer.status === 'overdue' && (
                        <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.2 rounded-md border border-red-200 shrink-0">
                          {language === 'bn' ? 'সময় পার' : 'Overdue'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {customer.phone} {customer.area ? `· ${customer.area}` : ''}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'bn' ? 'শেষ লেনদেন: ' : 'Last: '}
                      {getRelativeDateString(customer.lastTransactionDate, undefined, language)}
                    </p>
                  </div>
                </div>

                {/* Right: Balance & Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold tabular-nums tracking-tight ${
                        isOwed
                          ? 'text-emerald-700'
                          : isPayable
                          ? 'text-red-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {isSettled
                        ? language === 'bn'
                          ? 'পরিশোধিত'
                          : 'Settled'
                        : formatCurrency(Math.abs(customer.currentBalance), {
                            useBengaliDigits: useBnDigits,
                          })}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 block">
                      {isOwed
                        ? language === 'bn'
                          ? 'পাবেন'
                          : 'You get'
                        : isPayable
                        ? language === 'bn'
                          ? 'দেবেন'
                          : 'You owe'
                        : '০.০০'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
