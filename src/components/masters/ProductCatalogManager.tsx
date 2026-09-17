"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";
import { formatCurrency } from "@/lib/utils/currency";

export default function ProductCatalogManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(DocumentStorageService.getProducts());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct?.title) return;

    DocumentStorageService.saveProduct({
      id: selectedProduct.id,
      title: selectedProduct.title,
      description: selectedProduct.description || "",
      sacCode: selectedProduct.sacCode || "998313",
      defaultPrice: Number(selectedProduct.defaultPrice || 0),
      unit: selectedProduct.unit || "Days",
    });

    setIsEditing(false);
    setSelectedProduct(null);
    loadProducts();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this catalog item?")) {
      DocumentStorageService.deleteProduct(id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sacCode && p.sacCode.includes(searchQuery))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>📦</span> Products & Services Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage standard services, robotics showcases, workshop boot camps, SAC/HSN codes, and baseline prices.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct({ title: "", description: "", sacCode: "998313", defaultPrice: 0, unit: "Days" });
            setIsEditing(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all flex items-center space-x-2"
        >
          <span>+ Add Catalog Item</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search services by title or SAC code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Product List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Item / Service Title</th>
              <th className="p-4">SAC / HSN</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Base Rate (₹)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/40 transition-all">
                <td className="p-4 max-w-xs">
                  <p className="font-bold text-slate-100">{product.title}</p>
                  {product.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{product.description}</p>
                  )}
                </td>
                <td className="p-4">
                  <span className="font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/40">
                    {product.sacCode || "N/A"}
                  </span>
                </td>
                <td className="p-4 text-slate-300 font-medium">{product.unit || "Unit"}</td>
                <td className="p-4 font-mono font-bold text-emerald-400">
                  {formatCurrency(product.defaultPrice)}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditing(true);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-2.5 py-1 rounded bg-red-950/40 text-red-400 hover:bg-red-900/40 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">
              {selectedProduct.id ? "Edit Catalog Item" : "Add Catalog Item"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Service / Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unitree G1 Humanoid Robot Showcase"
                  value={selectedProduct.title || ""}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Detailed Scope / Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed breakdown of equipment and engineers included"
                  value={selectedProduct.description || ""}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">SAC / HSN Code</label>
                  <input
                    type="text"
                    placeholder="998313"
                    value={selectedProduct.sacCode || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, sacCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="50000"
                    value={selectedProduct.defaultPrice || 0}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, defaultPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Unit Label</label>
                  <input
                    type="text"
                    placeholder="Days / Hours"
                    value={selectedProduct.unit || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow"
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
