import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit2, 
  MoreHorizontal,
  LayoutGrid,
  Globe,
  X,
  Check,
  ChevronDown,
  Trash2,
  UploadCloud,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { useMainWebsite } from "../hooks/useMainWebsite";

// ── Types ──
type CollectionStatus = 'Active' | 'Draft';
type CollectionCategory = 'Men' | 'Women' | 'Accessories';

interface Collection {
  id: string;
  title: string;
  handle: string;
  category: CollectionCategory;
  productCount: number;
  status: CollectionStatus;
  imageUrl: string;
}

// ── Demo Data ──
const demoCollections: Collection[] = [
  {
    id: 'COL-001',
    title: "Summer '26 Drop",
    handle: "summer-26",
    category: 'Men',
    productCount: 24,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1523398002811-999aa8b95817?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'COL-002',
    title: "Essential Outerwear",
    handle: "outerwear",
    category: 'Men',
    productCount: 12,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'COL-003',
    title: "Women's Basics",
    handle: "womens-basics",
    category: 'Women',
    productCount: 36,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'COL-004',
    title: "Premium Leather Bags",
    handle: "bags",
    category: 'Accessories',
    productCount: 8,
    status: "Draft",
    imageUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80"
  }
];

export default function Collections() {
  // ── State Management ──
  const [collections, setCollections] = useState<Collection[]>(demoCollections);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'All' | CollectionCategory>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  
  // Dropdowns inside modal
  const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '', 
    category: 'Men' as CollectionCategory,
    status: 'Active' as CollectionStatus
  });

  // API Connection
  const { data: liveData, loading, viewOnMainWebsite } = useMainWebsite<any>("/collections");

  useEffect(() => {
    if (Array.isArray(liveData)) {
      const mapped = liveData.map((item: any, idx: number) => ({
        id: item.id || `COL-10${idx}`,
        title: item.title || 'Untitled Collection',
        handle: item.handle || item.slug || item.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
        category: item.category || 'Men',
        productCount: item.products_count ?? item.product_count ?? item.products?.length ?? 0,
        status: item.status || 'Active',
        imageUrl: item.image || '',
      }));
      setCollections(mapped);
    } else {
      setCollections([]);
    }
  }, [liveData]);

  // ── Handlers ──
  const openAddModal = () => {
    setEditingColId(null);
    setFormData({ title: '', imageUrl: '', category: 'Men', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingColId(col.id);
    setFormData({
      title: col.title,
      imageUrl: col.imageUrl,
      category: col.category,
      status: col.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
    toast.success('Collection deleted');
  };

  // ── Drag & Drop Handlers ──
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // 1. Check if they dropped a file from their PC
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setFormData({ ...formData, imageUrl: objectUrl });
        toast.success("Image added from file!");
      } else {
        toast.error("Please drop an image file.");
      }
      return;
    }

    // 2. Check if they dragged an image URL from another Chrome tab
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && (url.match(/\.(jpeg|jpg|gif|png)$/i) || url.includes("unsplash") || url.includes("http"))) {
      setFormData({ ...formData, imageUrl: url });
      toast.success("Image URL copied!");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: objectUrl });
      toast.success('Image loaded locally');
    }
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Please enter a collection title');
      return;
    }

    const fallbackImage = "https://images.unsplash.com/photo-1550614000-4b95dd2458e0?auto=format&fit=crop&w=800&q=80";

    const savedCol: Collection = {
      id: editingColId || `COL-${Math.floor(Math.random() * 900) + 100}`,
      title: formData.title,
      handle: formData.title.toLowerCase().replace(/\s+/g, '-'),
      category: formData.category,
      status: formData.status,
      productCount: editingColId ? (collections.find(c => c.id === editingColId)?.productCount || 0) : 0,
      imageUrl: formData.imageUrl || fallbackImage
    };

    if (editingColId) {
      setCollections(collections.map(c => c.id === editingColId ? savedCol : c));
      toast.success('Collection updated successfully!');
    } else {
      setCollections([savedCol, ...collections]);
      toast.success('Collection created successfully!');
    }

    setIsModalOpen(false);
    setIsCategorySelectOpen(false);
    setIsStatusSelectOpen(false);
  };

  const filteredCollections = collections.filter(col => {
    const matchesSearch = col.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryTab === 'All' || col.category === activeCategoryTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-[1200px] mx-auto text-[#ececec]">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Collections</h1>
            <p className="text-[14px] text-[#888] mt-1">Group your products into drops, seasons, and categories.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => viewOnMainWebsite("/collections")}
            className="bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-[#888]" /> View Live
          </button>
          <button 
            onClick={openAddModal}  
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create collection
          </button>
        </div>
      </div>

      {/* ── TOOLBAR & TABS ── */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 w-full max-w-[350px] focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all shrink-0">
          <Search className="w-4 h-4 text-[#888] mr-2.5" />
          <input
            type="text"
            placeholder="Search collections..."
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

        <div className="flex p-1 bg-[#111111] rounded-xl border border-white/10 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(['All', 'Men', 'Women', 'Accessories'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveCategoryTab(tab)}
              className={`px-5 py-1.5 text-[13px] font-medium rounded-lg transition-all whitespace-nowrap ${activeCategoryTab === tab ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-[#888] hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── COLLECTIONS GRID ── */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-[13px] text-[#888] font-medium">Loading collections...</span>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-[#111111] border border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
            <LayoutGrid className="w-6 h-6 text-[#666]" />
          </div>
          <h3 className="text-[16px] font-semibold text-white mb-1">No collections found</h3>
          <p className="text-[14px] text-[#888] max-w-[250px]">Adjust your filters or create a new collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCollections.map((col) => (
            <div 
              key={col.id} 
              onClick={() => openEditModal(col)}
              className="group relative h-[300px] rounded-2xl overflow-hidden bg-[#111111] border border-white/10 cursor-pointer shadow-lg"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${col.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-xl">
                  <button 
                    onClick={(e) => { e.stopPropagation(); viewOnMainWebsite(`/collections/${col.handle}`); }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    title="Preview Live"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(col.id); }}
                    className="p-2 bg-white/10 hover:bg-red-500/50 rounded-lg text-white transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3">
                  {col.status === 'Active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-[#ececec] text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#888]" /> Draft
                    </span>
                  )}
                  <span className="inline-flex px-2.5 py-1 rounded-md bg-black/50 border border-white/10 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {col.productCount} Products
                  </span>
                </div>
                <h2 className="text-[22px] font-bold text-white tracking-tight transform group-hover:translate-y-[-2px] transition-transform duration-300">
                  {col.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-visible my-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-[18px] font-bold text-white">{editingColId ? 'Edit Collection' : 'Create Collection'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCollection} className="p-5 space-y-5">
              
              <div>
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Collection Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="e.g. Winter Essentials"
                  autoFocus
                />
              </div>

              {/* ── DRAG AND DROP ZONE ── */}
              <div>
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Collection Image</label>
                
                <input 
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                />

                {!formData.imageUrl ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-32 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer group
                      ${isDragging ? 'bg-purple-500/20 border-purple-400 scale-[1.02]' : 'bg-[#1a1a1a] border-white/10 hover:bg-[#222] hover:border-purple-500/50'}
                    `}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className={`w-5 h-5 ${isDragging ? 'text-purple-400' : 'text-[#888] group-hover:text-purple-400'}`} />
                    </div>
                    <span className="text-[13px] font-medium text-center px-4">
                      {isDragging ? (
                        <span className="text-purple-400">Drop it here!</span>
                      ) : (
                        <span className="text-[#888]">Drag & drop an image, URL, or click to upload</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div 
                    className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    
                    <div className={`absolute inset-0 transition-all flex items-center justify-center backdrop-blur-sm
                      ${isDragging ? 'bg-purple-500/40 opacity-100' : 'bg-black/60 opacity-0 group-hover:opacity-100'}
                    `}>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`bg-white/10 text-white px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2
                          ${isDragging ? 'pointer-events-none scale-110' : 'hover:bg-purple-500/50 transition-colors'}
                        `}
                      >
                        {isDragging ? 'Drop to replace' : <><ImageIcon className="w-4 h-4" /> Change Image</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual URL Input Fallback */}
                <div className="flex items-center mt-3">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink-0 mx-3 text-[11px] font-medium text-[#666] uppercase">OR PASTE URL</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>
                <input 
                  type="url" 
                  value={formData.imageUrl.startsWith('blob:') ? '' : formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 mt-3 transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      {(['Men', 'Women', 'Accessories'] as CollectionCategory[]).map((cat) => (
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

                <div className="relative">
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Status</label>
                  <button 
                    type="button"
                    onClick={() => { setIsStatusSelectOpen(!isStatusSelectOpen); setIsCategorySelectOpen(false); }}
                    className="w-full flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      {formData.status === 'Active' && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                      {formData.status === 'Draft' && <div className="w-2 h-2 rounded-full bg-[#888]" />}
                      {formData.status}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#888]" />
                  </button>
                  {isStatusSelectOpen && (
                    <div className="absolute left-0 right-0 top-[105%] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                      {(['Active', 'Draft'] as CollectionStatus[]).map((statusOption) => (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => { setFormData({...formData, status: statusOption}); setIsStatusSelectOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {statusOption === 'Active' && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                            {statusOption === 'Draft' && <div className="w-2 h-2 rounded-full bg-[#888]" />}
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
                  <Check className="w-4 h-4" /> {editingColId ? 'Update Collection' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}