import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Calendar, FileText, CheckCircle2, User, Tag, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerWithBalance, Language, PaymentMethod, TransactionType, Product } from '../../types';
import { db } from '../../services/db';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  initialCustomerId?: string;
  customers: CustomerWithBalance[];
  products: Product[];
  onTransactionSaved: () => void;
  onOpenAddCustomer: () => void;
  language: Language;
}

export const TransactionEntryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  type,
  initialCustomerId,
  customers,
  products,
  onTransactionSaved,
  onOpenAddCustomer,
  language,
}) => {
  const [customerId, setCustomerId] = useState<string>(initialCustomerId || '');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialCustomerId) {
      setCustomerId(initialCustomerId);
    } else if (customers.length > 0 && !customerId) {
      setCustomerId(customers[0].id);
    }
  }, [initialCustomerId, customers]);

  if (!isOpen) return null;

  const isCredit = type === 'credit';
  const isPayment = type === 'payment';
  const isLoanTaken = type === 'loan_taken';
  const isLoanPaid = type === 'loan_paid';

  // Handle product selection to prefill price & description
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    if (!prodId) return;
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setDescription(prod.name);
      setUnitPrice(String(prod.sellingPrice));
      const q = parseFloat(quantity) || 1;
      setAmount(String(prod.sellingPrice * q));
    }
  };

  const handleQtyChange = (qtyVal: string) => {
    setQuantity(qtyVal);
    const q = parseFloat(qtyVal) || 0;
    const p = parseFloat(unitPrice) || 0;
    if (q > 0 && p > 0) {
      setAmount(String(Math.round(q * p)));
    }
  };

  const handleUnitPriceChange = (priceVal: string) => {
    setUnitPrice(priceVal);
    const p = parseFloat(priceVal) || 0;
    const q = parseFloat(quantity) || 1;
    if (p > 0) {
      setAmount(String(Math.round(q * p)));
    }
  };

  // Quick preset amount increment (+100, +500, +1000, +2000, +5000)
  const addPresetAmount = (delta: number) => {
    sounds.playClick();
    const current = parseFloat(amount) || 0;
    setAmount(String(current + delta));
  };

  // Due date shortcuts (+3 days, +7 days, +15 days, +30 days)
  const setDueDateOffset = (days: number) => {
    sounds.playClick();
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError(language === 'bn' ? 'দয়া করে কাস্টমার নির্বাচন করুন' : 'Please select a customer');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError(language === 'bn' ? 'সঠিক টাকার পরিমাণ দিন' : 'Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      db.saveTransaction({
        businessId: db.getActiveBusiness().id,
        customerId,
        type,
        amount: numAmount,
        description: description.trim() || (isCredit ? 'বাকি বিক্রয়' : isPayment ? 'নগদ জমা' : 'ধার'),
        date,
        time: timeStr,
        dueDate: dueDate || undefined,
        paymentMethod: isPayment || isLoanPaid ? paymentMethod : undefined,
        reference: reference.trim() || undefined,
        createdBy: db.getActiveBusiness().ownerName,
      });

      // If customer has exact balance paid off, trigger joyful confetti celebration!
      const targetCustomer = customers.find((c) => c.id === customerId);
      if (isPayment && targetCustomer && Math.abs(targetCustomer.currentBalance - numAmount) < 1) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      sounds.playCashChime();
      onTransactionSaved();
      onClose();
    } catch {
      setError(language === 'bn' ? 'লেনদেন সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Top Bar */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 text-white shrink-0 ${
            isCredit
              ? 'bg-red-600'
              : isPayment
              ? 'bg-emerald-600'
              : isLoanTaken
              ? 'bg-amber-600'
              : 'bg-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {isCredit ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownLeft className="w-5 h-5" />
            )}
            <h3 className="text-base font-bold">
              {isCredit
                ? language === 'bn' ? 'বাকি দিন (+খাতায় যোগ)' : 'Give Credit (+Due)'
                : isPayment
                ? language === 'bn' ? 'টাকা নিন (পেমেন্ট গ্রহণ)' : 'Receive Payment'
                : isLoanTaken
                ? language === 'bn' ? '+ ধার নিন' : '+ Take Loan'
                : language === 'bn' ? 'ধার শোধ করুন' : 'Repay Loan'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-slate-800">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'কাস্টমার নির্বাচন করুন *' : 'Select Customer *'}
              </label>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenAddCustomer();
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>{language === 'bn' ? 'নতুন কাস্টমার' : 'New Customer'}</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-none transition appearance-none"
              >
                <option value="">
                  {language === 'bn' ? '-- কাস্টমার নির্বাচন করুন --' : '-- Select Customer --'}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.currentBalance > 0 ? `বাকি: ৳${c.currentBalance}` : c.currentBalance < 0 ? `দেনা: ৳${Math.abs(c.currentBalance)}` : 'পরিশোধিত'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Input with Bengali / English formatting & Quick presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'টাকার পরিমাণ (৳) *' : 'Amount (৳) *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl font-bold text-slate-400">
                ৳
              </div>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-2xl font-extrabold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition tabular-nums"
              />
            </div>

            {/* Quick preset amount pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {[100, 200, 500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPresetAmount(preset)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition active:scale-95 shrink-0"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method (for payment / collection / loan repay) */}
          {(isPayment || isLoanPaid) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'ক্যাশ (নগদ)' },
                  { id: 'bkash', label: 'বিকাশ (bKash)' },
                  { id: 'nagad', label: 'নগদ (Nagad)' },
                  { id: 'rocket', label: 'রকেট' },
                  { id: 'bank', label: 'ব্যাংক' },
                  { id: 'other', label: 'অন্যান্য' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition ${
                      paymentMethod === pm.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Product Selection (when giving credit) */}
          {isCredit && products.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'bn' ? 'দোকানের পণ্য নির্বাচন (ঐচ্ছিক)' : 'Select Shop Product (Optional)'}
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="">{language === 'bn' ? '-- পণ্য নির্বাচন করুন --' : '-- Choose Product --'}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - দর: ৳{p.sellingPrice} (স্টক: {p.stock} {p.unit})
                  </option>
                ))}
              </select>

              {selectedProductId && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                      {language === 'bn' ? 'পরিমাণ' : 'Quantity'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQtyChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                      {language === 'bn' ? 'একক দর (৳)' : 'Unit Price'}
                    </span>
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description / Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'bn' ? 'বিবরণ বা মালের নাম' : 'Description'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isCredit
                  ? language === 'bn' ? 'যেমন: চাল, ডাল ও তেল বাকিতে' : 'e.g. Rice, oil purchase'
                  : language === 'bn' ? 'যেমন: নগদ পরিশোধ' : 'e.g. Cash payment'
              }
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'bn' ? 'তারিখ *' : 'Date *'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {isCredit && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'পরিশোধের শেষ তারিখ (Due Date)' : 'Due Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setDueDateOffset(3)}
                    className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium hover:bg-blue-100"
                  >
                    +৩ দিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDateOffset(7)}
                    className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium hover:bg-blue-100"
                  >
                    +৭ দিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDateOffset(30)}
                    className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium hover:bg-blue-100"
                  >
                    +১ মাস
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reference / Memo No */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {language === 'bn' ? 'রেফারেন্স / ভাউচার নং (ঐচ্ছিক)' : 'Reference / Voucher No'}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TRX1092 / MEMO-23"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl text-white text-sm font-bold shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2 ${
                isCredit
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                  : isPayment
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              <span>
                {isCredit
                  ? language === 'bn' ? 'বাকি যোগ করুন' : 'Record Credit'
                  : isPayment
                  ? language === 'bn' ? 'পেমেন্ট যোগ করুন' : 'Record Payment'
                  : language === 'bn' ? 'লেনদেন নিশ্চিত করুন' : 'Confirm Transaction'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
