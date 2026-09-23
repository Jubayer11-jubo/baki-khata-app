import React, { useState } from 'react';
import {
  Store,
  Shield,
  Download,
  Upload,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Globe,
  Trash2,
  RefreshCw,
  Phone,
  Info,
  ChevronRight,
  Lock,
  Smartphone,
  Check,
  Package,
} from 'lucide-react';
import { Business, Language } from '../../types';
import { db } from '../../services/db';
import { downloadFile } from '../../services/exportImport';
import { sounds } from '../../utils/audio';

interface Props {
  business: Business;
  allBusinesses: Business[];
  onSwitchBusiness: (id: string) => void;
  onOpenNewBusinessModal: () => void;
  onOpenInventory: () => void;
  onOpenImportModal: () => void;
  language: Language;
  onToggleLanguage: () => void;
  digitFormat: 'bn' | 'en';
  onToggleDigitFormat: () => void;
  onRefreshData: () => void;
}

export const MoreView: React.FC<Props> = ({
  business,
  allBusinesses,
  onSwitchBusiness,
  onOpenNewBusinessModal,
  onOpenInventory,
  onOpenImportModal,
  language,
  onToggleLanguage,
  digitFormat,
  onToggleDigitFormat,
  onRefreshData,
}) => {
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [shopName, setShopName] = useState(business.name);
  const [ownerName, setOwnerName] = useState(business.ownerName);
  const [phone, setPhone] = useState(business.phone);
  const [address, setAddress] = useState(business.address);
  const [bkashNumber, setBkashNumber] = useState(business.bkashNumber || '');
  const [nagadNumber, setNagadNumber] = useState(business.nagadNumber || '');

  // PIN settings
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinEnabled, setPinEnabled] = useState(db.hasPinProtection());

  const handleSaveShopInfo = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveBusiness({
      ...business,
      name: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      bkashNumber: bkashNumber.trim() || undefined,
      nagadNumber: nagadNumber.trim() || undefined,
    });
    sounds.playSuccess();
    setIsEditingShop(false);
    onRefreshData();
  };

  // Export full JSON backup
  const handleExportJSON = () => {
    sounds.playClick();
    const jsonStr = db.exportFullBackupJSON();
    downloadFile(`bakikhata_backup_${new Date().toISOString().split('T')[0]}.json`, jsonStr, 'application/json');
  };

  // Restore JSON backup
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (db.restoreFullBackupJSON(content)) {
          sounds.playSuccess();
          alert(language === 'bn' ? 'ডাটা ব্যাকআপ সফলভাবে পুনরুদ্ধার হয়েছে!' : 'Backup restored successfully!');
          onRefreshData();
        } else {
          alert(language === 'bn' ? 'ভুল বা ত্রুটিপূর্ণ ব্যাকআপ ফাইল।' : 'Invalid backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      db.setPin(newPin);
      setPinEnabled(true);
      setShowPinModal(false);
      setNewPin('');
      sounds.playSuccess();
      alert(language === 'bn' ? '৪ ডিজিটের পিন লক সফলভাবে সেট করা হয়েছে।' : '4-digit PIN lock configured.');
    } else {
      alert(language === 'bn' ? '৪ ডিজিটের সংখ্যা দিন' : 'Enter 4 digits');
    }
  };

  const handleDisablePin = () => {
    if (window.confirm(language === 'bn' ? 'পিন লক বন্ধ করতে চান?' : 'Disable PIN lock?')) {
      db.removePin();
      setPinEnabled(false);
      sounds.playClick();
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm(language === 'bn' ? 'সব ডেমো ডাটা রিসেট করে প্রাথমিক অবস্থায় নিতে চান?' : 'Reset to default demo data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 pb-28 text-slate-800">
      {/* 1. Shop Info Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
              {business.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {business.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                মালিক: {business.ownerName} · {business.phone}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingShop(!isEditingShop)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            {isEditingShop ? 'বাতিল' : 'পরিবর্তন'}
          </button>
        </div>

        {isEditingShop && (
          <form onSubmit={handleSaveShopInfo} className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  দোকান / ব্যবসার নাম
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  স্বত্বাধিকারী / মালিকের নাম
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  দোকানের ফোন নম্বর
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-pink-600 mb-1">
                  বিকাশ নম্বর (পেমেন্ট রসিদে যাবে)
                </label>
                <input
                  type="tel"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-600 mb-1">
                  নগদ নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                দোকানের ঠিকানা
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              তথ্য সংরক্ষণ করুন
            </button>
          </form>
        )}
      </div>

      {/* 2. Management Shortcuts */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
          {language === 'bn' ? 'ম্যানেজমেন্ট ও হিসাব খাতা' : 'Management'}
        </div>

        {/* Product Inventory */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenInventory();
          }}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-900 block">
                {language === 'bn' ? 'পণ্য ও স্টক ইনভেন্টরি' : 'Products & Stock Inventory'}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'bn' ? 'দোকানের মালের স্টক ও কেনাবেচার দর' : 'Manage stock levels & selling prices'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Paper Khata CSV Import */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenImportModal();
          }}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-900 block">
                {language === 'bn' ? 'পুরাতন খাতা থেকে CSV ইমপোর্ট' : 'Import Paper Khata (CSV)'}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'bn' ? 'এক্সেল বা ডায়েরির বকেয়া ডাটা যোগ করুন' : 'Import old dues & records'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 3. Security & App Preferences */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
          {language === 'bn' ? 'নিরাপত্তা ও সেটিংস' : 'Security & Preferences'}
        </div>

        {/* 4-digit PIN lock */}
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {language === 'bn' ? '৪ ডিজিটের পিন সিকিউরিটি লক' : '4-digit PIN Lock'}
              </span>
              <span className="text-[11px] text-slate-500">
                {pinEnabled
                  ? language === 'bn' ? 'সক্রিয় রয়েছে' : 'Enabled'
                  : language === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled'}
              </span>
            </div>
          </div>

          <div>
            {pinEnabled ? (
              <button
                onClick={handleDisablePin}
                className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 rounded-xl"
              >
                লক বন্ধ করুন
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 rounded-xl"
              >
                পিন সেট করুন
              </button>
            )}
          </div>
        </div>

        {/* Digit System Bengali / English */}
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              ১২৩
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {language === 'bn' ? 'সংখ্যা ও টাকার ভাষা' : 'Number Format'}
              </span>
              <span className="text-[11px] text-slate-500">
                {digitFormat === 'bn' ? 'বাংলা সংখ্যা (১,২,৩)' : 'English Digits (1,2,3)'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onToggleDigitFormat();
            }}
            className="text-xs font-bold text-purple-700 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-xl transition"
          >
            {digitFormat === 'bn' ? 'English করুন' : 'বাংলা করুন'}
          </button>
        </div>

        {/* Language switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {language === 'bn' ? 'অ্যাপের ভাষা' : 'App Language'}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'bn' ? 'বাংলা (Bengali)' : 'English'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onToggleLanguage();
            }}
            className="text-xs font-bold text-teal-700 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 rounded-xl transition"
          >
            {language === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
      </div>

      {/* 4. Full Data Backup & Cloud / Local Sync */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
          {language === 'bn' ? 'ব্যাকআপ ও রিস্টোর' : 'Backup & Restore'}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Download JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl border border-slate-200 text-xs font-bold transition active:scale-95"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>সম্পূর্ণ ব্যাকআপ ফাইল</span>
          </button>

          {/* Restore JSON */}
          <label className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl border border-slate-200 text-xs font-bold transition active:scale-95">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>ফাইল থেকে রিস্টোর</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreJSON}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset to demo */}
        <div className="pt-2">
          <button
            onClick={handleResetDemoData}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>প্রাথমিক ডেমো ডাটা ফিরিয়ে আনুন (Reset Data)</span>
          </button>
        </div>
      </div>

      {/* App Version & Branding */}
      <div className="text-center py-4 text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-600">BakiKhata (ডিজিটাল বাকি খাতা) v2.4.0</p>
        <p>১০০% অফলাইনে সুরক্ষিত · লোকাল ডিভাইসে ডাটা সংরক্ষিত</p>
      </div>

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900 text-center">
              ৪ সংখ্যার পিন কোড সেট করুন
            </h4>
            <p className="text-xs text-slate-500 text-center">
              অ্যাপ খোলার সময় এই পিন কোডটি প্রয়োজন হবে
            </p>

            <form onSubmit={handleSavePin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                required
                autoFocus
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
                className="w-full py-3 text-center text-2xl font-bold tracking-widest bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
