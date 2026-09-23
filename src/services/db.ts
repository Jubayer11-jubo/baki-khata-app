import {
  Business,
  Customer,
  CustomerWithBalance,
  Transaction,
  Product,
  Invoice,
  StaffMember,
  AuditLog,
  AppSettings,
  CustomerStatus,
} from '../types';

const STORAGE_KEYS = {
  BUSINESSES: 'bakikhata_businesses_v1',
  ACTIVE_BUSINESS_ID: 'bakikhata_active_biz_id_v1',
  CUSTOMERS: 'bakikhata_customers_v1',
  TRANSACTIONS: 'bakikhata_transactions_v1',
  PRODUCTS: 'bakikhata_products_v1',
  INVOICES: 'bakikhata_invoices_v1',
  STAFF: 'bakikhata_staff_v1',
  AUDIT_LOGS: 'bakikhata_audit_v1',
  SETTINGS: 'bakikhata_settings_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'bn',
  theme: 'light',
  pinLockEnabled: false,
  pinCode: '',
  autoBackup: true,
  digitFormat: 'bn',
  soundEffects: true,
};

const DEFAULT_BUSINESS: Business = {
  id: 'biz_jubayer_store',
  name: 'Jubayer Store',
  ownerName: 'মো: জুবায়ের হোসেন',
  phone: '01712-345678',
  altPhone: '01812-345678',
  address: 'দোকান নং ১২, রোড ৩, মিরপুর-১০, ঢাকা-১২১৬',
  businessType: 'মুদি ও ডিপার্টমেন্টাল স্টোর',
  currency: 'BDT',
  bkashNumber: '01712-345678',
  nagadNumber: '01812-345678',
  rocketNumber: '01712-3456789',
  bankDetails: 'Islami Bank, Mirpur Branch, A/C: 20501234567',
  createdAt: new Date('2026-01-01').toISOString(),
};

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust_rahim',
    businessId: 'biz_jubayer_store',
    name: 'রহিম আহমেদ',
    phone: '01711223344',
    altPhone: '01811223344',
    address: 'বাড়ি নং ৪৫, ব্লক-সি',
    area: 'মিরপুর-১০',
    thana: 'মিরপুর',
    district: 'ঢাকা',
    note: 'প্রতি শুক্রবার জুমার পর বাকি পরিশোধ করেন',
    openingBalance: 1000,
    openingBalanceType: 'receivable',
    avatarColor: '#2563EB',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-23T08:00:00Z',
  },
  {
    id: 'cust_karim',
    businessId: 'biz_jubayer_store',
    name: 'করিম মিয়া',
    phone: '01822334455',
    address: 'দোকানের পেছনের গলি',
    area: 'সেনপাড়া পর্বতা',
    thana: 'কাফরুল',
    district: 'ঢাকা',
    note: 'মাসের ১ থেকে ৫ তারিখের মধ্যে বেতন পেয়ে টাকা দেন',
    openingBalance: 2000,
    openingBalanceType: 'receivable',
    avatarColor: '#16A34A',
    createdAt: '2026-09-05T12:00:00Z',
    updatedAt: '2026-09-22T15:00:00Z',
  },
  {
    id: 'cust_hasan',
    businessId: 'biz_jubayer_store',
    name: 'হাসান মাহমুদ',
    phone: '01933445566',
    address: 'ফ্ল্যাট ৪বি, প্রিয়াংকা হাউজিং',
    area: 'মিরপুর-২',
    thana: 'মিরপুর',
    district: 'ঢাকা',
    note: 'দোকানের নিয়মিত খরিদ্দার',
    openingBalance: 0,
    openingBalanceType: 'receivable',
    avatarColor: '#9333EA',
    createdAt: '2026-09-10T14:30:00Z',
    updatedAt: '2026-09-23T11:20:00Z',
  },
  {
    id: 'cust_nusrat',
    businessId: 'biz_jubayer_store',
    name: 'নুসরাত জাহান',
    phone: '01644556677',
    address: 'রোড ২, বাড়ি ১২',
    area: 'পল্লবী',
    thana: 'পল্লবী',
    district: 'ঢাকা',
    note: 'অনলাইনে বিকাশ করে দেন',
    openingBalance: 0,
    openingBalanceType: 'receivable',
    avatarColor: '#E11D48',
    createdAt: '2026-09-12T16:00:00Z',
    updatedAt: '2026-09-21T09:00:00Z',
  },
  {
    id: 'cust_billal_supplier',
    businessId: 'biz_jubayer_store',
    name: 'মেসার্স বিল্লাল ট্রেডার্স (তেল পাইকার)',
    phone: '01755667788',
    address: 'মৌলভীবাজার, চকবাজার',
    area: 'চকবাজার',
    thana: 'চকবাজার',
    district: 'ঢাকা',
    note: 'সয়াবিন তেল ও সরিষার তেলের পাইকারি মহাজন। বাকিতে মাল দেয়।',
    openingBalance: 15000,
    openingBalanceType: 'payable',
    avatarColor: '#D97706',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-20T17:00:00Z',
  },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_101',
    businessId: 'biz_jubayer_store',
    customerId: 'cust_rahim',
    type: 'credit',
    amount: 1500,
    description: 'মিনিকেট চাল ২৫ কেজি ১ বস্তা ও সয়াবিন তেল',
    date: '2026-09-23',
    time: '07:30 PM',
    dueDate: '2026-09-30',
    paymentMethod: 'cash',
    createdBy: 'জুবায়ের হোসেন',
    createdAt: '2026-09-23T13:30:00Z',
    updatedAt: '2026-09-23T13:30:00Z',
  },
  {
    id: 'tx_102',
    businessId: 'biz_jubayer_store',
    customerId: 'cust_karim',
    type: 'payment',
    amount: 800,
    description: 'আগের বাকির আংশিক পরিশোধ',
    date: '2026-09-23',
    time: '06:20 PM',
    paymentMethod: 'bkash',
    reference: 'TRX9A87K2L',
    createdBy: 'জুবায়ের হোসেন',
    createdAt: '2026-09-23T12:20:00Z',
    updatedAt: '2026-09-23T12:20:00Z',
  },
  {
    id: 'tx_103',
    businessId: 'biz_jubayer_store',
    customerId: 'cust_karim',
    type: 'credit',
    amount: 4000,
    description: 'মাসিক মুদি বাজার বাকিতে নিয়েছেন',
    date: '2026-09-21',
    time: '08:45 PM',
    dueDate: '2026-10-05',
    createdBy: 'জুবায়ের হোসেন',
    createdAt: '2026-09-21T14:45:00Z',
    updatedAt: '2026-09-21T14:45:00Z',
  },
  {
    id: 'tx_104',
    businessId: 'biz_jubayer_store',
    customerId: 'cust_hasan',
    type: 'credit',
    amount: 1800,
    description: 'ডানো দুধ, রাধুনী মসলা, চিনি ও ডিম',
    date: '2026-09-22',
    time: '11:15 AM',
    dueDate: '2026-09-29',
    createdBy: 'জুবায়ের হোসেন',
    createdAt: '2026-09-22T05:15:00Z',
    updatedAt: '2026-09-22T05:15:00Z',
  },
  {
    id: 'tx_105',
    businessId: 'biz_jubayer_store',
    customerId: 'cust_nusrat',
    type: 'credit',
    amount: 1200,
    description: 'চা পাতা, বিস্কুট ও আটা',
    date: '2026-09-20',
    time: '05:00 PM',
    createdBy: 'জুবায়ের হোসেন',
    createdAt: '2026-09-20T11:00:00Z',
    updatedAt: '2026-09-20T11:00:00Z',
  },
  {
    id: 'tx_106',
    businessId: 'biz_jubayer_store',
    customerId: 'cust_nusrat',
    type: 'payment',
    amount: 1200,
    description: 'নগদ অ্যাপে সম্পূর্ণ বিল পরিশোধ',
    date: '2026-09-21',
    time: '09:00 AM',
    paymentMethod: 'nagad',
    reference: 'NGD5541920',
    createdBy: 'জুবায়ের হোসেন',
    createdAt: '2026-09-21T03:00:00Z',
    updatedAt: '2026-09-21T03:00:00Z',
  },
  {
    id: 'tx_107',
    businessId: 'biz_jubayer_store',
    customerId: 'cust_billal_supplier',
    type: 'payment', // Shop pays supplier
    amount: 2700,
    description: 'বিল্লাল ট্রেডার্সকে তেলের মহাজন বাকি বাবদ চেক ও ক্যাশ প্রদান',
    date: '2026-09-20',
    time: '04:30 PM',
    paymentMethod: 'bank',
    createdBy: 'জুবায়ের হোসেন',
    createdAt: '2026-09-20T10:30:00Z',
    updatedAt: '2026-09-20T10:30:00Z',
  },
];

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    businessId: 'biz_jubayer_store',
    name: 'মিনিকেট চাল (Miniket Rice 25kg)',
    code: 'RICE-MIN-25',
    category: 'চাল ও ডাল',
    purchasePrice: 1750,
    sellingPrice: 1950,
    stock: 45,
    minStock: 10,
    unit: 'বস্তা',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'prod_2',
    businessId: 'biz_jubayer_store',
    name: 'তীর সয়াবিন তেল ৫ লিটার (Teer Oil 5L)',
    code: 'OIL-TEER-5L',
    category: 'তেল ও ঘি',
    purchasePrice: 890,
    sellingPrice: 960,
    stock: 28,
    minStock: 8,
    unit: 'বোতল',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'prod_3',
    businessId: 'biz_jubayer_store',
    name: 'ডানো গুঁড়ো দুধ ৫০০ গ্রাম (Dano Milk 500g)',
    code: 'MILK-DANO-500',
    category: 'দুগ্ধজাত পণ্য',
    purchasePrice: 420,
    sellingPrice: 470,
    stock: 14,
    minStock: 5,
    unit: 'প্যাকেট',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'prod_4',
    businessId: 'biz_jubayer_store',
    name: 'রাধুনী হলুদ গুঁড়া ২০০ গ্রাম',
    code: 'RAD-TUR-200',
    category: 'মসলা',
    purchasePrice: 75,
    sellingPrice: 90,
    stock: 6,
    minStock: 10, // low stock trigger
    unit: 'প্যাকেট',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'prod_5',
    businessId: 'biz_jubayer_store',
    name: 'এসিআই পিওর লবণ ১ কেজি',
    code: 'ACI-SALT-1K',
    category: 'নিত্যপ্রয়োজনীয়',
    purchasePrice: 38,
    sellingPrice: 45,
    stock: 50,
    minStock: 15,
    unit: 'প্যাকেট',
    createdAt: '2026-01-10T00:00:00Z',
  },
];

const DEMO_STAFF: StaffMember[] = [
  {
    id: 'staff_1',
    businessId: 'biz_jubayer_store',
    name: 'মো: জুবায়ের হোসেন',
    phone: '01712-345678',
    role: 'owner',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'staff_2',
    businessId: 'biz_jubayer_store',
    name: 'শামীম রেজা (ক্যাশ ম্যানেজার)',
    phone: '01844-998877',
    role: 'manager',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'staff_3',
    businessId: 'biz_jubayer_store',
    name: 'তানভীর হাসান (বিক্রয়কর্মী)',
    phone: '01955-112233',
    role: 'staff',
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
  },
];

class BakiKhataDatabase {
  private load<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultVal;
      return JSON.parse(data) as T;
    } catch {
      return defaultVal;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
  }

  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.BUSINESSES)) {
      this.resetToDemoData();
    }
  }

  public resetToDemoData(): void {
    this.save(STORAGE_KEYS.BUSINESSES, [DEFAULT_BUSINESS]);
    this.save(STORAGE_KEYS.ACTIVE_BUSINESS_ID, DEFAULT_BUSINESS.id);
    this.save(STORAGE_KEYS.CUSTOMERS, DEMO_CUSTOMERS);
    this.save(STORAGE_KEYS.TRANSACTIONS, DEMO_TRANSACTIONS);
    this.save(STORAGE_KEYS.PRODUCTS, DEMO_PRODUCTS);
    this.save(STORAGE_KEYS.INVOICES, []);
    this.save(STORAGE_KEYS.STAFF, DEMO_STAFF);
    this.save(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.logAudit(DEFAULT_BUSINESS.id, 'DEMO_DATA_INITIALIZED', 'Initial demo records populated.');
  }

  public clearAllData(): void {
    this.save(STORAGE_KEYS.BUSINESSES, [DEFAULT_BUSINESS]);
    this.save(STORAGE_KEYS.ACTIVE_BUSINESS_ID, DEFAULT_BUSINESS.id);
    this.save(STORAGE_KEYS.CUSTOMERS, []);
    this.save(STORAGE_KEYS.TRANSACTIONS, []);
    this.save(STORAGE_KEYS.PRODUCTS, []);
    this.save(STORAGE_KEYS.INVOICES, []);
    this.logAudit(DEFAULT_BUSINESS.id, 'ALL_DATA_CLEARED', 'All customer and ledger data was reset.');
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    return this.load<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.save(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- BUSINESS ---
  public getBusinesses(): Business[] {
    return this.load<Business[]>(STORAGE_KEYS.BUSINESSES, [DEFAULT_BUSINESS]);
  }

  public getActiveBusiness(): Business {
    const businesses = this.getBusinesses();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID) || DEFAULT_BUSINESS.id;
    return businesses.find((b) => b.id === activeId) || businesses[0] || DEFAULT_BUSINESS;
  }

  public setActiveBusiness(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, id);
    this.logAudit(id, 'BUSINESS_SWITCHED', `Active business set to ${id}`);
  }

  public saveBusiness(business: Partial<Business> & { name: string }): Business {
    const list = this.getBusinesses();
    const id = business.id || `biz_${Date.now()}`;
    const fullBusiness: Business = {
      id,
      name: business.name,
      ownerName: business.ownerName || 'স্বত্বাধিকারী',
      phone: business.phone || '01700000000',
      altPhone: business.altPhone,
      address: business.address || 'বাংলাদেশ',
      businessType: business.businessType || 'সাধারণ ব্যবসা',
      currency: business.currency || 'BDT',
      bkashNumber: business.bkashNumber,
      nagadNumber: business.nagadNumber,
      rocketNumber: business.rocketNumber,
      bankDetails: business.bankDetails,
      logo: business.logo,
      createdAt: business.createdAt || new Date().toISOString(),
    };

    const idx = list.findIndex((b) => b.id === id);
    if (idx >= 0) {
      list[idx] = fullBusiness;
    } else {
      list.push(fullBusiness);
    }
    this.save(STORAGE_KEYS.BUSINESSES, list);
    this.logAudit(id, 'BUSINESS_UPDATED', `Business ${fullBusiness.name} was saved.`);
    return fullBusiness;
  }

  // --- CUSTOMERS ---
  public getCustomers(businessId?: string): Customer[] {
    const bizId = businessId || this.getActiveBusiness().id;
    const all = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    return all.filter((c) => c.businessId === bizId && !c.isDeleted);
  }

  public getDeletedCustomers(businessId?: string): Customer[] {
    const bizId = businessId || this.getActiveBusiness().id;
    const all = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    return all.filter((c) => c.businessId === bizId && c.isDeleted);
  }

  public getCustomerById(id: string): Customer | undefined {
    const all = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    return all.find((c) => c.id === id);
  }

  public checkDuplicatePhone(phone: string, excludeId?: string, businessId?: string): Customer | undefined {
    const bizId = businessId || this.getActiveBusiness().id;
    const cleanInput = phone.replace(/[^\d]/g, '');
    if (cleanInput.length < 5) return undefined;

    const customers = this.getCustomers(bizId);
    return customers.find((c) => {
      if (excludeId && c.id === excludeId) return false;
      const cleanExisting = c.phone.replace(/[^\d]/g, '');
      return cleanExisting === cleanInput || cleanExisting.endsWith(cleanInput) || cleanInput.endsWith(cleanExisting);
    });
  }

  public saveCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    const all = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const now = new Date().toISOString();
    const bizId = customer.businessId || this.getActiveBusiness().id;

    if (customer.id) {
      const idx = all.findIndex((c) => c.id === customer.id);
      if (idx >= 0) {
        const updated: Customer = {
          ...all[idx],
          ...customer,
          updatedAt: now,
        };
        all[idx] = updated;
        this.save(STORAGE_KEYS.CUSTOMERS, all);
        this.logAudit(bizId, 'CUSTOMER_UPDATED', `Customer ${updated.name} updated`);
        return updated;
      }
    }

    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: bizId,
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(newCustomer);
    this.save(STORAGE_KEYS.CUSTOMERS, all);
    this.logAudit(bizId, 'CUSTOMER_CREATED', `Customer ${newCustomer.name} created`);
    return newCustomer;
  }

  public softDeleteCustomer(id: string): boolean {
    const all = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const idx = all.findIndex((c) => c.id === id);
    if (idx >= 0) {
      all[idx].isDeleted = true;
      all[idx].updatedAt = new Date().toISOString();
      this.save(STORAGE_KEYS.CUSTOMERS, all);
      this.logAudit(all[idx].businessId, 'CUSTOMER_DELETED', `Customer ${all[idx].name} moved to trash.`);
      return true;
    }
    return false;
  }

  public restoreCustomer(id: string): boolean {
    const all = this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const idx = all.findIndex((c) => c.id === id);
    if (idx >= 0) {
      all[idx].isDeleted = false;
      all[idx].updatedAt = new Date().toISOString();
      this.save(STORAGE_KEYS.CUSTOMERS, all);
      this.logAudit(all[idx].businessId, 'CUSTOMER_RESTORED', `Customer ${all[idx].name} restored.`);
      return true;
    }
    return false;
  }

  // --- TRANSACTIONS ---
  public getTransactions(businessId?: string): Transaction[] {
    const bizId = businessId || this.getActiveBusiness().id;
    const all = this.load<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return all.filter((t) => t.businessId === bizId && !t.isDeleted);
  }

  public getCustomerTransactions(customerId: string): Transaction[] {
    const all = this.getTransactions();
    return all
      .filter((t) => t.customerId === customerId)
      .sort((a, b) => new Date(b.date + ' ' + (b.time || '')).getTime() - new Date(a.date + ' ' + (a.time || '')).getTime());
  }

  public saveTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Transaction {
    const all = this.load<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const now = new Date().toISOString();
    const bizId = tx.businessId || this.getActiveBusiness().id;

    if (tx.id) {
      const idx = all.findIndex((t) => t.id === tx.id);
      if (idx >= 0) {
        const updated: Transaction = {
          ...all[idx],
          ...tx,
          updatedAt: now,
        };
        all[idx] = updated;
        this.save(STORAGE_KEYS.TRANSACTIONS, all);
        this.logAudit(bizId, 'TRANSACTION_EDITED', `Transaction ৳${updated.amount} edited`);
        return updated;
      }
    }

    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: bizId,
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(newTx);
    this.save(STORAGE_KEYS.TRANSACTIONS, all);
    this.logAudit(bizId, 'TRANSACTION_ADDED', `Transaction ৳${newTx.amount} added for customer ${newTx.customerId}`);
    return newTx;
  }

  public softDeleteTransaction(id: string): boolean {
    const all = this.load<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const idx = all.findIndex((t) => t.id === id);
    if (idx >= 0) {
      all[idx].isDeleted = true;
      all[idx].updatedAt = new Date().toISOString();
      this.save(STORAGE_KEYS.TRANSACTIONS, all);
      this.logAudit(all[idx].businessId, 'TRANSACTION_DELETED', `Transaction ${id} soft-deleted`);
      return true;
    }
    return false;
  }

  public restoreTransaction(id: string): boolean {
    const all = this.load<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const idx = all.findIndex((t) => t.id === id);
    if (idx >= 0) {
      all[idx].isDeleted = false;
      all[idx].updatedAt = new Date().toISOString();
      this.save(STORAGE_KEYS.TRANSACTIONS, all);
      this.logAudit(all[idx].businessId, 'TRANSACTION_RESTORED', `Transaction ${id} restored`);
      return true;
    }
    return false;
  }

  // --- BALANCE CALCULATIONS (Source of truth strictly from transaction records) ---
  public getCustomerBalance(customer: Customer): CustomerWithBalance {
    const transactions = this.getCustomerTransactions(customer.id);
    
    // Initial balance
    let balance = customer.openingBalance * (customer.openingBalanceType === 'receivable' ? 1 : -1);
    let totalCredit = customer.openingBalanceType === 'receivable' ? customer.openingBalance : 0;
    let totalPayment = customer.openingBalanceType === 'payable' ? customer.openingBalance : 0;

    for (const t of transactions) {
      if (t.type === 'credit') {
        balance += t.amount;
        totalCredit += t.amount;
      } else if (t.type === 'payment') {
        balance -= t.amount;
        totalPayment += t.amount;
      } else if (t.type === 'loan_taken') {
        balance -= t.amount; // shop owes supplier
        totalPayment += t.amount;
      } else if (t.type === 'loan_paid') {
        balance += t.amount; // shop paid back supplier
        totalCredit += t.amount;
      }
    }

    // Status evaluation
    let status: CustomerStatus = 'settled';
    if (balance > 0) {
      // Check if any credit transaction has overdue date
      const hasOverdue = transactions.some(
        (t) => t.type === 'credit' && t.dueDate && new Date(t.dueDate) < new Date()
      );
      status = hasOverdue ? 'overdue' : 'due';
    } else if (balance < 0) {
      status = 'regular';
    } else {
      status = 'settled';
    }

    const latestTx = transactions[0];

    return {
      ...customer,
      currentBalance: balance,
      totalCredit,
      totalPayment,
      lastTransactionDate: latestTx ? latestTx.date : customer.createdAt.split('T')[0],
      lastTransactionType: latestTx?.type,
      status,
      transactionCount: transactions.length,
    };
  }

  public getAllCustomersWithBalance(businessId?: string): CustomerWithBalance[] {
    const customers = this.getCustomers(businessId);
    return customers.map((c) => this.getCustomerBalance(c));
  }

  public getFinancialSummary(businessId?: string) {
    const customers = this.getAllCustomersWithBalance(businessId);
    const transactions = this.getTransactions(businessId);
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7); // YYYY-MM

    let totalReceivable = 0; // মোট পাবেন (>0)
    let totalPayable = 0;    // মোট দেবেন (<0)
    let totalCollected = 0;
    let totalPaidOut = 0;
    let todayCredit = 0;
    let todayCollected = 0;
    let thisMonthCredit = 0;
    let thisMonthCollected = 0;

    for (const c of customers) {
      if (c.currentBalance > 0) {
        totalReceivable += c.currentBalance;
      } else if (c.currentBalance < 0) {
        totalPayable += Math.abs(c.currentBalance);
      }
    }

    for (const t of transactions) {
      if (t.type === 'credit') {
        if (t.date === today) todayCredit += t.amount;
        if (t.date.startsWith(currentMonth)) thisMonthCredit += t.amount;
      } else if (t.type === 'payment') {
        totalCollected += t.amount;
        if (t.date === today) todayCollected += t.amount;
        if (t.date.startsWith(currentMonth)) thisMonthCollected += t.amount;
      } else if (t.type === 'loan_paid') {
        totalPaidOut += t.amount;
      }
    }

    const netDue = totalReceivable - totalPayable;

    return {
      totalReceivable,
      totalPayable,
      netDue,
      totalCollected,
      totalPaidOut,
      todayCredit,
      todayCollected,
      thisMonthCredit,
      thisMonthCollected,
      customerCount: customers.length,
      transactionCount: transactions.length,
    };
  }

  // --- PRODUCTS ---
  public getProducts(businessId?: string): Product[] {
    const bizId = businessId || this.getActiveBusiness().id;
    const all = this.load<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return all.filter((p) => p.businessId === bizId);
  }

  public saveProduct(product: Omit<Product, 'id' | 'createdAt'> & { id?: string }): Product {
    const all = this.load<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const bizId = product.businessId || this.getActiveBusiness().id;

    if (product.id) {
      const idx = all.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...product };
        this.save(STORAGE_KEYS.PRODUCTS, all);
        return all[idx];
      }
    }

    const newProd: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: bizId,
      createdAt: new Date().toISOString(),
    };
    all.push(newProd);
    this.save(STORAGE_KEYS.PRODUCTS, all);
    return newProd;
  }

  public adjustProductStock(id: string, delta: number): Product | undefined {
    const all = this.load<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = all.findIndex((p) => p.id === id);
    if (idx >= 0) {
      all[idx].stock = Math.max(0, all[idx].stock + delta);
      this.save(STORAGE_KEYS.PRODUCTS, all);
      return all[idx];
    }
    return undefined;
  }

  public deleteProduct(id: string): boolean {
    const all = this.load<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = all.filter((p) => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }

  // --- INVOICES ---
  public getInvoices(businessId?: string): Invoice[] {
    const bizId = businessId || this.getActiveBusiness().id;
    const all = this.load<Invoice[]>(STORAGE_KEYS.INVOICES, []);
    return all.filter((inv) => inv.businessId === bizId);
  }

  public saveInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'> & { id?: string }): Invoice {
    const all = this.load<Invoice[]>(STORAGE_KEYS.INVOICES, []);
    const bizId = invoice.businessId || this.getActiveBusiness().id;

    const newInv: Invoice = {
      ...invoice,
      id: invoice.id || `inv_${Date.now()}`,
      businessId: bizId,
      createdAt: new Date().toISOString(),
    };

    all.unshift(newInv);
    this.save(STORAGE_KEYS.INVOICES, all);

    // If there is an associated customer and there is dueAmount, automatically record credit transaction!
    if (invoice.customerId && invoice.dueAmount > 0) {
      this.saveTransaction({
        businessId: bizId,
        customerId: invoice.customerId,
        type: 'credit',
        amount: invoice.dueAmount,
        description: `ক্যাশ মেমো #${invoice.invoiceNumber} বাবদ বাকি`,
        date: invoice.date,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        reference: invoice.invoiceNumber,
        createdBy: this.getActiveBusiness().ownerName,
      });
    }

    this.logAudit(bizId, 'INVOICE_CREATED', `Invoice #${newInv.invoiceNumber} created (Total: ৳${newInv.grandTotal})`);
    return newInv;
  }

  // --- STAFF ---
  public getStaff(businessId?: string): StaffMember[] {
    const bizId = businessId || this.getActiveBusiness().id;
    const all = this.load<StaffMember[]>(STORAGE_KEYS.STAFF, []);
    return all.filter((s) => s.businessId === bizId);
  }

  public saveStaff(staff: Omit<StaffMember, 'id' | 'createdAt'> & { id?: string }): StaffMember {
    const all = this.load<StaffMember[]>(STORAGE_KEYS.STAFF, []);
    const bizId = staff.businessId || this.getActiveBusiness().id;

    if (staff.id) {
      const idx = all.findIndex((s) => s.id === staff.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...staff };
        this.save(STORAGE_KEYS.STAFF, all);
        return all[idx];
      }
    }

    const newStaff: StaffMember = {
      ...staff,
      id: `staff_${Date.now()}`,
      businessId: bizId,
      createdAt: new Date().toISOString(),
    };
    all.push(newStaff);
    this.save(STORAGE_KEYS.STAFF, all);
    return newStaff;
  }

  public deleteStaff(id: string): boolean {
    const all = this.load<StaffMember[]>(STORAGE_KEYS.STAFF, []);
    const filtered = all.filter((s) => s.id !== id);
    this.save(STORAGE_KEYS.STAFF, filtered);
    return true;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(businessId?: string): AuditLog[] {
    const bizId = businessId || this.getActiveBusiness().id;
    const all = this.load<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    return all.filter((a) => a.businessId === bizId).slice(0, 50);
  }

  public logAudit(businessId: string, action: string, details: string): void {
    const all = this.load<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const newLog: AuditLog = {
      id: `audit_${Date.now()}`,
      businessId,
      userId: 'user_owner',
      userName: this.getActiveBusiness().ownerName,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    all.unshift(newLog);
    this.save(STORAGE_KEYS.AUDIT_LOGS, all.slice(0, 100));
  }

  // --- PIN LOCK & SECURITY ---
  public hasPinProtection(): boolean {
    const s = this.getSettings();
    return !!s.pinLockEnabled && !!s.pinCode;
  }

  public getPin(): string {
    return this.getSettings().pinCode || '';
  }

  public setPin(pin: string): void {
    this.updateSettings({ pinLockEnabled: true, pinCode: pin });
  }

  public removePin(): void {
    this.updateSettings({ pinLockEnabled: false, pinCode: '' });
  }

  // --- CONVENIENCE ALIASES ---
  public getCustomersWithBalance(businessId?: string): CustomerWithBalance[] {
    return this.getAllCustomersWithBalance(businessId);
  }

  public deleteCustomer(id: string): boolean {
    return this.softDeleteCustomer(id);
  }

  public deleteTransaction(id: string): boolean {
    return this.softDeleteTransaction(id);
  }

  public restoreFullBackupJSON(jsonStr: string): boolean {
    return this.importFullBackupJSON(jsonStr).success;
  }

  // --- BACKUP & RESTORE DATA ---
  public exportFullBackupJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      businesses: this.load(STORAGE_KEYS.BUSINESSES, []),
      customers: this.load(STORAGE_KEYS.CUSTOMERS, []),
      transactions: this.load(STORAGE_KEYS.TRANSACTIONS, []),
      products: this.load(STORAGE_KEYS.PRODUCTS, []),
      invoices: this.load(STORAGE_KEYS.INVOICES, []),
      staff: this.load(STORAGE_KEYS.STAFF, []),
      settings: this.load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    };
    return JSON.stringify(data, null, 2);
  }

  public importFullBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.businesses || !data.customers || !data.transactions) {
        return { success: false, message: 'অকার্যকর ব্যাকআপ ফাইল ফরম্যাট।' };
      }
      this.save(STORAGE_KEYS.BUSINESSES, data.businesses);
      this.save(STORAGE_KEYS.CUSTOMERS, data.customers);
      this.save(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.products) this.save(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.invoices) this.save(STORAGE_KEYS.INVOICES, data.invoices);
      if (data.staff) this.save(STORAGE_KEYS.STAFF, data.staff);
      if (data.settings) this.save(STORAGE_KEYS.SETTINGS, data.settings);
      return { success: true, message: 'ডাটা সফলভাবে রিস্টোর হয়েছে!' };
    } catch {
      return { success: false, message: 'ফাইল রিড করতে ব্যর্থ হয়েছে।' };
    }
  }
}

export const db = new BakiKhataDatabase();
// Initialize on import
db.init();
