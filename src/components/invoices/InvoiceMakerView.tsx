import React, { useState } from 'react';
import { Plus, Trash2, Printer, Share2, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { CustomerWithBalance, Product, Business, Language, PaymentMethod, InvoiceItem } from '../../types';
import { db } from '../../services/db';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface Props {
  customers: CustomerWithBalance[];
  products: Product[];
  business: Business;
  onBack: () => void;
  language: Language;
  digitFormat: 'bn' | 'en';
}

export const InvoiceMakerView: React.FC<Props> = ({
  customers,
  products,
  business,
  onBack,
  language,
  digitFormat,
}) => {
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [discount, setDiscount] = useState<string>('0');
  const [paidAmount, setPaidAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const useBnDigits = digitFormat === 'bn';

  // When picking customer from dropdown
  const handleSelectCustomer = (id: string) => {
    setCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
    }
  };

  const handleAddItem = () => {
    sounds.playClick();
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    sounds.playClick();
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[idx], [field]: val };
    
    // If product was selected
    if (field === 'productId') {
      const prod = products.find((p) => p.id === val);
      if (prod) {
        item.name = prod.name;
        item.unitPrice = prod.sellingPrice;
      }
    }

    const q = parseFloat(String(item.quantity)) || 0;
    const p = parseFloat(String(item.unitPrice)) || 0;
    item.total = q * p;

    updated[idx] = item;
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const discountNum = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountNum);
  const paidNum = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paidNum);

  const handleSaveInvoice = () => {
    if (!customerName.trim()) {
      alert(language === 'bn' ? 'কাস্টমারের নাম প্রদান করুন' : 'Please enter customer name');
      return;
    }
    if (items.length === 0 || subtotal <= 0) {
      alert(language === 'bn' ? 'কমপক্ষে একটি পণ্যের বিবরণ ও দর দিন' : 'Please add at least one item');
      return;
    }

    db.saveInvoice({
      invoiceNumber,
      businessId: business.id,
      customerId: customerId || undefined,
      customerName,
      customerPhone,
      items,
      subtotal,
      discount: discountNum,
      grandTotal,
      paidAmount: paidNum,
      dueAmount,
      paymentMethod,
      date: invoiceDate,
      notes,
    });

    sounds.playSuccess();
    setIsSaved(true);
  };

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Top Bar */}
      <div className="flex items-center justify-between no-print">
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'মেমো প্রিন্ট' : 'Print Memo'}</span>
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5 print-card">
        {/* Header Shop & Invoice Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {business.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {business.address} · মোবাইল: {business.phone}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              ক্যাশ মেমো #{invoiceNumber}
            </span>
            <div className="text-xs text-slate-500 font-medium mt-1">
              তারিখ: {formatDate(invoiceDate, { lang: language })}
            </div>
          </div>
        </div>

        {/* Customer Select / Manual Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'কাস্টমার নির্বাচন (খাতা থেকে)' : 'Select Customer'}
            </label>
            <select
              value={customerId}
              onChange={(e) => handleSelectCustomer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">{language === 'bn' ? '-- নতুন / ক্যাশ কাস্টমার --' : '-- Walk-in Customer --'}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'কাস্টমারের নাম *' : 'Customer Name *'}
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. রহিম আহমেদ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'bn' ? 'পণ্যের বিবরণ' : 'Item Description'}
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '+ লাইন যোগ করুন' : '+ Add Line'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/70"
              >
                {/* Product picker or manual text */}
                <div className="col-span-5 sm:col-span-6">
                  {products.length > 0 ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder={language === 'bn' ? 'পণ্যের নাম' : 'Product name'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      placeholder={language === 'bn' ? 'পণ্যের নাম' : 'Product name'}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* Qty */}
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    placeholder="পরিমাণ"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-center focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    placeholder="দর (৳)"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-right focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Line Total */}
                <div className="col-span-2 sm:col-span-1 text-right text-xs font-bold text-slate-800 tabular-nums">
                  ৳{item.total || 0}
                </div>

                {/* Delete button */}
                <div className="col-span-1 text-right no-print">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Calculation Card */}
        <div className="flex flex-col sm:flex-row justify-end pt-3 border-t border-slate-100">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>উপমোট (Subtotal):</span>
              <span className="font-bold tabular-nums">
                {formatCurrency(subtotal, { useBengaliDigits: useBnDigits })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>ছাড় (Discount ৳):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-right focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>সর্বমোট বিল:</span>
              <span className="tabular-nums">
                {formatCurrency(grandTotal, { useBengaliDigits: useBnDigits })}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-800 font-semibold">
              <span>জমা / পরিশোধ:</span>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-24 px-2 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-right text-emerald-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-between text-sm font-bold text-red-600 pt-1 border-t border-dashed border-slate-200">
              <span>বাকি রয়েছে (Due):</span>
              <span className="tabular-nums">
                {formatCurrency(dueAmount, { useBengaliDigits: useBnDigits })}
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation or Save Button */}
        <div className="pt-2 no-print">
          {isSaved ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>মেমো সফলভাবে সংরক্ষিত হয়েছে এবং কাস্টমার খাতায় বাকি যুক্ত হয়েছে!</span>
              </div>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
              >
                প্রিন্ট করুন
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSaveInvoice}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-600/20 transition active:scale-[0.99]"
            >
              {language === 'bn' ? 'ক্যাশ মেমো সংরক্ষণ করুন' : 'Save Cash Memo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
