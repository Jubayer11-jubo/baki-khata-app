import React, { useState } from 'react';
import { X, User, Phone, MapPin, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Customer, Language } from '../../types';
import { db } from '../../services/db';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: (customer: Customer) => void;
  language: Language;
  editCustomer?: Customer;
}

const AVATAR_COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#DC2626', // Red
  '#9333EA', // Purple
  '#D97706', // Amber
  '#0891B2', // Cyan
  '#E11D48', // Rose
  '#4F46E5', // Indigo
];

export const AddCustomerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCustomerAdded,
  language,
  editCustomer,
}) => {
  const isEditing = !!editCustomer;

  const [name, setName] = useState(editCustomer?.name || '');
  const [phone, setPhone] = useState(editCustomer?.phone || '');
  const [altPhone, setAltPhone] = useState(editCustomer?.altPhone || '');
  const [address, setAddress] = useState(editCustomer?.address || '');
  const [area, setArea] = useState(editCustomer?.area || '');
  const [thana, setThana] = useState(editCustomer?.thana || '');
  const [district, setDistrict] = useState(editCustomer?.district || 'ঢাকা');
  const [note, setNote] = useState(editCustomer?.note || '');
  const [openingBalance, setOpeningBalance] = useState<string>(
    editCustomer ? String(editCustomer.openingBalance || 0) : ''
  );
  const [openingBalanceType, setOpeningBalanceType] = useState<'receivable' | 'payable'>(
    editCustomer?.openingBalanceType || 'receivable'
  );
  const [avatarColor, setAvatarColor] = useState(editCustomer?.avatarColor || AVATAR_COLORS[0]);

  const [duplicateWarning, setDuplicateWarning] = useState<Customer | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val.length >= 10 && !isEditing) {
      const dup = db.checkDuplicatePhone(val);
      setDuplicateWarning(dup || null);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'কাস্টমারের নাম প্রদান করুন' : 'Please enter customer name');
      return;
    }
    if (!phone.trim()) {
      setError(language === 'bn' ? 'মোবাইল নম্বর প্রদান করুন' : 'Please enter mobile number');
      return;
    }

    const balanceNum = parseFloat(openingBalance) || 0;

    const saved = db.saveCustomer({
      id: editCustomer?.id,
      businessId: db.getActiveBusiness().id,
      name: name.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      address: address.trim() || undefined,
      area: area.trim() || undefined,
      thana: thana.trim() || undefined,
      district: district.trim() || undefined,
      note: note.trim() || undefined,
      openingBalance: balanceNum,
      openingBalanceType,
      avatarColor,
    });

    sounds.playSuccess();
    onCustomerAdded(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing
              ? language === 'bn' ? 'কাস্টমার তথ্য সম্পাদনা' : 'Edit Customer'
              : language === 'bn' ? 'নতুন কাস্টমার যোগ করুন' : 'Add New Customer'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-slate-800">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{language === 'bn' ? 'সতর্কতা: এই নম্বরে একজন কাস্টমার ইতোমধ্যে রয়েছে!' : 'Notice: Customer with this phone exists!'}</span>
              </div>
              <p className="pl-5">
                {language === 'bn'
                  ? `বিদ্যমান কাস্টমার: ${duplicateWarning.name} (${duplicateWarning.phone})`
                  : `Existing: ${duplicateWarning.name}`}
              </p>
            </div>
          )}

          {/* Name & Avatar Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'bn' ? 'কাস্টমারের নাম *' : 'Customer Name *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: রহিম আহমেদ' : 'e.g. Rahim Ahmed'}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Avatar Color Circles */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {language === 'bn' ? 'প্রোফাইল কালার' : 'Avatar Color'}
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    avatarColor === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {avatarColor === c && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {language === 'bn' ? 'বিকল্প মোবাইল (ঐচ্ছিক)' : 'Alternative Mobile'}
              </label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Address and Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'bn' ? 'ঠিকানা ও এলাকা' : 'Address & Area'}
            </label>
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={language === 'bn' ? 'বাড়ি / রোড / ফ্ল্যাট নং' : 'House / Road / Flat No'}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={language === 'bn' ? 'গ্রাম / এলাকা' : 'Area / Village'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
              <input
                type="text"
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                placeholder={language === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder={language === 'bn' ? 'জেলা' : 'District'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Opening Balance (Only on create or editable) */}
          {!isEditing && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800">
                {language === 'bn' ? 'পূর্বের জের বা বাকি (Opening Balance)' : 'Opening Balance (Previous Due)'}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOpeningBalanceType('receivable')}
                  className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition ${
                    openingBalanceType === 'receivable'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {language === 'bn' ? 'আমি টাকা পাব (+বাকি)' : 'Customer Owes Me'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpeningBalanceType('payable')}
                  className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition ${
                    openingBalanceType === 'payable'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {language === 'bn' ? 'সে টাকা পাবে (-দেনা)' : 'I Owe Customer'}
                </button>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-500">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Private Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'bn' ? 'ব্যক্তিগত নোট বা মন্তব্য (ঐচ্ছিক)' : 'Private Note (Optional)'}
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: প্রতি শুক্রবার বেতন পান' : 'e.g. Pays at month end'}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              <span>{isEditing ? (language === 'bn' ? 'হালনাগাদ করুন' : 'Update Customer') : (language === 'bn' ? 'কাস্টমার সংরক্ষণ করুন' : 'Save Customer')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
