import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface Props {
  language?: 'bn' | 'en';
}

export const OfflineBanner: React.FC<Props> = ({ language = 'bn' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-amber-500 text-white px-4 py-1.5 shadow-md flex items-center justify-center gap-2 text-xs font-medium animate-pulse">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {language === 'bn'
          ? 'ইন্টারনেট সংযোগ নেই — অফলাইনে কাজ চলছে, ডাটা ডিভাইসে নিরাপদ রয়েছে।'
          : 'No internet connection — Working offline. Data is saved locally.'}
      </span>
    </div>
  );
};
