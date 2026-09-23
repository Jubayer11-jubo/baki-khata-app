import React from 'react';
import { X, Bell, AlertCircle, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import { CustomerWithBalance, Business, Language } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateWhatsAppReminder } from '../../utils/translations';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerWithBalance[];
  business: Business;
  onSelectCustomer: (customerId: string) => void;
  language: Language;
  digitFormat: 'bn' | 'en';
}

export const DueReminderQueueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customers,
  business,
  onSelectCustomer,
  language,
  digitFormat,
}) => {
  if (!isOpen) return null;

  const useBnDigits = digitFormat === 'bn';

  // Overdue and active due customers
  const dueCustomers = customers.filter((c) => c.currentBalance > 0);
  const overdueCustomers = dueCustomers.filter((c) => c.status === 'overdue');
  const normalDueCustomers = dueCustomers.filter((c) => c.status !== 'overdue');

  const handleSendWhatsApp = (c: CustomerWithBalance) => {
    sounds.playClick();
    const cleanPhone = c.phone.replace(/[^\d]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('880')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? '88' + cleanPhone
      : '880' + cleanPhone;

    const message = generateWhatsAppReminder({
      customerName: c.name,
      dueAmount: c.currentBalance,
      shopName: business.name,
      shopPhone: business.phone,
      bkashNumber: business.bkashNumber,
      nagadNumber: business.nagadNumber,
    });

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {language === 'bn' ? 'বকেয়া তাগাদা ও বিজ্ঞপ্তি' : 'Payment Reminder Queue'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {dueCustomers.length} {language === 'bn' ? 'জনের কাছে মোট বকেয়া আছে' : 'customers with outstanding balance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {dueCustomers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              {language === 'bn' ? 'কোনো বকেয়া পাওনা নেই! দারুণ!' : 'No pending dues! All settled!'}
            </div>
          ) : (
            dueCustomers.map((c) => {
              const isOverdue = c.status === 'overdue';

              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isOverdue
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className="cursor-pointer min-w-0 flex-1"
                    onClick={() => {
                      onClose();
                      onSelectCustomer(c.id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {c.name}
                      </h4>
                      {isOverdue && (
                        <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase">
                          সময় উত্তীর্ণ
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.phone}</p>
                    <p className="text-xs font-bold text-red-600 mt-1 tabular-nums">
                      বাকি: {formatCurrency(c.currentBalance, { useBengaliDigits: useBnDigits })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSendWhatsApp(c)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                      title="WhatsApp তাগাদা"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <a
                      href={`tel:${c.phone}`}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
                      title="সরাসরি কল"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
