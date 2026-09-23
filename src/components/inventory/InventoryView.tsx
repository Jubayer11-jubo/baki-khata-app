import React, { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, ArrowUp, ArrowDown, Edit2, Trash2, X } from 'lucide-react';
import { Product, Language } from '../../types';
import { db } from '../../services/db';
import { formatCurrency } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface Props {
  products: Product[];
  onProductUpdated: () => void;
  language: Language;
  digitFormat: 'bn' | 'en';
}

export const InventoryView: React.FC<Props> = ({
  products,
  onProductUpdated,
  language,
  digitFormat,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('সাধারণ');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [minStock, setMinStock] = useState('5');
  const [unit, setUnit] = useState('পিস');

  const useBnDigits = digitFormat === 'bn';

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  // KPI calculations
  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const handleOpenModal = (prod?: Product) => {
    sounds.playClick();
    if (prod) {
      setEditingProduct(prod);
      setName(prod.name);
      setCode(prod.code);
      setCategory(prod.category);
      setPurchasePrice(String(prod.purchasePrice));
      setSellingPrice(String(prod.sellingPrice));
      setStock(String(prod.stock));
      setMinStock(String(prod.minStock));
      setUnit(prod.unit);
    } else {
      setEditingProduct(null);
      setName('');
      setCode(`PRD-${Date.now().toString().slice(-4)}`);
      setCategory('মুদি');
      setPurchasePrice('');
      setSellingPrice('');
      setStock('10');
      setMinStock('5');
      setUnit('কেজি');
    }
    setIsModalOpen(true);
  };

  const handleAdjustStock = (prodId: string, delta: number) => {
    sounds.playClick();
    db.adjustProductStock(prodId, delta);
    onProductUpdated();
  };

  const handleDeleteProduct = (prodId: string) => {
    sounds.playClick();
    if (window.confirm(language === 'bn' ? 'এই পণ্যটি মুছে ফেলতে চান?' : 'Delete this product?')) {
      db.deleteProduct(prodId);
      onProductUpdated();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    db.saveProduct({
      id: editingProduct?.id,
      businessId: db.getActiveBusiness().id,
      name: name.trim(),
      code: code.trim() || `PRD-${Date.now()}`,
      category: category.trim() || 'অন্যান্য',
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stock: parseFloat(stock) || 0,
      minStock: parseFloat(minStock) || 0,
      unit: unit.trim() || 'পিস',
    });

    sounds.playSuccess();
    setIsModalOpen(false);
    onProductUpdated();
  };

  return (
    <div className="space-y-4 pb-28">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">
            {language === 'bn' ? 'মোট পণ্য' : 'Total Items'}
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalProducts}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">
            {language === 'bn' ? 'স্টক মূল্য' : 'Stock Value'}
          </span>
          <div className="text-xl font-bold text-blue-700 mt-1 tabular-nums truncate">
            {formatCurrency(totalStockValue, { useBengaliDigits: useBnDigits })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-amber-100 shadow-xs">
          <span className="text-xs text-amber-800 font-semibold block">
            {language === 'bn' ? 'কম স্টক সতর্কবার্তা' : 'Low Stock'}
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1 tabular-nums">
            {lowStockCount}
          </div>
        </div>
      </div>

      {/* Search & Add product bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'bn' ? 'পণ্য বা কোড দিয়ে খুঁজুন...' : 'Search products or code...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '+ নতুন পণ্য' : '+ Product'}</span>
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {filteredProducts.map((p) => {
          const isLowStock = p.stock <= p.minStock;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {p.name}
                    </h4>
                    {isLowStock && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                        {language === 'bn' ? 'স্টক কম' : 'Low Stock'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    কোড: {p.code} · ক্যাটাগরি: {p.category}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    বিক্রয় দর: ৳{p.sellingPrice}/{p.unit}
                    {p.purchasePrice > 0 && (
                      <span className="text-slate-400 font-normal ml-2">
                        (ক্রয়: ৳{p.purchasePrice})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Stock controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200">
                  <button
                    onClick={() => handleAdjustStock(p.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs"
                    title="-১ স্টক"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-extrabold text-slate-900 tabular-nums">
                    {p.stock} <span className="text-[10px] font-normal text-slate-500">{p.unit}</span>
                  </span>
                  <button
                    onClick={() => handleAdjustStock(p.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs"
                    title="+১ স্টক"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleOpenModal(p)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct
                  ? language === 'bn' ? 'পণ্য সম্পাদনা' : 'Edit Product'
                  : language === 'bn' ? 'নতুন পণ্য যোগ করুন' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'পণ্যের নাম *' : 'Product Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. মিনিকেট চাল ২৫ কেজি"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'বারকোড / কোড' : 'Code / SKU'}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="PRD-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="মুদি / মসলা / কাপড়"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'bn' ? 'বিক্রয় দর (৳) *' : 'Selling Price (৳)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'ক্রয় দর (৳)' : 'Purchase Price'}
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'বর্তমান স্টক' : 'Initial Stock'}
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'কম স্টক সীমা' : 'Low Alert'}
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'একক' : 'Unit'}
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="কেজি / পিস"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-center focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  {language === 'bn' ? 'পণ্য সংরক্ষণ করুন' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
