import React from 'react';
import { Home, Users, ArrowLeftRight, BarChart3, Menu } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../utils/translations';
import { sounds } from '../../utils/audio';

export type NavTab = 'home' | 'customers' | 'transactions' | 'reports' | 'more';

interface Props {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  language: Language;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onChangeTab, language }) => {
  const t = translations[language].nav;

  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'customers', label: t.customers, icon: Users },
    { id: 'transactions', label: t.transactions, icon: ArrowLeftRight },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'more', label: t.more, icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 safe-area-pb shadow-lg no-print">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors relative ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-1 truncate max-w-[60px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
