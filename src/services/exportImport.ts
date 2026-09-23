import { CustomerWithBalance, Transaction } from '../types';
import { db } from './db';

/**
 * Trigger browser file download
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType }); // Add BOM for Excel Bengali character rendering
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Customer List to CSV
 */
export function exportCustomersToCSV(customers: CustomerWithBalance[]) {
  const headers = ['কাস্টমার আইডি', 'নাম', 'মোবাইল', 'ঠিকানা', 'বর্তমান বাকি/ব্যালেন্স', 'মোট বাকি', 'মোট আদায়', 'অবস্থা'];
  const rows = customers.map((c) => [
    c.id,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.phone}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    c.currentBalance,
    c.totalCredit,
    c.totalPayment,
    c.status === 'due' ? 'বাকি আছে' : c.status === 'overdue' ? 'সময় পেরিয়েছে' : c.status === 'settled' ? 'পরিশোধিত' : 'নিয়মিত',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `bakikhata_customers_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(filename, csvContent);
}

/**
 * Export Transactions to CSV
 */
export function exportTransactionsToCSV(transactions: Transaction[], customerMap: Map<string, string>) {
  const headers = ['তারিখ', 'সময়', 'কাস্টমার', 'ধরন', 'পরিমাণ (টাকা)', 'বিবরণ', 'পেমেন্ট মাধ্যম', 'রেফারেন্স'];
  const rows = transactions.map((t) => [
    t.date,
    t.time || '',
    `"${(customerMap.get(t.customerId) || t.customerId).replace(/"/g, '""')}"`,
    t.type === 'credit' ? 'বাকি' : t.type === 'payment' ? 'আদায়/পেমেন্ট' : t.type === 'loan_taken' ? 'ধার নেওয়া' : 'ধার শোধ',
    t.amount,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.paymentMethod || 'cash',
    `"${(t.reference || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `bakikhata_transactions_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(filename, csvContent);
}

export interface KhataImportRow {
  name: string;
  phone: string;
  address?: string;
  amount: number;
  type: 'receivable' | 'payable'; // receivable = আমি পাব, payable = সে পাবে
  note?: string;
  isValid: boolean;
  error?: string;
}

/**
 * Parse CSV text into KhataImportRow objects
 */
export function parseKhataCSV(csvText: string): KhataImportRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Remove potential header line
  const dataLines = lines.slice(1);
  const rows: KhataImportRow[] = [];

  for (const line of dataLines) {
    const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 2) continue;

    const name = parts[0] || '';
    const phone = parts[1] || '';
    const rawAmount = parts[2] ? parts[2].replace(/[^\d.]/g, '') : '0';
    const amount = parseFloat(rawAmount) || 0;
    const typeStr = (parts[3] || '').toLowerCase();
    const type: 'receivable' | 'payable' = typeStr.includes('pay') || typeStr.includes('দেবেন') ? 'payable' : 'receivable';
    const address = parts[4] || '';
    const note = parts[5] || '';

    let isValid = true;
    let error = '';

    if (!name) {
      isValid = false;
      error = 'নাম বাধ্যতামূলক';
    } else if (!phone || phone.length < 6) {
      isValid = false;
      error = 'সঠিক মোবাইল নম্বর দিন';
    }

    rows.push({
      name,
      phone,
      address,
      amount,
      type,
      note,
      isValid,
      error,
    });
  }

  return rows;
}

/**
 * Execute import of parsed rows into Database
 */
export function executeKhataImport(rows: KhataImportRow[]): { imported: number; failed: number } {
  let imported = 0;
  let failed = 0;

  for (const row of rows) {
    if (!row.isValid) {
      failed++;
      continue;
    }

    try {
      // Check if customer already exists by phone
      const existing = db.checkDuplicatePhone(row.phone);
      if (existing) {
        // Add as transaction to existing customer
        if (row.amount > 0) {
          db.saveTransaction({
            businessId: existing.businessId,
            customerId: existing.id,
            type: row.type === 'receivable' ? 'credit' : 'loan_taken',
            amount: row.amount,
            description: row.note || 'পুরাতন খাতা থেকে ইমপোর্টকৃত বকেয়া',
            date: new Date().toISOString().split('T')[0],
            createdBy: 'CSV Import',
          });
        }
      } else {
        // Create new customer with opening balance
        db.saveCustomer({
          businessId: db.getActiveBusiness().id,
          name: row.name,
          phone: row.phone,
          address: row.address,
          note: row.note || 'পুরাতন খাতা থেকে ইমপোর্ট করা হয়েছে',
          openingBalance: row.amount,
          openingBalanceType: row.type,
        });
      }
      imported++;
    } catch {
      failed++;
    }
  }

  return { imported, failed };
}
