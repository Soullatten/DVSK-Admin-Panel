import React, { useEffect, useState, useRef } from "react";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  ImagePlus, 
  X,
  Search,
  Check,
  UploadCloud,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

// Keep your existing imports
import { productService } from "../api/productService";
import { useMainWebsite } from '../hooks/useMainWebsite';
import {
  uploadProductImage,
  attachProductImages,
  addProductVariants,
} from "../api/uploadService";

type Category = "men" | "women" | "accessories";

interface Product {
  id: string;
  title?: string;
  name?: string;
  slug: string;
  price: number | string;
  description?: string;
  category?: Category | string;
}

export default function Inventory() {
  const { data: liveData, loading: liveLoading, error: liveError, viewOnMainWebsite } = useMainWebsite('/inventory');
  
  // Prevent unused TS errors
  console.log("Live Data Connection:", { liveData, liveLoading, liveError, viewOnMainWebsite });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    price: string;
    description: string;
    category: Category;
    sizes: string[];
    stock: string;
  }>({
    title: "",
    slug: "",
    price: "",
    description: "",
    category: "men",
    sizes: ["M"],
    stock: "0",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.listProducts();
      const data = (res?.data ?? (res as any)?.products ?? res) as unknown;
      setProducts(Array.isArray(data) ? (data as Product[]) : []);
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "category" ? (value as Category) : value,
    }));
  };

  // ── Cover Photo Handlers (With Drag & Drop) ──
  const handleCoverChange = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverChange(file);
  };

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

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleCoverChange(file);
      toast.success("Image dropped successfully!");
    } else {
      toast.error("Please drop a valid image file from your computer.");
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  };

  // ── Additional Images & Variants ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImageFiles(files);
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
      };
    });
  };

  // ── Form Submission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      slug: formData.slug,
      price: Number(formData.price) || 0,
      description: formData.description,
      category: formData.category,
      stock: Number(formData.stock) || 0,
    };

    const actionPromise = (async () => {
      if (editingId) {
        await productService.updateProduct(editingId, payload);
        return "updated";
      } else {
        const res = await productService.createProduct(payload);
        const product = (res as any).data ?? res;

        if (formData.sizes && formData.sizes.length > 0) {
          await addProductVariants(product.id, {
            sizes: formData.sizes,
            color: "Default",
            stock: Number(formData.stock) || 0,
          });
        }

        const allFiles: File[] = [];
        if (coverFile) allFiles.push(coverFile);
        allFiles.push(...imageFiles);

        if (allFiles.length > 0) {
          const uploaded: { url: string }[] = [];
          for (const file of allFiles) {
            const uploadRes = await uploadProductImage(file);
            const url = (uploadRes as any).data.url;
            uploaded.push({ url });
          }
          await attachProductImages(product.id, uploaded);
        }
        return "created";
      }
    })();

    toast.promise(actionPromise, {
      loading: editingId ? "Updating product..." : "Creating product...",
      success: (result: "created" | "updated") => {
        fetchProducts();
        closeForm();
        return result === "updated" ? "Product updated!" : "Product created!";
      },
      error: (err: any) =>
        err?.response?.data?.message || "Failed to save product",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    toast.promise(productService.deleteProduct(id), {
      loading: "Deleting...",
      success: () => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return "Product deleted!";
      },
      error: "Failed to delete product",
    });
  };

  const openEditForm = (product: Product) => {
    setFormData({
      title: product.title || product.name || "",
      slug: product.slug || "",
      price: product.price?.toString() || "",
      description: product.description || "",
      category: (product.category as Category) || "men",
      sizes: ["M"],
      stock: "0",
    });
    setEditingId(product.id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      price: "",
      description: "",
      category: "men",
      sizes: ["M"],
      stock: "0",
    });
    removeCover();
    setImageFiles([]);
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "all" || (p.category || "").toString().toLowerCase() === activeCategory;
    const matchesSearch = (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
            <h1 className="text-[24px] font-bold text-white tracking-tight">Inventory</h1>
            <p className="text-[14px] text-[#888] mt-1">Manage stock, variants, and product details.</p>
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-visible">
        
        {/* Toolbar & Tabs */}
        <div className="p-4 border-b border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 w-full lg:max-w-[350px] focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all">
            <Search className="w-4 h-4 text-[#888] mr-2.5" />
            <input
              type="text"
              placeholder="Search products..."
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

          <div className="flex p-1 bg-[#1a1a1a] rounded-xl border border-white/10 overflow-x-auto w-full sm:w-auto no-scrollbar shrink-0">
            {[
              { key: "all", label: "All Products" },
              { key: "men", label: "Men" },
              { key: "women", label: "Women" },
              { key: "accessories", label: "Accessories" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key as "all" | Category)}
                className={`px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeCategory === tab.key ? "bg-[#2a2a2a] text-white shadow-sm" : "text-[#888] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              <span className="text-[13px] text-[#888] font-medium">Loading inventory...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-[#666]" />
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-1">No products found</h3>
              <p className="text-[14px] text-[#888] max-w-[250px] mb-6">Add your first product to start tracking inventory.</p>
              <button onClick={() => setIsFormOpen(true)} className="bg-white text-black px-5 py-2 rounded-xl text-[14px] font-semibold hover:bg-gray-200 transition-colors">
                Add product
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#161616] border-b border-white/10">
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Product & Desc</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-bold text-white">{product.title || product.name}</div>
                      <div className="text-[12px] text-[#888] truncate max-w-[250px]">{product.description || "No description"}</div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#a0a0a0] font-mono">{product.slug}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/5 text-[#ececec] text-[12px] font-medium capitalize">
                        {(product.category || "—").toString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-semibold text-emerald-400">
                      ₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditForm(product)} className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded-md transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Delete">
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

      {/* ── CREATE / EDIT MODAL (Glassmorphism) ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-visible my-auto animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <h2 className="text-[18px] font-bold text-white">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={closeForm} className="text-[#888] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar">
              <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Drag & Drop Cover Photo */}
                <div className="md:col-span-2">
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Cover Photo</label>
                  {coverPreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 group">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <label className="cursor-pointer bg-white/10 hover:bg-purple-500/50 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors">
                          Change Image
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverInputChange} />
                        </label>
                        <button type="button" onClick={removeCover} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 text-[13px] font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                          <X className="w-4 h-4" /> Remove
                        </button>
                      </div>
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase border border-white/10">Cover</span>
                    </div>
                  ) : (
                    <div
                      onDrop={handleCoverDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-36 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group
                        ${isDragging ? 'bg-purple-500/20 border-purple-400 scale-[1.02]' : 'bg-[#1a1a1a] border-white/10 hover:bg-[#222] hover:border-purple-500/50'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud className={`w-5 h-5 ${isDragging ? 'text-purple-400' : 'text-[#888] group-hover:text-purple-400'}`} />
                      </div>
                      <p className={`text-[13px] font-medium ${isDragging ? 'text-purple-400' : 'text-[#888]'}`}>
                        {isDragging ? 'Drop image here!' : 'Click or drag & drop a cover photo'}
                      </p>
                      <p className="text-[11px] text-[#666]">PNG, JPG, WEBP from your computer</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverInputChange} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Product Title</label>
                  <input required name="title" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all" value={formData.title} onChange={handleChange} placeholder="e.g. Vintage Denim Jacket" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Slug (URL)</label>
                  <input required name="slug" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all" value={formData.slug} onChange={handleChange} placeholder="vintage-denim-jacket" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Price (₹)</label>
                  <input required name="price" type="number" step="0.01" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all" value={formData.price} onChange={handleChange} placeholder="0.00" />
                </div>

                <div className="relative">
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Category</label>
                  <button type="button" onClick={() => setIsCategorySelectOpen(!isCategorySelectOpen)} className="w-full flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 transition-all capitalize">
                    <span>{formData.category}</span>
                    <ChevronDown className="w-4 h-4 text-[#888]" />
                  </button>
                  {isCategorySelectOpen && (
                    <div className="absolute left-0 right-0 top-[105%] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                      {(["men", "women", "accessories"] as Category[]).map((cat) => (
                        <button key={cat} type="button" onClick={() => { setFormData({...formData, category: cat}); setIsCategorySelectOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors capitalize">
                          {cat}
                          {formData.category === cat && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Sizes Available</label>
                  <div className="flex gap-2 flex-wrap">
                    {["S", "M", "L", "XL", "XXL"].map((size) => {
                      const active = formData.sizes.includes(size);
                      return (
                        <button key={size} type="button" onClick={() => toggleSize(size)} className={`w-10 h-10 rounded-xl border text-[13px] font-bold transition-all ${active ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "bg-[#1a1a1a] text-[#888] border-white/10 hover:bg-[#222] hover:text-white"}`}>
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Stock (Per Size)</label>
                  <input required name="stock" type="number" min={0} step={1} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all" value={formData.stock} onChange={handleChange} placeholder="50" />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Gallery Images</label>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#888] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea name="description" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all min-h-[100px] resize-y custom-scrollbar" value={formData.description} onChange={handleChange} placeholder="Describe the fit, material, and details..." />
                </div>

              </form>
            </div>
            
            <div className="p-5 border-t border-white/10 flex justify-end gap-3 shrink-0 bg-[#111111] rounded-b-2xl">
              <button type="button" onClick={closeForm} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button form="product-form" type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl text-[13px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? "Update Product" : "Create Product"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}