import React from 'react';
import { X, Printer, Share2, MessageCircle, Download, CheckCircle, Store, Phone, MapPin } from 'lucide-react';
import { Transaction, CustomerWithBalance, Business, Language } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  customer: CustomerWithBalance | null;
  business: Business;
  language: Language;
  digitFormat: 'bn' | 'en';
}

export const ReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transaction,
  customer,
  business,
  language,
  digitFormat,
}) => {
  if (!isOpen || !transaction || !customer) return null;

  const useBnDigits = digitFormat === 'bn';
  const isCredit = transaction.type === 'credit';
  const isPayment = transaction.type === 'payment';

  // Format receipt message for WhatsApp
  const handleWhatsAppShare = () => {
    sounds.playClick();
    const cleanPhone = customer.phone.replace(/[^\d]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('880')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? '88' + cleanPhone
      : '880' + cleanPhone;

    const receiptText = `*${business.name}* - ডিজিটাল রসিদ
-----------------------------
ভাউচার নং: ${transaction.id}
তারিখ: ${transaction.date} (${transaction.time || ''})
কাস্টমার: ${customer.name} (${customer.phone})
লেনদেনের ধরন: ${isCredit ? 'বাকি' : 'পেমেন্ট / আদায়'}
পরিমাণ: ${formatCurrency(transaction.amount, { useBengaliDigits: useBnDigits })}
বিবরণ: ${transaction.description}
বর্তমান মোট বাকি: ${formatCurrency(customer.currentBalance, { useBengaliDigits: useBnDigits })}
-----------------------------
যোগাযোগ: ${business.phone}
ধন্যবাদ! আবার আসবেন।`;

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(receiptText)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 no-print">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'bn' ? 'ডিজিটাল রসিদ / ক্যাশ মেমো' : 'Digital Receipt'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Card */}
        <div className="p-6 bg-slate-50/50 space-y-4 print-card">
          {/* Shop Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-200 space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-2 shadow-xs">
              {business.name.charAt(0)}
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              {business.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {business.address}
            </p>
            <p className="text-xs font-semibold text-slate-700">
              মোবাইল: {business.phone}
            </p>
            {business.bkashNumber && (
              <p className="text-[11px] text-pink-600 font-semibold">
                বিকাশ (Personal): {business.bkashNumber}
              </p>
            )}
          </div>

          {/* Receipt Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ভাউচার: #{transaction.id.replace('tx_', '')}</span>
            <span>{formatDate(transaction.date, { lang: language })} {transaction.time || ''}</span>
          </div>

          {/* Customer Details Box */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">কাস্টমার নাম:</span>
              <span className="text-xs font-bold text-slate-900">{customer.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">মোবাইল:</span>
              <span className="text-xs font-semibold text-slate-700">{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">ঠিকানা:</span>
                <span className="text-xs font-medium text-slate-600">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Transaction Amount Block */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isCredit
                ? 'বাকি যোগ করা হয়েছে'
                : isPayment
                ? 'পেমেন্ট গ্রহণ করা হয়েছে'
                : 'লেনদেন'}
            </span>
            <div
              className={`text-3xl font-black tabular-nums tracking-tight ${
                isCredit ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {isCredit ? '+' : '-'} {formatCurrency(transaction.amount, { useBengaliDigits: useBnDigits })}
            </div>
            <p className="text-xs text-slate-600 font-medium pt-1">
              বিবরণ: {transaction.description || 'বাকি/নগদ হিসাব'}
            </p>
            {transaction.paymentMethod && (
              <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                মাধ্যম: {transaction.paymentMethod}
              </span>
            )}
          </div>

          {/* Remaining Balance Summary */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-950">
              বর্তমান মোট বকেয়া:
            </span>
            <span className="text-base font-extrabold text-blue-700 tabular-nums">
              {formatCurrency(customer.currentBalance, { useBengaliDigits: useBnDigits })}
            </span>
          </div>

          {/* Footer message */}
          <div className="text-center pt-2 text-xs font-bold text-slate-500 space-y-0.5">
            <p>ধন্যবাদ! আবার আসবেন।</p>
            <p className="text-[10px] text-slate-400 font-normal">BakiKhata ডিজিটাল বাকি খাতা দ্বারা সংরক্ষিত</p>
          </div>
        </div>

        {/* Bottom Actions (No Print) */}
        <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-2 no-print">
          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp-এ পাঠান</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / রসিদ কপি</span>
          </button>
        </div>
      </div>
    </div>
  );
};
