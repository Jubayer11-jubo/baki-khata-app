import React, { useState } from 'react';
import { Store, Bell, Search, Globe, ChevronDown, Check, Plus, ShieldCheck } from 'lucide-react';
import { Business, Language } from '../../types';
import { getTimeGreeting } from '../../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';
import { sounds } from '../../utils/audio';

interface Props {
  business: Business;
  allBusinesses: Business[];
  onSwitchBusiness: (id: string) => void;
  onOpenNewBusinessModal: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export const Header: React.FC<Props> = ({
  business,
  allBusinesses,
  onSwitchBusiness,
  onOpenNewBusinessModal,
  language,
  onToggleLanguage,
  onOpenSearch,
  onOpenNotifications,
  notificationCount,
}) => {
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const greeting = getTimeGreeting(language);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Business Name & Greeting */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playClick();
              setShowBusinessDropdown(!showBusinessDropdown);
            }}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              {business.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate max-w-[160px] sm:max-w-[220px]">
                  {business.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                {greeting}
              </p>
            </div>
          </button>

          {/* Business Switcher Dropdown */}
          {showBusinessDropdown && (
            <div className="absolute top-12 left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'আপনার প্রতিষ্ঠানসমূহ' : 'Your Businesses'}
              </div>
              <div className="space-y-1 my-1">
                {allBusinesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      sounds.playClick();
                      onSwitchBusiness(b.id);
                      setShowBusinessDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition ${
                      b.id === business.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Store className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="truncate">{b.name}</span>
                    </div>
                    {b.id === business.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowBusinessDropdown(false);
                    onOpenNewBusinessModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? '+ নতুন দোকান যোগ করুন' : '+ Add New Business'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton language={language} />

          {/* Search trigger */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSearch();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition"
            title={language === 'bn' ? 'খুঁজুন' : 'Search'}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenNotifications();
            }}
            className="w-9 h-9 relative flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition"
            title={language === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* Language toggle (বাংলা / EN) */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleLanguage();
            }}
            className="h-9 px-2.5 flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition"
            title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
