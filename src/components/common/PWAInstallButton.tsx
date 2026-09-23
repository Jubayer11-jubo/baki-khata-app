import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  language?: 'bn' | 'en';
}

export const PWAInstallButton: React.FC<Props> = ({ language = 'bn' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, don't show
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition border border-blue-200 shadow-xs"
        title={language === 'bn' ? 'ফোনে অ্যাপ ইনস্টল করুন' : 'Install PWA App'}
      >
        <Download className="w-3.5 h-3.5 text-blue-600" />
        <span>{language === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition border border-slate-200"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-600" />
          <span>{language === 'bn' ? 'আইফোনে যোগ' : 'iOS Install'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'bn' ? 'আইফোনে বাকিখাতা ইনস্টল করুন' : 'Install BakiKhata on iPhone'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="py-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                  <p>সাফারি ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার)</strong> বাটনে ট্যাপ করুন।</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">2</span>
                  <p>তালিকা থেকে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ)</strong> নির্বাচন করুন।</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">3</span>
                  <p>উপরে <strong>Add</strong> চাপলেই সরাসরি অ্যাপের মতো ব্যবহার করতে পারবেন।</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                {language === 'bn' ? 'বুঝেছি' : 'Got It'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
