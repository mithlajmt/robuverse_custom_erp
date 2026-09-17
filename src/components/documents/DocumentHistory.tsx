"use client";

import React, { useState, useEffect } from "react";
import { BusinessDocument, DocType, DocStatus } from "@/types/document";
import { DocumentStorageService } from "@/lib/storage/documentStorage";
import { formatCurrency } from "@/lib/utils/currency";

interface DocumentHistoryProps {
  onEditDocument: (doc: BusinessDocument) => void;
  onViewDocument: (doc: BusinessDocument) => void;
}

export default function DocumentHistory({ onEditDocument, onViewDocument }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setDocuments(DocumentStorageService.getDocuments());
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      DocumentStorageService.deleteDocument(id);
      loadDocuments();
    }
  };

  const handleConvert = (docId: string, targetType: DocType) => {
    let advancePercent = 50;
    if (targetType === "PROFORMA") {
      const input = prompt("Enter Advance Payment Percentage for Proforma Invoice (e.g. 50, 30, 25, 70, 100):", "50");
      if (input !== null) {
        const parsed = parseFloat(input);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
          advancePercent = parsed;
        }
      }
    }

    const converted = DocumentStorageService.convertDocument(docId, targetType, advancePercent);
    if (converted) {
      alert(`Document converted successfully to ${targetType} (${advancePercent}% advance)! New Ref #: ${converted.docNumber}`);
      loadDocuments();
      onEditDocument(converted);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipientOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.recipientName && doc.recipientName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "ALL" || doc.docType === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>📋</span> Company Document Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, manage, convert, and export company Tax Invoices, Proforma Invoices, Quotations, and Letterheads.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Ref # or Client Organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full md:w-80"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto">
          {["ALL", "PROFORMA", "TAX_INVOICE", "QUOTATION", "LETTERHEAD"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === type
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      {filteredDocs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-lg font-bold text-slate-300">No documents found</p>
          <p className="text-xs mt-1">Create a new document to start managing company records.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Ref Number & Type</th>
                <th className="p-4">Recipient / Client</th>
                <th className="p-4">Date</th>
                <th className="p-4">Grand Total (₹)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-4">
                    <p className="font-mono font-bold text-cyan-400">{doc.docNumber}</p>
                    <span className="text-[10px] font-semibold text-slate-400">{doc.docType.replace("_", " ")}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-100">{doc.recipientOrg}</p>
                    {doc.recipientName && doc.recipientName !== doc.recipientOrg && (
                      <p className="text-[11px] text-slate-400">{doc.recipientName}</p>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{doc.date}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(doc.grandTotal)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                        doc.status === "PAID"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800/50"
                          : doc.status === "ISSUED"
                          ? "bg-cyan-950 text-cyan-400 border-cyan-800/50"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* One-Click Conversion Buttons */}
                    {doc.docType === "QUOTATION" && (
                      <button
                        onClick={() => handleConvert(doc.id, "PROFORMA")}
                        className="px-2 py-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 text-[10px] font-bold hover:bg-amber-900/60"
                        title="Convert Quotation to Proforma Invoice"
                      >
                        ⚡ Convert to PI
                      </button>
                    )}
                    {doc.docType === "PROFORMA" && (
                      <button
                        onClick={() => handleConvert(doc.id, "TAX_INVOICE")}
                        className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold hover:bg-emerald-900/60"
                        title="Convert PI to Tax Invoice"
                      >
                        ⚡ Convert to Invoice
                      </button>
                    )}

                    <button
                      onClick={() => onViewDocument(doc)}
                      className="px-2.5 py-1 rounded bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/50 text-xs font-semibold"
                    >
                      View / PDF
                    </button>
                    <button
                      onClick={() => onEditDocument(doc)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
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
      )}
    </div>
  );
}
