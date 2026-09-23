import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import { CustomerWithBalance, Transaction, Product, Business, Language } from './types';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { FAB } from './components/common/FAB';
import { OfflineBanner } from './components/common/OfflineBanner';
import { PINLockModal } from './components/common/PINLockModal';
import { BalanceCards } from './components/dashboard/BalanceCards';
import { QuickActions } from './components/dashboard/QuickActions';
import { CustomerListView } from './components/customers/CustomerListView';
import { CustomerProfileView } from './components/customers/CustomerProfileView';
import { AddCustomerModal } from './components/customers/AddCustomerModal';
import { TransactionEntryModal } from './components/transactions/TransactionEntryModal';
import { TransactionListView } from './components/transactions/TransactionListView';
import { ReceiptModal } from './components/transactions/ReceiptModal';
import { ReportsView } from './components/reports/ReportsView';
import { InvoiceMakerView } from './components/invoices/InvoiceMakerView';
import { InventoryView } from './components/inventory/InventoryView';
import { MoreView } from './components/settings/MoreView';
import { DueReminderQueueModal } from './components/common/DueReminderQueueModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AddBusinessModal } from './components/common/AddBusinessModal';
import { KhataImportModal } from './components/common/KhataImportModal';
import { sounds } from './utils/audio';
import { ArrowRight, ChevronRight, UserPlus, Users, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { formatCurrency, getRelativeDateString } from './utils/formatters';

export function App() {
  // Persistence states
  const [business, setBusiness] = useState<Business>(() => db.getActiveBusiness());
  const [allBusinesses, setAllBusinesses] = useState<Business[]>(() => db.getBusinesses());
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [isInvoiceMakerOpen, setIsInvoiceMakerOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // App Settings
  const [language, setLanguage] = useState<Language>('bn');
  const [digitFormat, setDigitFormat] = useState<'bn' | 'en'>('bn');
  const [isLocked, setIsLocked] = useState<boolean>(() => db.hasPinProtection());

  // Modals
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTakeLoanModalOpen, setIsTakeLoanModalOpen] = useState(false);
  const [isPayLoanModalOpen, setIsPayLoanModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithBalance | undefined>(undefined);
  const [txCustomerTargetId, setTxCustomerTargetId] = useState<string | undefined>(undefined);
  const [receiptData, setReceiptData] = useState<{ tx: Transaction; customer: CustomerWithBalance } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isNewBusinessModalOpen, setIsNewBusinessModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Reload all data for active business
  const refreshData = useCallback(() => {
    const activeBiz = db.getActiveBusiness();
    setBusiness(activeBiz);
    setAllBusinesses(db.getBusinesses());
    setCustomers(db.getCustomersWithBalance());
    setTransactions(db.getTransactions());
    setProducts(db.getProducts());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Balance aggregates
  const totalReceivable = customers
    .filter((c) => c.currentBalance > 0)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const totalPayable = customers
    .filter((c) => c.currentBalance < 0)
    .reduce((sum, c) => sum + Math.abs(c.currentBalance), 0);

  const netDue = totalReceivable - totalPayable;
  const overdueCount = customers.filter((c) => c.status === 'overdue' || (c.currentBalance > 0 && c.status === 'due')).length;

  // Selected customer object for Profile View
  const currentSelectedCustomer = activeCustomerId
    ? customers.find((c) => c.id === activeCustomerId)
    : null;

  const currentCustomerTransactions = activeCustomerId
    ? transactions.filter((t) => t.customerId === activeCustomerId)
    : [];

  // Handlers for transactions
  const handleOpenCreditModal = (customerId?: string) => {
    setTxCustomerTargetId(customerId || (activeCustomerId ? activeCustomerId : undefined));
    setIsCreditModalOpen(true);
  };

  const handleOpenPaymentModal = (customerId?: string) => {
    setTxCustomerTargetId(customerId || (activeCustomerId ? activeCustomerId : undefined));
    setIsPaymentModalOpen(true);
  };

  const handleOpenTakeLoanModal = () => {
    setTxCustomerTargetId(activeCustomerId || undefined);
    setIsTakeLoanModalOpen(true);
  };

  const handleOpenPayLoanModal = () => {
    setTxCustomerTargetId(activeCustomerId || undefined);
    setIsPayLoanModalOpen(true);
  };

  const handleSwitchBusiness = (id: string) => {
    db.setActiveBusiness(id);
    setActiveCustomerId(null);
    refreshData();
  };

  const handleDeleteTransaction = (txId: string) => {
    db.deleteTransaction(txId);
    sounds.playClick();
    refreshData();
  };

  const handleDeleteCustomer = (customerId: string) => {
    db.deleteCustomer(customerId);
    sounds.playClick();
    setActiveCustomerId(null);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Offline Connectivity Notification Banner */}
      <OfflineBanner language={language} />

      {/* 4-digit PIN lock screen if locked */}
      {isLocked && (
        <PINLockModal
          correctPin={db.getPin() || ''}
          onUnlock={() => setIsLocked(false)}
          language={language}
        />
      )}

      {/* App Top Header with Business Switcher & Search */}
      <Header
        business={business}
        allBusinesses={allBusinesses}
        onSwitchBusiness={handleSwitchBusiness}
        onOpenNewBusinessModal={() => setIsNewBusinessModalOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsRemindersOpen(true)}
        notificationCount={overdueCount}
      />

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
        {/* Render Customer Profile View if a customer is selected */}
        {activeCustomerId && currentSelectedCustomer ? (
          <CustomerProfileView
            customer={currentSelectedCustomer}
            transactions={currentCustomerTransactions}
            business={business}
            onBack={() => setActiveCustomerId(null)}
            onOpenCreditModal={(cid) => handleOpenCreditModal(cid)}
            onOpenPaymentModal={(cid) => handleOpenPaymentModal(cid)}
            onEditCustomer={(cust) => {
              setEditingCustomer(cust);
              setIsAddCustomerModalOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onViewReceipt={(tx, cust) => setReceiptData({ tx, customer: cust })}
            onDeleteTransaction={handleDeleteTransaction}
            language={language}
            digitFormat={digitFormat}
          />
        ) : isInvoiceMakerOpen ? (
          <InvoiceMakerView
            customers={customers}
            products={products}
            business={business}
            onBack={() => setIsInvoiceMakerOpen(false)}
            language={language}
            digitFormat={digitFormat}
          />
        ) : isInventoryOpen ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsInventoryOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
              </button>
            </div>
            <InventoryView
              products={products}
              onProductUpdated={refreshData}
              language={language}
              digitFormat={digitFormat}
            />
          </div>
        ) : (
          <>
            {/* Tab 1: Home Dashboard */}
            {activeTab === 'home' && (
              <div className="space-y-4 pb-24">
                {/* 1. Main 3 Balance Cards */}
                <BalanceCards
                  totalReceivable={totalReceivable}
                  totalPayable={totalPayable}
                  netDue={netDue}
                  language={language}
                  digitFormat={digitFormat}
                />

                {/* 2. Quick Action Buttons */}
                <QuickActions
                  onOpenCreditModal={() => handleOpenCreditModal()}
                  onOpenPaymentModal={() => handleOpenPaymentModal()}
                  onOpenTakeLoanModal={handleOpenTakeLoanModal}
                  onOpenPayLoanModal={handleOpenPayLoanModal}
                  onOpenAddCustomer={() => {
                    setEditingCustomer(undefined);
                    setIsAddCustomerModalOpen(true);
                  }}
                  language={language}
                />

                {/* 3. Due Reminder Notification Strip */}
                {overdueCount > 0 && (
                  <div
                    onClick={() => setIsRemindersOpen(true)}
                    className="p-3.5 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                        {overdueCount}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">
                          {language === 'bn' ? 'বকেয়া তাগাদা তালিকা' : 'Payment Reminder Queue'}
                        </span>
                        <span className="text-[11px] text-white/90">
                          {language === 'bn'
                            ? `${overdueCount} জনের বকেয়া বাকি দ্রুত তাগাদা দিন`
                            : `${overdueCount} customers need due reminders`}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/80" />
                  </div>
                )}

                {/* 4. Recent Customer Activity List */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        {language === 'bn' ? 'সাম্প্রতিক কাস্টমার বাকি ও লেনদেন' : 'Recent Customers'}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab('customers');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                    >
                      <span>{language === 'bn' ? 'সবাইকে দেখুন' : 'View All'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {customers.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-xs text-slate-400">
                        {language === 'bn' ? 'কোনো কাস্টমার যুক্ত করা হয়নি' : 'No customers added yet'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingCustomer(undefined);
                          setIsAddCustomerModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                      >
                        + কাস্টমার যোগ করুন
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {customers.slice(0, 5).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            sounds.playClick();
                            setActiveCustomerId(c.id);
                          }}
                          className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer rounded-xl px-2 transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0"
                              style={{ backgroundColor: c.avatarColor || '#2563EB' }}
                            >
                              {c.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-blue-600 transition-colors">
                                {c.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {c.phone} {c.area ? `· ${c.area}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-xs font-bold tabular-nums block ${
                                c.currentBalance > 0
                                  ? 'text-emerald-700'
                                  : c.currentBalance < 0
                                  ? 'text-red-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {c.currentBalance === 0
                                ? 'পরিশোধিত'
                                : formatCurrency(Math.abs(c.currentBalance), {
                                    useBengaliDigits: digitFormat === 'bn',
                                  })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {c.currentBalance > 0
                                ? 'পাবেন'
                                : c.currentBalance < 0
                                ? 'দেবেন'
                                : '০.০০'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Customers */}
            {activeTab === 'customers' && (
              <CustomerListView
                customers={customers}
                onSelectCustomer={(cid) => setActiveCustomerId(cid)}
                onOpenAddCustomer={() => {
                  setEditingCustomer(undefined);
                  setIsAddCustomerModalOpen(true);
                }}
                language={language}
                digitFormat={digitFormat}
              />
            )}

            {/* Tab 3: Transactions */}
            {activeTab === 'transactions' && (
              <TransactionListView
                transactions={transactions}
                customers={customers}
                onViewReceipt={(tx, cust) => setReceiptData({ tx, customer: cust })}
                onDeleteTransaction={handleDeleteTransaction}
                language={language}
                digitFormat={digitFormat}
              />
            )}

            {/* Tab 4: Reports */}
            {activeTab === 'reports' && (
              <ReportsView
                customers={customers}
                transactions={transactions}
                business={business}
                language={language}
                digitFormat={digitFormat}
              />
            )}

            {/* Tab 5: More */}
            {activeTab === 'more' && (
              <MoreView
                business={business}
                allBusinesses={allBusinesses}
                onSwitchBusiness={handleSwitchBusiness}
                onOpenNewBusinessModal={() => setIsNewBusinessModalOpen(true)}
                onOpenInventory={() => setIsInventoryOpen(true)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                language={language}
                onToggleLanguage={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                digitFormat={digitFormat}
                onToggleDigitFormat={() => setDigitFormat(digitFormat === 'bn' ? 'en' : 'bn')}
                onRefreshData={refreshData}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Speed Dial Button (FAB) */}
      {!activeCustomerId && !isInvoiceMakerOpen && !isInventoryOpen && (
        <FAB
          onOpenCreditModal={() => handleOpenCreditModal()}
          onOpenPaymentModal={() => handleOpenPaymentModal()}
          onOpenAddCustomer={() => {
            setEditingCustomer(undefined);
            setIsAddCustomerModalOpen(true);
          }}
          onOpenInvoiceMaker={() => setIsInvoiceMakerOpen(true)}
          language={language}
        />
      )}

      {/* Bottom Navigation */}
      {!activeCustomerId && !isInvoiceMakerOpen && !isInventoryOpen && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            setActiveCustomerId(null);
          }}
          language={language}
        />
      )}

      {/* MODALS */}

      {/* 1. Credit Modal (বাকি দিন) */}
      <TransactionEntryModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        type="credit"
        initialCustomerId={txCustomerTargetId}
        customers={customers}
        products={products}
        onTransactionSaved={refreshData}
        onOpenAddCustomer={() => {
          setIsCreditModalOpen(false);
          setIsAddCustomerModalOpen(true);
        }}
        language={language}
      />

      {/* 2. Payment Modal (টাকা নিন) */}
      <TransactionEntryModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        type="payment"
        initialCustomerId={txCustomerTargetId}
        customers={customers}
        products={products}
        onTransactionSaved={refreshData}
        onOpenAddCustomer={() => {
          setIsPaymentModalOpen(false);
          setIsAddCustomerModalOpen(true);
        }}
        language={language}
      />

      {/* 3. Take Loan Modal (+ ধার নিন) */}
      <TransactionEntryModal
        isOpen={isTakeLoanModalOpen}
        onClose={() => setIsTakeLoanModalOpen(false)}
        type="loan_taken"
        initialCustomerId={txCustomerTargetId}
        customers={customers}
        products={products}
        onTransactionSaved={refreshData}
        onOpenAddCustomer={() => {
          setIsTakeLoanModalOpen(false);
          setIsAddCustomerModalOpen(true);
        }}
        language={language}
      />

      {/* 4. Pay Loan Modal (টাকা দিন) */}
      <TransactionEntryModal
        isOpen={isPayLoanModalOpen}
        onClose={() => setIsPayLoanModalOpen(false)}
        type="loan_paid"
        initialCustomerId={txCustomerTargetId}
        customers={customers}
        products={products}
        onTransactionSaved={refreshData}
        onOpenAddCustomer={() => {
          setIsPayLoanModalOpen(false);
          setIsAddCustomerModalOpen(true);
        }}
        language={language}
      />

      {/* 5. Add / Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => {
          setIsAddCustomerModalOpen(false);
          setEditingCustomer(undefined);
        }}
        onCustomerAdded={() => {
          refreshData();
        }}
        language={language}
        editCustomer={editingCustomer}
      />

      {/* 6. Digital Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          isOpen={!!receiptData}
          onClose={() => setReceiptData(null)}
          transaction={receiptData.tx}
          customer={receiptData.customer}
          business={business}
          language={language}
          digitFormat={digitFormat}
        />
      )}

      {/* 7. Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        customers={customers}
        transactions={transactions}
        products={products}
        onSelectCustomer={(cid) => {
          setActiveCustomerId(cid);
        }}
        language={language}
        digitFormat={digitFormat}
      />

      {/* 8. Due Reminder Queue Modal */}
      <DueReminderQueueModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        customers={customers}
        business={business}
        onSelectCustomer={(cid) => {
          setActiveCustomerId(cid);
        }}
        language={language}
        digitFormat={digitFormat}
      />

      {/* 9. Add Business Modal */}
      <AddBusinessModal
        isOpen={isNewBusinessModalOpen}
        onClose={() => setIsNewBusinessModalOpen(false)}
        onBusinessAdded={(b) => {
          handleSwitchBusiness(b.id);
        }}
        language={language}
      />

      {/* 10. Paper Khata CSV Import Modal */}
      <KhataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={refreshData}
        language={language}
      />
    </div>
  );
}
export default App;
