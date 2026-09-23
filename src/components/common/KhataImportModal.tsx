import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { Language } from '../../types';
import { parseKhataCSV, executeKhataImport, KhataImportRow, downloadFile } from '../../services/exportImport';
import { formatCurrency } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  language: Language;
}

const SAMPLE_CSV = `নাম,মোবাইল,বাকি_টাকা,ধরন,ঠিকানা,নোট
আব্দুর রহিম,01711000001,1500,receivable,মিরপুর ১,মুদি বাকি
কামাল হোসেন,01822000002,3200,receivable,উত্তরা সেক্টর ৩,চাল ডাল বাকি
সোনালী ট্রেডার্স,01933000003,5000,payable,কাওরান বাজার,পাইকারি দেনা`;

export const KhataImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportComplete,
  language,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<KhataImportRow[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    sounds.playClick();
    downloadFile('bakikhata_sample_import.csv', SAMPLE_CSV);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        const rows = parseKhataCSV(content);
        setParsedRows(rows);
        setIsPreviewMode(true);
      }
    };
    reader.readAsText(file);
  };

  const handleParseManualText = () => {
    sounds.playClick();
    if (!csvText.trim()) return;
    const rows = parseKhataCSV(csvText);
    setParsedRows(rows);
    setIsPreviewMode(true);
  };

  const handleExecute = () => {
    sounds.playClick();
    const res = executeKhataImport(parsedRows);
    sounds.playSuccess();
    setResultMessage(
      language === 'bn'
        ? `সফলভাবে ${res.imported} টি রেকর্ড ইমপোর্ট হয়েছে! (${res.failed} টি ব্যর্থ)`
        : `Successfully imported ${res.imported} records! (${res.failed} failed)`
    );
    setTimeout(() => {
      onImportComplete();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'bn' ? 'পুরাতন খাতার হিসাব CSV ইমপোর্ট করুন' : 'Import Paper Khata Records'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {resultMessage ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center gap-3 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{resultMessage}</span>
            </div>
          ) : !isPreviewMode ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl border border-blue-200/70 flex items-start justify-between gap-3">
                <p>
                  {language === 'bn'
                    ? 'আপনার পুরাতন খাতা বা এক্সেল শিট থেকে কাস্টমার নাম, মোবাইল এবং পূর্বের বকেয়া হিসাব এক ক্লিকে ইমপোর্ট করুন।'
                    : 'Easily import customers and their balances from Excel/CSV file.'}
                </p>
                <button
                  onClick={handleDownloadSample}
                  className="flex items-center gap-1 text-blue-700 font-bold underline whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>নমুনা ফাইল</span>
                </button>
              </div>

              {/* Upload File Box */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-500 transition bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv,.txt"
                  id="csv-file-input"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    {language === 'bn' ? 'CSV ফাইল নির্বাচন করুন' : 'Click to upload CSV'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    বা টেক্সটবক্সে পেস্ট করুন
                  </span>
                </label>
              </div>

              {/* Text Area */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'অথবা সরাসরি CSV টেক্সট পেস্ট করুন:' : 'Or paste CSV data directly:'}
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="নাম,মোবাইল,বাকি_টাকা,ধরন,ঠিকানা,নোট"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleParseManualText}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-xs hover:bg-blue-700 transition"
              >
                {language === 'bn' ? 'যাচাই ও প্রিভিউ দেখুন' : 'Verify & Preview Data'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  {parsedRows.length} টি রেকর্ড পাওয়া গেছে
                </span>
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="text-blue-600 font-bold underline"
                >
                  পুনরায় সম্পাদনা
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">অবস্থা</th>
                      <th className="p-2">নাম</th>
                      <th className="p-2">মোবাইল</th>
                      <th className="p-2 text-right">টাকা</th>
                      <th className="p-2">ধরন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className={r.isValid ? 'bg-white' : 'bg-red-50'}>
                        <td className="p-2">
                          {r.isValid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <span className="text-red-600 font-bold" title={r.error}>
                              ভুল
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-semibold text-slate-800">{r.name}</td>
                        <td className="p-2 text-slate-600">{r.phone}</td>
                        <td className="p-2 text-right font-bold tabular-nums">৳{r.amount}</td>
                        <td className="p-2 text-slate-500">
                          {r.type === 'receivable' ? 'বাকি পাব' : 'দেনা দেব'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={handleExecute}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition"
              >
                {language === 'bn' ? 'নিশ্চিত করুন ও খাতায় যোগ করুন' : 'Confirm & Import to Khata'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
