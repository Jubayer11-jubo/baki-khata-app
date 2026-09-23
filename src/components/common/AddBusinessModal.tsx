import React, { useState } from 'react';
import { X, Store, User, Phone, MapPin } from 'lucide-react';
import { Business, Language } from '../../types';
import { db } from '../../services/db';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBusinessAdded: (newBusiness: Business) => void;
  language: Language;
}

export const AddBusinessModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onBusinessAdded,
  language,
}) => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBusiness = db.saveBusiness({
      name: name.trim(),
      ownerName: ownerName.trim() || 'প্রোপ্রাইটার',
      phone: phone.trim() || '01700000000',
      address: address.trim() || 'ঢাকা, বাংলাদেশ',
      currency: 'BDT',
      bkashNumber: bkashNumber.trim() || undefined,
    });

    sounds.playSuccess();
    onBusinessAdded(newBusiness);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'bn' ? 'নতুন দোকান বা ব্যবসা যোগ করুন' : 'Add New Business'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              দোকান / ব্যবসার নাম *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: ভাই ভাই স্টোর"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              মালিকের নাম
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="যেমন: মোঃ জুবাযের"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              মোবাইল নম্বর
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ঠিকানা
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="বাজারের নাম, এলাকা"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-pink-600 mb-1">
              বিকাশ নম্বর (ঐচ্ছিক)
            </label>
            <input
              type="tel"
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
            >
              দোকান সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
