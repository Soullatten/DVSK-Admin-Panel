import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  X,
  Check,
  Package,
  ArrowDownToLine,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../api/productService';

// ── Types ──
type ProductStatus = 'Active' | 'Draft' | 'Archived';
type ProductCategory = 'Men' | 'Women' | 'Accessories';
type InventoryStatus = 'In stock' | 'Low stock' | 'Out of stock';

interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  status: ProductStatus;
  inventory: number;
  inventoryStatus: InventoryStatus;
  price: string;
  imageUrl?: string;
}

const mapApiProductToView = (p: any): Product => {
  const totalStock = Array.isArray(p.variants)
    ? p.variants.reduce((sum: number, v: any) => sum + Number(v.stock ?? 0), 0)
    : 0;
  let inventoryStatus: InventoryStatus = 'In stock';
  if (totalStock === 0) inventoryStatus = 'Out of stock';
  else if (totalStock <= 10) inventoryStatus = 'Low stock';

  let category: ProductCategory = 'Accessories';
  if (p.gender === 'MEN') category = 'Men';
  else if (p.gender === 'WOMEN') category = 'Women';

  let status: ProductStatus = 'Draft';
  if (p.isActive) status = 'Active';
  else if (p.isActive === false && p.isFeatured === false) status = 'Archived';

  const priceNum = Number(p.salePrice ?? p.basePrice ?? 0);
  return {
    id: p.id,
    name: p.name,
    category,
    status,
    inventory: totalStock,
    inventoryStatus,
    price: priceNum.toFixed(2),
    imageUrl: Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : undefined,
  };
};

export default function Products() {
  // ── State Management ──
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productService.listProducts();
        const list = res?.data?.data ?? res?.data ?? res ?? [];
        if (!cancelled && Array.isArray(list)) {
          setProducts(list.map(mapApiProductToView));
        }
      } catch (err) {
        if (!cancelled) setProducts([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category Tabs & Filter Dropdown State
  const [activeCategoryTab, setActiveCategoryTab] = useState<'All' | ProductCategory>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | ProductStatus>('All');
  const filterRef = useRef<HTMLDivElement>(null);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Dropdowns inside modal
  const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    inventory: '',
    category: 'Men' as ProductCategory,
    status: 'Active' as ProductStatus
  });

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handlers ──
  const openAddModal = () => {
    setEditingProductId(null);
    setFormData({ name: '', price: '', inventory: '', category: 'Men', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      price: product.price.replace(/,/g, ''), // Strip commas for input
      inventory: product.inventory.toString(),
      category: product.category,
      status: product.status
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.inventory === '') {
      toast.error('Please fill all required fields');
      return;
    }

    const inventoryCount = parseInt(formData.inventory, 10);
    
    // Smart Inventory Status Logic
    let calculatedInventoryStatus: InventoryStatus = 'In stock';
    if (inventoryCount === 0) calculatedInventoryStatus = 'Out of stock';
    else if (inventoryCount <= 10) calculatedInventoryStatus = 'Low stock';

    const savedProduct: Product = {
      id: editingProductId || `PROD-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.name,
      category: formData.category,
      status: formData.status,
      inventory: inventoryCount,
      inventoryStatus: calculatedInventoryStatus,
      price: Number(formData.price).toFixed(2)
    };

    if (editingProductId) {
      // Update existing
      setProducts(products.map(p => p.id === editingProductId ? savedProduct : p));
      toast.success('Product updated successfully!');
    } else {
      // Create new
      setProducts([savedProduct, ...products]);
      toast.success('Product added successfully!');
    }

    setIsModalOpen(false);
    setIsCategorySelectOpen(false);
    setIsStatusSelectOpen(false);
  };

  // ── Derived Data (Search & Filter) ──
  const filteredProducts = products.filter(product => {
    const matchesSearch = `${product.name} ${product.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryTab === 'All' || product.category === activeCategoryTab;
    const matchesStatusFilter = activeFilter === 'All' || product.status === activeFilter;
    
    return matchesSearch && matchesCategory && matchesStatusFilter;
  });

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-[1200px] mx-auto text-[#ececec]">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Products</h1>
            <p className="text-[14px] text-[#888] mt-1">Manage your inventory, pricing, and variants.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success('Import modal opened')}  
            className="bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4 text-[#888]" /> Import
          </button>
          <button 
            onClick={openAddModal}  
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add product
          </button>
        </div>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-visible">
        
        {/* Category Tabs & Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-4">
          
          {/* Top Row: Search & Category Tabs */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 w-full lg:max-w-[350px] focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all">
              <Search className="w-4 h-4 text-[#888] mr-2.5" />
              <input
                type="text"
                placeholder="Search products or SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-[#666]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#666] hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs & Status Filter */}
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
              
              {/* Category Segmented Control */}
              <div className="flex p-1 bg-[#1a1a1a] rounded-xl border border-white/10 shrink-0">
                {(['All', 'Men', 'Women', 'Accessories'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCategoryTab(tab)}
                    className={`px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all ${activeCategoryTab === tab ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-[#888] hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative shrink-0" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)} 
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium rounded-xl transition-colors border ${activeFilter !== 'All' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-[#1a1a1a] border-white/10 text-[#ececec] hover:bg-white/5'}`}
                >
                  <Filter className="w-4 h-4" /> 
                  {activeFilter !== 'All' ? activeFilter : 'Status'}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-[110%] w-[180px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                    <div className="px-3 py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wider border-b border-white/5 mb-1">Product Status</div>
                    {(['All', 'Active', 'Draft', 'Archived'] as const).map((filterOption) => (
                      <button
                        key={filterOption}
                        onClick={() => { setActiveFilter(filterOption); setIsFilterOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2 text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors"
                      >
                        {filterOption}
                        {activeFilter === filterOption && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-[#666]" />
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-1">No products found</h3>
              <p className="text-[14px] text-[#888] max-w-[250px]">
                {activeFilter !== 'All' || activeCategoryTab !== 'All' ? `No products match these filters.` : "Adjust your search or start adding inventory."}
              </p>
              {activeFilter === 'All' && activeCategoryTab === 'All' && !searchQuery && (
                <button onClick={openAddModal} className="mt-6 bg-white text-black px-5 py-2 rounded-xl text-[14px] font-semibold hover:bg-gray-200 transition-colors">
                  Add your first product
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#161616] border-b border-white/10">
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Inventory</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider text-right">Price</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => openEditModal(product)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-[#666]" />
                          )}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-white hover:text-purple-400 transition-colors">{product.name}</div>
                          <div className="text-[12px] text-[#888]">{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.status === 'Active' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Active
                        </div>
                      )}
                      {product.status === 'Draft' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Draft
                        </div>
                      )}
                      {product.status === 'Archived' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#ececec] text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#888]" /> Archived
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[14px] font-medium ${product.inventory === 0 ? 'text-red-400' : 'text-[#ececec]'}`}>
                          {product.inventory} in stock
                        </span>
                        {product.inventoryStatus === 'Low stock' && <span className="text-[12px] text-yellow-500 mt-0.5">Low stock</span>}
                        {product.inventoryStatus === 'Out of stock' && <span className="text-[12px] text-red-500 mt-0.5">Out of stock</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/5 text-[#ececec] text-[12px] font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-semibold text-white text-right">₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(product); }} className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded-md transition-colors" title="Edit Product">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setProducts(products.filter(p => p.id !== product.id)); toast.success('Product deleted'); }} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Delete Product">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT PRODUCT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-visible my-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-[18px] font-bold text-white">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-5 space-y-5">
              
              <div>
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="e.g. Black Oversized Tee"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Inventory Count</label>
                  <input 
                    type="number" 
                    value={formData.inventory}
                    onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div className="relative">
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Category</label>
                  <button 
                    type="button"
                    onClick={() => { setIsCategorySelectOpen(!isCategorySelectOpen); setIsStatusSelectOpen(false); }}
                    className="w-full flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  >
                    <span>{formData.category}</span>
                    <ChevronDown className="w-4 h-4 text-[#888]" />
                  </button>
                  {isCategorySelectOpen && (
                    <div className="absolute left-0 right-0 top-[105%] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                      {(['Men', 'Women', 'Accessories'] as ProductCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { setFormData({...formData, category: cat}); setIsCategorySelectOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors"
                        >
                          {cat}
                          {formData.category === cat && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Status</label>
                  <button 
                    type="button"
                    onClick={() => { setIsStatusSelectOpen(!isStatusSelectOpen); setIsCategorySelectOpen(false); }}
                    className="w-full flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      {formData.status === 'Active' && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                      {formData.status === 'Draft' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                      {formData.status === 'Archived' && <div className="w-2 h-2 rounded-full bg-[#888]" />}
                      {formData.status}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#888]" />
                  </button>
                  {isStatusSelectOpen && (
                    <div className="absolute left-0 right-0 top-[105%] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                      {(['Active', 'Draft', 'Archived'] as ProductStatus[]).map((statusOption) => (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => { setFormData({...formData, status: statusOption}); setIsStatusSelectOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {statusOption === 'Active' && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                            {statusOption === 'Draft' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                            {statusOption === 'Archived' && <div className="w-2 h-2 rounded-full bg-[#888]" />}
                            {statusOption}
                          </div>
                          {formData.status === statusOption && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 flex items-center justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl text-[13px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2">
                  <Check className="w-4 h-4" /> {editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}