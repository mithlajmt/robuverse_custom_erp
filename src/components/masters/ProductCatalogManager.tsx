"use client";

import { useState, useEffect } from "react";
import { DocumentStorageService } from "@/lib/storage/documentStorage";
import { Product } from "@/types/document";
import { formatCurrency } from "@/lib/utils/currency";

export function ProductCatalogManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setProducts(DocumentStorageService.getProducts());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct?.title) return;

    DocumentStorageService.saveProduct({
      id: selectedProduct.id || "",
      title: selectedProduct.title,
      description: selectedProduct.description || "",
      sacCode: selectedProduct.sacCode || "998313",
      defaultPrice: selectedProduct.defaultPrice || 0,
      unit: selectedProduct.unit || "Scope",
    });

    setProducts(DocumentStorageService.getProducts());
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this catalog item?")) {
      DocumentStorageService.deleteProduct(id);
      setProducts(DocumentStorageService.getProducts());
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sacCode || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Product & Service Catalog</h1>
          <p className="text-xs text-slate-500 font-medium">Manage standardized rates, HSN/SAC codes, and scope descriptions</p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct({});
            setIsEditing(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center space-x-2"
        >
          <span>+ Add Catalog Item</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search services by title or SAC code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
        />
      </div>

      {/* Product List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead className="bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="p-4">Item / Service Title</th>
              <th className="p-4">SAC / HSN</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Base Rate (₹)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 text-slate-900">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-indigo-50/30 transition">
                <td className="p-4 max-w-xs">
                  <p className="font-extrabold text-slate-900">{product.title}</p>
                  {product.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-medium">{product.description}</p>
                  )}
                </td>
                <td className="p-4">
                  <span className="font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                    {product.sacCode || "N/A"}
                  </span>
                </td>
                <td className="p-4 text-slate-700 font-semibold">{product.unit || "Unit"}</td>
                <td className="p-4 font-mono font-extrabold text-emerald-700 text-sm">
                  {formatCurrency(product.defaultPrice)}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditing(true);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Modal */}
      {isEditing && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              {selectedProduct.id ? "Edit Catalog Item" : "Add Catalog Item"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-bold">Service / Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unitree Robotics Technical Live Showcase"
                  value={selectedProduct.title || ""}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">Scope / Item Description</label>
                <textarea
                  rows={3}
                  placeholder="Scope details for quote or invoice line item..."
                  value={selectedProduct.description || ""}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">SAC / HSN Code</label>
                  <input
                    type="text"
                    placeholder="998313"
                    value={selectedProduct.sacCode || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, sacCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Base Rate (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="50000"
                    value={selectedProduct.defaultPrice || ""}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, defaultPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">Unit</label>
                  <input
                    type="text"
                    placeholder="Days / Scope"
                    value={selectedProduct.unit || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCatalogManager;
