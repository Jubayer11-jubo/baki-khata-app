export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const ENGLISH_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Convert any string or number of English digits to Bengali digits
 */
export function toBengaliDigits(input: string | number): string {
  const str = String(input);
  return str.replace(/\d/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

/**
 * Convert Bengali digits to English digits
 */
export function toEnglishDigits(input: string): string {
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(BENGALI_DIGITS[i], ENGLISH_DIGITS[i]);
  }
  return result;
}

/**
 * Format currency with Bangladeshi Indian/Lakh numbering system (e.g. 1,25,000)
 */
export function formatCurrency(
  amount: number,
  options: {
    showSymbol?: boolean;
    useBengaliDigits?: boolean;
    showSign?: boolean;
  } = {}
): string {
  const { showSymbol = true, useBengaliDigits = false, showSign = false } = options;
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));

  // Bangladeshi comma separation: last 3 digits, then every 2 digits
  let str = absAmount.toString();
  let result = '';

  if (str.length > 3) {
    const lastThree = str.substring(str.length - 3);
    const remaining = str.substring(0, str.length - 3);
    result = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    result = str;
  }

  if (useBengaliDigits) {
    result = toBengaliDigits(result);
  }

  const sign = showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : '';
  const symbol = showSymbol ? '৳ ' : '';

  return `${sign}${symbol}${result}`;
}

/**
 * Format ISO date string (YYYY-MM-DD) to friendly format
 */
export function formatDate(
  dateStr?: string,
  options: { lang?: 'bn' | 'en'; includeYear?: boolean } = {}
): string {
  if (!dateStr) return '';
  const { lang = 'bn', includeYear = true } = options;

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = date.getDate();
    const monthIdx = date.getMonth();
    const year = date.getFullYear();

    if (lang === 'bn') {
      const bnDay = toBengaliDigits(day);
      const bnMonth = BENGALI_MONTHS[monthIdx];
      const bnYear = toBengaliDigits(year);
      return includeYear ? `${bnDay} ${bnMonth} ${bnYear}` : `${bnDay} ${bnMonth}`;
    } else {
      const enMonth = ENGLISH_MONTHS[monthIdx];
      return includeYear ? `${day} ${enMonth} ${year}` : `${day} ${enMonth}`;
    }
  } catch {
    return dateStr;
  }
}

/**
 * Get friendly relative time (আজ, গতকাল, or date)
 */
export function getRelativeDateString(dateStr?: string, timeStr?: string, lang: 'bn' | 'en' = 'bn'): string {
  if (!dateStr) return '';
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let prefix = '';
  if (dateStr === today) {
    prefix = lang === 'bn' ? 'আজ' : 'Today';
  } else if (dateStr === yesterday) {
    prefix = lang === 'bn' ? 'গতকাল' : 'Yesterday';
  } else {
    prefix = formatDate(dateStr, { lang, includeYear: false });
  }

  if (timeStr) {
    const timeFormatted = lang === 'bn' ? toBengaliDigits(timeStr) : timeStr;
    return `${prefix}, ${timeFormatted}`;
  }

  return prefix;
}

/**
 * Get dynamic Bengali greeting based on time of day
 */
export function getTimeGreeting(lang: 'bn' | 'en' = 'bn'): string {
  const hour = new Date().getHours();
  if (lang === 'bn') {
    if (hour >= 5 && hour < 12) return 'শুভ সকাল 🌅';
    if (hour >= 12 && hour < 15) return 'শুভ দুপুর ☀️';
    if (hour >= 15 && hour < 18) return 'শুভ বিকাল 🌤️';
    if (hour >= 18 && hour < 22) return 'শুভ সন্ধ্যা 🌆';
    return 'শুভ রাত্রি 🌙';
  } else {
    if (hour >= 5 && hour < 12) return 'Good Morning 🌅';
    if (hour >= 12 && hour < 17) return 'Good Afternoon ☀️';
    if (hour >= 17 && hour < 22) return 'Good Evening 🌆';
    return 'Good Night 🌙';
  }
}

/**
 * Format standard phone number for Bangladesh (01XXXXXXXXX)
 */
export function formatBDPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
}
