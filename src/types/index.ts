export type Language = 'bn' | 'en';
export type Theme = 'light' | 'dark' | 'system';
export type UserRole = 'owner' | 'manager' | 'staff' | 'viewer';

export type TransactionType = 'credit' | 'payment' | 'loan_taken' | 'loan_paid';
// credit = বাকি দেওয়া (Customer owes money)
// payment = টাকা পাওয়া / গ্রহণ (Customer pays money)
// loan_taken = ধার নেওয়া (Business owes supplier/person)
// loan_paid = ধার শোধ (Business pays back supplier/person)

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'other';

export type CustomerStatus = 'regular' | 'due' | 'overdue' | 'settled';

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  altPhone?: string;
  address: string;
  businessType: string;
  currency: string;
  logo?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  bankDetails?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  altPhone?: string;
  address?: string;
  area?: string;
  thana?: string;
  district?: string;
  note?: string;
  openingBalance: number;
  openingBalanceType: 'receivable' | 'payable'; // receivable = আমি পাব, payable = সে পাবে
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface TransactionItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  businessId: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // e.g. "06:30 PM"
  dueDate?: string; // ISO date string
  reminderDate?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  items?: TransactionItem[];
  attachmentUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  code: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string; // কেজি, লিটার, পিস, প্যাকেট, ডজন, ইত্যাদি
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppSettings {
  language: Language;
  theme: Theme;
  pinLockEnabled: boolean;
  pinCode?: string;
  autoBackup: boolean;
  digitFormat: 'bn' | 'en'; // বাংলা সংখ্যা (১, ২, ৩) vs ইংরেজি সংখ্যা (1, 2, 3)
  soundEffects: boolean;
}

export interface CustomerWithBalance extends Customer {
  currentBalance: number; // >0 = customer owes shop (পাবেন), <0 = shop owes customer (দেবেন), 0 = settled
  totalCredit: number;
  totalPayment: number;
  lastTransactionDate?: string;
  lastTransactionType?: TransactionType;
  status: CustomerStatus;
  transactionCount: number;
}
