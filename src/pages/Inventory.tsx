import React, { useEffect, useState } from "react";
import { Package, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { productService } from "../api/productService";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<"all" | Category>("all");

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

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Load products from backend
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "category" ? (value as Category) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImageFiles(files);
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size],
      };
    });
  };

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
        // TODO: handle variants + images on edit later
        return "updated";
      } else {
        // 1) Create product
        const res = await productService.createProduct(payload);
        const product = (res as any).data ?? res;

        // 2) Add variants (sizes) with the same stock for each
        if (formData.sizes && formData.sizes.length > 0) {
          await addProductVariants(product.id, {
            sizes: formData.sizes,
            color: "Default",
            stock: Number(formData.stock) || 0,
          });
        }

        // 3) Upload all images and attach
        if (imageFiles.length > 0) {
          const uploaded: { url: string }[] = [];

          for (const file of imageFiles) {
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
        setImageFiles([]);
        return result === "updated" ? "Product updated!" : "Product created!";
      },
      error: (err: any) =>
        err?.response?.data?.message || "Failed to save product",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

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
      sizes: ["M"], // we don't load existing variants yet
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
    setImageFiles([]);
  };

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (p) =>
            (p.category || "").toString().toLowerCase() === activeCategory
        );

  return (
    <div className="min-h-full font-sans pb-12">
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
            <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">
              Inventory
            </h1>
          </div>
          <button
            onClick={() => setIsFormOpen((v) => !v)}
            className="bg-[#1a1a1a] flex items-center gap-2 text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-black transition-all shadow-sm"
          >
            {isFormOpen ? (
              "Cancel"
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Product
              </>
            )}
          </button>
        </div>

        {/* Create / Edit Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-6 mb-6">
            <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-4">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Title
                </label>
                <input
                  required
                  name="title"
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a1a1a]"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Slug (URL)
                </label>
                <input
                  required
                  name="slug"
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a1a1a]"
                  value={formData.slug}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Stock (per size)
                </label>
                <input
                  required
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a1a1a]"
                  value={formData.stock}
                  onChange={handleChange}
                />
                <p className="text-[11px] text-[#a0a0a0] mt-1">
                  This quantity will be set for each selected size variant.
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Price
                </label>
                <input
                  required
                  name="price"
                  type="number"
                  step="0.01"
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a1a1a]"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a1a1a]"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              {/* Sizes */}
              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Sizes
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["S", "M", "L", "XL"].map((size) => {
                    const active = formData.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1 rounded-full border text-[13px] ${
                          active
                            ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                            : "bg-white text-[#6b6b6b] border-[#e8e8e8] hover:bg-[#f9f9f9]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#a0a0a0] mt-1">
                  Select all sizes available for this product.
                </p>
              </div>

              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Product images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a1a1a]"
                />
                <p className="text-[11px] text-[#a0a0a0] mt-1">
                  Optional. Upload one or more images. The first one becomes
                  the cover.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[#6b6b6b] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#1a1a1a] min-h-[80px]"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-[13px] font-semibold text-[#6b6b6b] hover:text-[#1a1a1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1a1a1a] text-white text-[13px] font-semibold px-6 py-2 rounded-lg hover:bg:black transition-all shadow-sm"
                >
                  {editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6b6b6b]">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#1a1a1a]" />
              <p className="text-[14px]">Loading inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 bg-[#f9f9f9] rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-[#a0a0a0]" />
              </div>
              <h2 className="text-[15px] font-bold text-[#1a1a1a] mb-2">
                No products found
              </h2>
              <p className="text-[13px] text-[#6b6b6b] mb-6 max-w-[300px] text-center">
                Add your first product to start tracking inventory.
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-white border border-[#e8e8e8] text-[#1a1a1a] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f9f9f9] transition-all shadow-sm"
              >
                Add product
              </button>
            </div>
          ) : (
            <>
              {/* Category filter bar */}
              <div className="flex items-center justify-between px-6 pt-4 pb-2">
                <div className="text-[13px] text-[#6b6b6b]">
                  Showing {filteredProducts.length} products
                </div>
                <div className="flex gap-2 text-[12px]">
                  {[
                    { key: "all", label: "All" },
                    { key: "men", label: "Men" },
                    { key: "women", label: "Women" },
                    { key: "accessories", label: "Accessories" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() =>
                        setActiveCategory(tab.key as "all" | Category)
                      }
                      className={`px-3 py-1 rounded-full border ${
                        activeCategory === tab.key
                          ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                          : "bg-white text-[#6b6b6b] border-[#e8e8e8] hover:bg-[#f9f9f9]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e8e8e8] bg-[#fdfdfd]">
                      <th className="px-6 py-3 text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8e8]">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-[#fdfdfd] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="text-[14px] font-medium text-[#1a1a1a]">
                            {product.title || product.name}
                          </div>
                          <div className="text-[12px] text-[#888] truncate max-w-[200px]">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#6b6b6b]">
                          {product.slug}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#6b6b6b] capitalize">
                          {(product.category || "—").toString()}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-medium text-[#1a1a1a]">
                          ${Number(product.price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditForm(product)}
                              className="p-1.5 text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-[#6b6b6b] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}