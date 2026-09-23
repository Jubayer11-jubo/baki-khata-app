import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MessageSquare,
  Share2,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileText,
  Clock,
  Printer,
  Receipt,
  MoreVertical,
} from 'lucide-react';
import { CustomerWithBalance, Transaction, Language, Business } from '../../types';
import { formatCurrency, formatDate, getRelativeDateString } from '../../utils/formatters';
import { generateWhatsAppReminder, generateSMSReminder } from '../../utils/translations';
import { sounds } from '../../utils/audio';

interface Props {
  customer: CustomerWithBalance;
  transactions: Transaction[];
  business: Business;
  onBack: () => void;
  onOpenCreditModal: (customerId: string) => void;
  onOpenPaymentModal: (customerId: string) => void;
  onEditCustomer: (customer: CustomerWithBalance) => void;
  onDeleteCustomer: (customerId: string) => void;
  onViewReceipt: (tx: Transaction, customer: CustomerWithBalance) => void;
  onDeleteTransaction: (txId: string) => void;
  language: Language;
  digitFormat: 'bn' | 'en';
}

export const CustomerProfileView: React.FC<Props> = ({
  customer,
  transactions,
  business,
  onBack,
  onOpenCreditModal,
  onOpenPaymentModal,
  onEditCustomer,
  onDeleteCustomer,
  onViewReceipt,
  onDeleteTransaction,
  language,
  digitFormat,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  const useBnDigits = digitFormat === 'bn';
  const isOwed = customer.currentBalance > 0;
  const isPayable = customer.currentBalance < 0;

  // Generate WhatsApp message and open link
  const handleWhatsApp = () => {
    sounds.playClick();
    const cleanPhone = customer.phone.replace(/[^\d]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('880')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? '88' + cleanPhone
      : '880' + cleanPhone;

    const message = generateWhatsAppReminder({
      customerName: customer.name,
      dueAmount: Math.abs(customer.currentBalance),
      shopName: business.name,
      shopPhone: business.phone,
      bkashNumber: business.bkashNumber,
      nagadNumber: business.nagadNumber,
    });

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Direct Phone Call
  const handleCall = () => {
    sounds.playClick();
    window.location.href = `tel:${customer.phone}`;
  };

  // Direct SMS
  const handleSMS = () => {
    sounds.playClick();
    const message = generateSMSReminder({
      customerName: customer.name,
      dueAmount: Math.abs(customer.currentBalance),
      shopName: business.name,
    });
    window.location.href = `sms:${customer.phone}?body=${encodeURIComponent(message)}`;
  };

  // Share statement summary
  const handleShare = async () => {
    sounds.playClick();
    const text = `${business.name} - খাতা হিসাব\nকাস্টমার: ${customer.name}\nবর্তমান বাকি: ${formatCurrency(customer.currentBalance, { useBengaliDigits: useBnDigits })}\nযোগাযোগ: ${business.phone}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${customer.name} - BakiKhata Statement`,
          text,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(text);
      alert(language === 'bn' ? 'হিসাবের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে।' : 'Statement copied to clipboard.');
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Top Bar with Back, Customer Name and Menu */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditCustomer(customer)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
            title={language === 'bn' ? 'সম্পাদনা' : 'Edit'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-red-600 hover:bg-slate-50 transition"
            title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Header Info Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0"
              style={{ backgroundColor: customer.avatarColor || '#2563EB' }}
            >
              {customer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {customer.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {customer.phone} {customer.altPhone ? `· ${customer.altPhone}` : ''}
              </p>
              {customer.address && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {customer.address}{customer.area ? `, ${customer.area}` : ''}{customer.district ? `, ${customer.district}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Private Note if exists */}
        {customer.note && (
          <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{customer.note}</span>
          </div>
        )}

        {/* Big Balance Banner */}
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isOwed
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : isPayable
              ? 'bg-red-50/70 border-red-200 text-red-950'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">
              {isOwed
                ? language === 'bn' ? 'এই কাস্টমারের কাছে পাবেন' : 'Customer owes you'
                : isPayable
                ? language === 'bn' ? 'এই কাস্টমারকে দিতে হবে' : 'You owe customer'
                : language === 'bn' ? 'হিসাব সম্পূর্ণ পরিশোধিত' : 'Account Settled'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white rounded-full shadow-2xs">
              {customer.status === 'due' ? 'বাকি আছে' : customer.status === 'overdue' ? 'সময় পার' : customer.status === 'settled' ? 'পরিশোধিত' : 'নিয়মিত'}
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mt-1 tabular-nums">
            {formatCurrency(Math.abs(customer.currentBalance), {
              useBengaliDigits: useBnDigits,
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
            <span>{language === 'bn' ? 'মোট বাকি: ' : 'Total Credit: '} {formatCurrency(customer.totalCredit, { useBengaliDigits: useBnDigits })}</span>
            <span>{language === 'bn' ? 'মোট আদায়: ' : 'Total Paid: '} {formatCurrency(customer.totalPayment, { useBengaliDigits: useBnDigits })}</span>
          </div>
        </div>

        {/* 6 Quick Action Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
          {/* বাকি দিন */}
          <button
            onClick={() => onOpenCreditModal(customer.id)}
            className="py-2 px-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{language === 'bn' ? 'বাকি দিন' : 'Give Due'}</span>
          </button>

          {/* টাকা নিন */}
          <button
            onClick={() => onOpenPaymentModal(customer.id)}
            className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'টাকা নিন' : 'Receive'}</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          {/* কল */}
          <button
            onClick={handleCall}
            className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <Phone className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'কল' : 'Call'}</span>
          </button>

          {/* SMS */}
          <button
            onClick={handleSMS}
            className="py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-bold transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>SMS</span>
          </button>

          {/* শেয়ার */}
          <button
            onClick={handleShare}
            className="py-2 px-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'লেনদেনের বিস্তারিত ইতিহাস' : 'Transaction History'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {transactions.length} {language === 'bn' ? 'টি লেনদেন' : 'records'}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            {language === 'bn' ? 'এখনো কোনো লেনদেন যুক্ত করা হয়নি' : 'No transactions recorded yet.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              const isPayment = tx.type === 'payment';
              const isLoanTaken = tx.type === 'loan_taken';
              const isLoanPaid = tx.type === 'loan_paid';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition group"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
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
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {isCredit
                            ? language === 'bn' ? 'বাকি দিয়েছেন' : 'Credit Given'
                            : isPayment
                            ? language === 'bn' ? 'টাকা পেয়েছেন' : 'Payment Received'
                            : isLoanTaken
                            ? language === 'bn' ? 'ধার নিয়েছেন' : 'Loan Taken'
                            : language === 'bn' ? 'ধার শোধ করেছেন' : 'Loan Repaid'}
                        </span>
                        {tx.paymentMethod && (
                          <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 bg-slate-100 rounded-md">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {tx.description || (language === 'bn' ? 'সাধারণ লেনদেন' : 'General')}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(tx.date, { lang: language })}
                        </span>
                        {tx.time && <span>{tx.time}</span>}
                        {tx.dueDate && (
                          <span className="text-amber-600 font-medium">
                            {language === 'bn' ? 'মেয়াদ: ' : 'Due: '} {formatDate(tx.dueDate, { lang: language })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="text-right shrink-0">
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

                    <div className="flex items-center justify-end gap-1 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* View Receipt */}
                      <button
                        onClick={() => onViewReceipt(tx, customer)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                        title={language === 'bn' ? 'ডিজিটাল রসিদ দেখুন' : 'View receipt'}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete TX */}
                      <button
                        onClick={() => setTxToDelete(tx.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition"
                        title={language === 'bn' ? 'লেনদেন মুছুন' : 'Delete transaction'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Transaction Confirmation Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {language === 'bn' ? 'এই লেনদেনটি মুছে ফেলতে চান?' : 'Delete this transaction?'}
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'মুছে ফেললে এটি হিসাব থেকে বাদ পড়বে। (সুরক্ষিত রাখতে soft delete করা হবে)'
                : 'This will be removed from customer ledger balance.'}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setTxToDelete(null)}
                className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(txToDelete);
                  setTxToDelete(null);
                }}
                className="py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
              >
                {language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {language === 'bn' ? 'কাস্টমার মুছে ফেলতে চান?' : 'Delete customer?'}
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? `"${customer.name}"-কে মুছে ফেলা হলে তার সকল হিসাব ট্র্যাশে যাবে।`
                : `Customer "${customer.name}" will be moved to trash.`}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteCustomer(customer.id);
                  setShowDeleteConfirm(false);
                }}
                className="py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
              >
                {language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
