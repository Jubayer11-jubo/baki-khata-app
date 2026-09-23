import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  correctPin: string;
  onUnlock: () => void;
  language?: 'bn' | 'en';
}

export const PINLockModal: React.FC<Props> = ({ correctPin, onUnlock, language = 'bn' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    sounds.playClick();
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError(false);

      if (next.length === 4) {
        if (next === correctPin) {
          sounds.playSuccess();
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    sounds.playClick();
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400">
        <Lock className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-white mb-2">
        {language === 'bn' ? 'BakiKhata পিন কোড দিন' : 'Enter BakiKhata PIN'}
      </h2>
      <p className="text-slate-400 text-sm mb-8 text-center">
        {language === 'bn' ? 'আপনার দোকানের আর্থিক তথ্য সুরক্ষিত রাখা হয়েছে' : 'Your business financial records are protected'}
      </p>

      {/* 4 PIN Dots */}
      <div className="flex gap-5 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              error
                ? 'border-red-500 bg-red-500 animate-bounce'
                : i < pin.length
                ? 'border-blue-500 bg-blue-500 scale-125'
                : 'border-slate-600 bg-transparent'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-4 font-semibold animate-shake">
          {language === 'bn' ? 'ভুল পিন কোড! আবার চেষ্টা করুন।' : 'Incorrect PIN! Please try again.'}
        </p>
      )}

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-2xl font-bold text-slate-100 flex items-center justify-center border border-slate-700 transition"
          >
            {d}
          </button>
        ))}

        <div />
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-2xl font-bold text-slate-100 flex items-center justify-center border border-slate-700 transition"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
