"use client";

import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import Link from "next/link";
import { FileSignature, Download, ChevronLeft } from "lucide-react";

interface QuotationItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

interface LetterheadData {
  docType: string;
  docSubtitle: string;
  refNo: string;
  date: string;
  recipientName: string;
  recipientOrg: string;
  recipientAddress: string;
  subject: string;
  bodyText: string;
  items: QuotationItem[];
  tableMode: "simple" | "detailed";
  gstMode: "exclusive" | "inclusive" | "calculated";
  taxRate: number;
  paymentTerms: string;
  validityNotes: string;
  closingText: string;
  signatoryName: string;
  signatoryTitle: string;
  placeOfIssue: string;
  showSeal: boolean;
  showSignature: boolean;
  showWatermark: boolean;
  logoSize: "sm" | "md" | "lg";
}

const PRESETS: Record<string, LetterheadData> = {
  quotation: {
    docType: "QUOTATION",
    docSubtitle: "Atal Tinkering Lab & Innovation Lab — Turnkey Setup & Implementation",
    refNo: "RBV/ATL/2026/002",
    date: "2026-07-22",
    recipientName: "The General Secretary",
    recipientOrg: "Bharatheeya Vidya Nikethan Keralam",
    recipientAddress: "Bhaskery Mandiram, RVN Campus\nKallekkad (P.O), Palakkad, Kerala - 678006",
    subject: "Quotation for Atal Tinkering Lab (ATL) & Innovation Lab — Turnkey Design, Equipment, Curriculum, Training and Implementation Support",
    bodyText: "Dear Sir/Madam,\n\nThank you for considering Robuverse as your Atal Tinkering Lab implementation partner. Please find below our detailed quotation for the design, setup, equipment, curriculum, training, and application support required to establish your innovation lab, structured in alignment with AIM/NITI Aayog ATL guidelines.",
    items: [
      { id: "1", description: "Composite Lab Planning, Design & Consultation", qty: 1, price: 60000 },
      { id: "2", description: "Civil & Interior Lab Setup Works", qty: 1, price: 85000 },
      { id: "3", description: "Electrical, Networking & Power Infrastructure", qty: 1, price: 55000 },
      { id: "4", description: "Laboratory Furniture & Storage Solutions", qty: 1, price: 120000 },
      { id: "5", description: "Robotics, AI, IoT & STEM Equipment Supply", qty: 1, price: 345000 },
      { id: "6", description: "Computer Systems, Software & Digital Learning Resources", qty: 1, price: 90000 },
      { id: "7", description: "Installation, Configuration & Commissioning", qty: 1, price: 45000 },
      { id: "8", description: "Teacher Training & Capacity Building", qty: 1, price: 50000 },
      { id: "9", description: "Curriculum, Documentation & Learning Materials", qty: 1, price: 40000 },
      { id: "10", description: "Project Management, Logistics & Quality Assurance", qty: 1, price: 40000 },
      { id: "11", description: "Warranty & Technical Support (1 Year)", qty: 1, price: 50000 },
    ],
    tableMode: "simple",
    gstMode: "exclusive",
    taxRate: 18,
    paymentTerms: "50% advance on confirmation of order\n30% on equipment delivery & installation\n20% on handover, training completion & launch",
    validityNotes: "The quotation is valid for 60 days from the date of issue.\nFinal scope subject to site visit and space assessment.\nEquipment list finalized against AIM's mandatory ATL equipment checklist at the time of procurement.\nAnnual Maintenance & Program Support available separately on request.",
    closingText: "We look forward to partnering with Bharatheeya Vidya Nikethan Keralam in building a future-ready innovation ecosystem for your students. Please feel free to reach out for any clarification or to schedule a site visit.",
    signatoryName: "Mithlaj MT.",
    signatoryTitle: "Co-Founder & Chief Technology Officer",
    placeOfIssue: "Kozhikode, Kerala",
    showSeal: true,
    showSignature: true,
    showWatermark: true,
    logoSize: "md",
  },
  reference: {
    docType: "TO WHOMSOEVER IT MAY CONCERN",
    docSubtitle: "",
    refNo: "RV-REF-2026-112",
    date: "2026-07-22",
    recipientName: "To Whom It May Concern",
    recipientOrg: "",
    recipientAddress: "",
    subject: "Letter of Recommendation - Vidhya E. S.",
    bodyText: "It is my distinct pleasure to recommend Vidhya E. S. for any professional opportunity or academic pursuit she may choose to undertake. Vidhya worked as a Robotics & AI Engineering Intern at Robuverse LLP from March 15, 2026 to May 15, 2026.\n\nDuring her tenure, Vidhya worked on building vision-based sorting algorithms and ROS-based motion control profiles. She demonstrated excellent problem-solving abilities, clean code standards, and positive team dynamics. Her work on automated sorting was exceptionally innovative and directly contributed to our prototype's success.\n\nWe hold her in high regard and wish her the absolute best in her future endeavors. Please feel free to contact us for any further clarification regarding her contributions.",
    items: [],
    tableMode: "detailed",
    gstMode: "exclusive",
    taxRate: 0,
    paymentTerms: "",
    validityNotes: "",
    closingText: "",
    signatoryName: "Mithlaj P.",
    signatoryTitle: "Managing Partner, Robuverse. LLP",
    placeOfIssue: "Kozhikode, Kerala",
    showSeal: true,
    showSignature: true,
    showWatermark: true,
    logoSize: "md",
  },
  blank: {
    docType: "OFFICIAL CORRESPONDENCE",
    docSubtitle: "",
    refNo: "RV-MEM-2026-001",
    date: "2026-07-22",
    recipientName: "Team Members & Partners",
    recipientOrg: "Robuverse LLP",
    recipientAddress: "Kozhikode Office, Kerala",
    subject: "Official Corporate Letterhead Guidelines",
    bodyText: "This is an official communication template on Robuverse LLP letterhead. You can customize the fields in the left-hand panel to structure formal announcements, updates, internal reports, or notifications.\n\nMake sure to double-check the signatory info, toggle digital seal/signature settings as needed, and download the high-resolution PDF for official documentation.",
    items: [],
    tableMode: "detailed",
    gstMode: "exclusive",
    taxRate: 0,
    paymentTerms: "",
    validityNotes: "",
    closingText: "",
    signatoryName: "Nihal V.",
    signatoryTitle: "Managing Partner, Robuverse. LLP",
    placeOfIssue: "Kozhikode, Kerala",
    showSeal: true,
    showSignature: true,
    showWatermark: true,
    logoSize: "md",
  },
};

export default function LetterheadGenerator() {
  const [activePresetKey, setActivePresetKey] = useState<string>("quotation");
  const [formData, setFormData] = useState<LetterheadData>({ ...PRESETS.quotation });
  const [scale, setScale] = useState<number>(0.5);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const estimatePages = () => {
    if (activePresetKey === "quotation") {
      const itemCount = formData.items.length;
      const termsLength = (formData.paymentTerms || "").length + (formData.validityNotes || "").length;
      let score = itemCount * 15;
      score += (termsLength > 0 ? 55 : 0);
      score += (formData.bodyText || "").length / 10;
      if (score <= 130) return 1;
      if (score <= 320) return 2;
      if (score <= 520) return 3;
      return 4;
    } else {
      const charCount = (formData.bodyText || "").length + (formData.subject || "").length;
      if (charCount <= 1000) return 1;
      if (charCount <= 2600) return 2;
      return 3;
    }
  };

  const estPages = estimatePages();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScale(0.23);
      } else if (width < 1024) {
        setScale(0.32);
      } else if (width < 1280) {
        setScale(0.42);
      } else {
        setScale(0.5);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const loadPreset = (presetKey: string) => {
    setActivePresetKey(presetKey);
    setFormData({ ...PRESETS[presetKey] });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxAmount = Math.round((subtotal * formData.taxRate) / 100);
  const grandTotal = subtotal + taxAmount;

  const addQuotationItem = () => {
    const newItem: QuotationItem = {
      id: String(Date.now()),
      description: "",
      qty: 1,
      price: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeQuotationItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const editQuotationItem = (id: string, field: keyof QuotationItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          if (field === "qty") {
            return { ...item, qty: Math.max(0, parseInt(value) || 0) };
          }
          if (field === "price") {
            return { ...item, price: Math.max(0, parseFloat(value) || 0) };
          }
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  const generateRandomRef = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    const prefix = formData.docType.slice(0, 2).toUpperCase();
    setFormData((prev) => ({
      ...prev,
      refNo: `RV-${prefix}-${year}-${String(rand).padStart(3, "0")}`,
    }));
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("letterhead-download-root");
    if (!element) return;

    setIsDownloading(true);
    try {
      element.style.display = "block";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      element.style.display = "none";

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0.1) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      pdf.save(`${formData.docType.replace(/\s+/g, "_")}_${formData.refNo}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSignatoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "Mithlaj MT.") {
      setFormData((prev) => ({
        ...prev,
        signatoryName: "Mithlaj MT.",
        signatoryTitle: "Co-Founder & Chief Technology Officer",
      }));
    } else if (val === "Mithlaj P.") {
      setFormData((prev) => ({
        ...prev,
        signatoryName: "Mithlaj P.",
        signatoryTitle: "Managing Partner, Robuverse. LLP",
      }));
    } else if (val === "Nihal V.") {
      setFormData((prev) => ({
        ...prev,
        signatoryName: "Nihal V.",
        signatoryTitle: "Managing Partner, Robuverse. LLP",
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <FileSignature className="h-7 w-7 text-cyan-400" />
            <span>Official Letterhead & Quotation Builder</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build formal Robuverse LLP letterheads, proposal letters, and itemized quotations with live A4 preview.
          </p>
        </div>

        <div>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="no-print flex flex-col lg:flex-row gap-6 items-start">
        {/* Control Panel (Sidebar) */}
        <aside className="w-full lg:w-[420px] bg-white border border-slate-200/80 rounded-xl p-5 space-y-6 shadow-sm">
          {/* Preset buttons */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Load Layout Preset</h2>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => loadPreset("quotation")}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  activePresetKey === "quotation"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600"
                }`}
              >
                Quotation
              </button>
              <button
                onClick={() => loadPreset("reference")}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  activePresetKey === "reference"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600"
                }`}
              >
                Reference Letter
              </button>
              <button
                onClick={() => loadPreset("blank")}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  activePresetKey === "blank"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold"
                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-600"
                }`}
              >
                Blank Letterhead
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200/80"></div>

          {/* Form Content */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Document Meta</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Document Type</label>
                <input
                  type="text"
                  name="docType"
                  value={formData.docType}
                  onChange={handleChange}
                  placeholder="e.g. QUOTATION"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex justify-between items-center">
                  <span>Reference ID</span>
                  <button
                    type="button"
                    onClick={generateRandomRef}
                    className="text-[9px] text-cyan-400 hover:text-cyan-300 font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Gen
                  </button>
                </label>
                <input
                  type="text"
                  name="refNo"
                  value={formData.refNo}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Document Subtitle</label>
              <input
                type="text"
                name="docSubtitle"
                value={formData.docSubtitle}
                onChange={handleChange}
                placeholder="e.g. Atal Tinkering Lab Setup & Implementation"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Document Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
              />
            </div>

            <div className="h-px bg-slate-800"></div>

            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recipient Details</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Recipient Name</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Recipient Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Recipient Company</label>
                <input
                  type="text"
                  name="recipientOrg"
                  value={formData.recipientOrg}
                  onChange={handleChange}
                  placeholder="Recipient Company (Optional)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Recipient Address</label>
              <textarea
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleChange}
                placeholder="Full address of the recipient..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors resize-none"
              />
            </div>

            <div className="h-px bg-slate-800"></div>

            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Letter Content</h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject Line</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject of document"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Body Message (Double linebreaks for paragraphs)</label>
              <textarea
                name="bodyText"
                value={formData.bodyText}
                onChange={handleChange}
                placeholder="Enter letter contents or document overview text..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors resize-y min-h-[100px]"
              />
            </div>

            {/* Quotation Itemized pricing table editor */}
            {activePresetKey === "quotation" && (
              <>
                <div className="h-px bg-slate-800"></div>

                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pricing Line Items</h2>
                  <button
                    type="button"
                    onClick={addQuotationItem}
                    className="text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={item.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Item #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeQuotationItem(item.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 transition-colors font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => editQuotationItem(item.id, "description", e.target.value)}
                        placeholder="Item name / specifications"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => editQuotationItem(item.id, "qty", e.target.value)}
                            placeholder="Qty"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Unit Price (₹)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => editQuotationItem(item.id, "price", e.target.value)}
                            placeholder="Price"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.items.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                      No pricing items added. Click "+ Add Item" above.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Table Columns</label>
                      <select
                        name="tableMode"
                        value={formData.tableMode}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="simple">Simple (Desc & Amt)</option>
                        <option value="detailed">Detailed (Qty & Price)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">GST Display Mode</label>
                      <select
                        name="gstMode"
                        value={formData.gstMode}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="exclusive">Exclusive (Note only)</option>
                        <option value="inclusive">Inclusive (Note only)</option>
                        <option value="calculated">Show detailed rows</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">GST Tax Rate (%)</label>
                      <select
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="18">18% GST</option>
                        <option value="12">12% GST</option>
                        <option value="5">5% GST</option>
                        <option value="0">0% (Tax Exempt)</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end text-right pr-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Grand Total</span>
                      <span className="text-sm font-mono font-bold text-amber-400">₹ {grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePresetKey === "quotation" && (
              <>
                <div className="h-px bg-slate-800"></div>
                <div className="space-y-4">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Terms, Notes & Closing</h2>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Payment Terms (One bullet per line)</label>
                    <textarea
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                      placeholder="e.g. 50% advance on confirmation..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors resize-y font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Validity & Notes (One bullet per line)</label>
                    <textarea
                      name="validityNotes"
                      value={formData.validityNotes}
                      onChange={handleChange}
                      placeholder="e.g. Validity 60 days..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors resize-y font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Closing Letter Text</label>
                    <textarea
                      name="closingText"
                      value={formData.closingText}
                      onChange={handleChange}
                      placeholder="Closing salutation..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white transition-colors resize-y font-sans"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-slate-800"></div>

            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Signatory & Seal Settings</h2>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Signatory Profile</label>
                <select
                  onChange={handleSignatoryChange}
                  value={formData.signatoryName}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Mithlaj MT.">Mithlaj MT. (CTO)</option>
                  <option value="Mithlaj P.">Mithlaj P. (Managing Partner)</option>
                  <option value="Nihal V.">Nihal V. (Managing Partner)</option>
                  <option value="Custom">Custom Authority...</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Signatory Name</label>
                  <input
                    type="text"
                    name="signatoryName"
                    value={formData.signatoryName}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Signatory Title</label>
                  <input
                    type="text"
                    name="signatoryTitle"
                    value={formData.signatoryTitle}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800"></div>

            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Visual Toggles</h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-0.5">
                <label className="text-xs text-slate-400 cursor-pointer select-none" htmlFor="show-seal">
                  Render Official Stamp Seal
                </label>
                <input
                  id="show-seal"
                  type="checkbox"
                  name="showSeal"
                  checked={formData.showSeal}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 accent-cyan-500 rounded bg-slate-950 border-slate-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-0.5">
                <label className="text-xs text-slate-400 cursor-pointer select-none" htmlFor="show-signature">
                  Attach Authorized Signature
                </label>
                <input
                  id="show-signature"
                  type="checkbox"
                  name="showSignature"
                  checked={formData.showSignature}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 accent-cyan-500 rounded bg-slate-950 border-slate-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-0.5">
                <label className="text-xs text-slate-400 cursor-pointer select-none" htmlFor="show-watermark">
                  Render Background Watermark Logo
                </label>
                <input
                  id="show-watermark"
                  type="checkbox"
                  name="showWatermark"
                  checked={formData.showWatermark}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 accent-cyan-500 rounded bg-slate-950 border-slate-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-0.5">
                <label className="text-xs text-slate-400 cursor-pointer select-none" htmlFor="logo-size">
                  Header Logo Size
                </label>
                <select
                  id="logo-size"
                  name="logoSize"
                  value={formData.logoSize}
                  onChange={handleChange}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Live Canvas Preview Panel */}
        <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden min-h-[800px]">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.04),transparent_60%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

          {/* Zoom scale controller */}
          <div className="w-full flex items-center justify-between bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400 z-10 mb-6">
            <span className="font-semibold text-slate-300">Live A4 Print Preview</span>
            <div className="flex items-center gap-2">
              <span>Scale:</span>
              <button
                onClick={() => setScale(Math.max(0.15, scale - 0.05))}
                className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-mono text-white font-medium w-8 text-center">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(Math.min(1.2, scale + 0.05))}
                className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Stacks of pages scaled */}
          <div className="flex flex-col gap-6 items-center w-full">
            {Array.from({ length: estPages }).map((_, pageIdx) => (
              <div
                key={pageIdx}
                className="flex-shrink-0 transition-transform duration-150 ease-out origin-top border border-slate-800 shadow-2xl"
                style={{
                  transform: `scale(${scale})`,
                  width: "210mm",
                  height: "297mm",
                  marginBottom: `calc(297mm * (${scale} - 1))`,
                }}
              >
                <SinglePageLayout
                  formData={formData}
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  activePresetKey={activePresetKey}
                  pageIndex={pageIdx}
                  totalPages={estPages}
                />
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Hidden container for jsPDF capture */}
      <div
        id="letterhead-download-root"
        className="absolute top-[-9999px] left-[-9999px] flex flex-col gap-0"
        style={{
          width: "210mm",
          height: `${estPages * 297}mm`,
          display: "none",
        }}
      >
        {Array.from({ length: estPages }).map((_, pageIdx) => (
          <div
            key={pageIdx}
            style={{
              width: "210mm",
              height: "297mm",
            }}
          >
            <SinglePageLayout
              formData={formData}
              subtotal={subtotal}
              taxAmount={taxAmount}
              grandTotal={grandTotal}
              activePresetKey={activePresetKey}
              pageIndex={pageIdx}
              totalPages={estPages}
              isPrint={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const getPageItems = (items: QuotationItem[], pageIndex: number, totalPages: number): QuotationItem[] => {
  if (totalPages === 1) return items;
  if (pageIndex === 0) return items.slice(0, 8);
  if (pageIndex === 1) {
    return totalPages === 2 ? items.slice(8) : items.slice(8, 16);
  }
  if (pageIndex === 2) {
    return totalPages === 3 ? items.slice(16) : items.slice(16, 24);
  }
  return items.slice(24);
};

const getPageParagraphs = (bodyText: string, pageIndex: number, totalPages: number): string[] => {
  const paragraphs = (bodyText || "").split("\n\n");
  if (totalPages === 1) return paragraphs;

  const page1Paras: string[] = [];
  const page2Paras: string[] = [];
  const page3Paras: string[] = [];
  const page4Paras: string[] = [];

  let charAccum = 0;
  paragraphs.forEach((p) => {
    if (charAccum < 1000) {
      page1Paras.push(p);
      charAccum += p.length + 20;
    } else if (charAccum < 2500) {
      page2Paras.push(p);
      charAccum += p.length + 20;
    } else if (charAccum < 4000) {
      page3Paras.push(p);
      charAccum += p.length + 20;
    } else {
      page4Paras.push(p);
    }
  });

  if (pageIndex === 0) return page1Paras;
  if (pageIndex === 1) return page2Paras;
  if (pageIndex === 2) return page3Paras;
  return page4Paras;
};

interface SinglePageLayoutProps {
  formData: LetterheadData;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  activePresetKey: string;
  pageIndex: number;
  totalPages: number;
  isPrint?: boolean;
}

const SinglePageLayout: React.FC<SinglePageLayoutProps> = ({
  formData,
  subtotal,
  taxAmount,
  grandTotal,
  activePresetKey,
  pageIndex,
  totalPages,
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  const getLogoHeight = () => {
    if (formData.logoSize === "sm") return "14mm";
    if (formData.logoSize === "lg") return "24mm";
    return "18mm";
  };

  const pageItems = getPageItems(formData.items, pageIndex, totalPages);
  const pageParagraphs = getPageParagraphs(formData.bodyText, pageIndex, totalPages);
  const showHeader = pageIndex === 0;
  const showSignatures = pageIndex === totalPages - 1;
  const lastItem = formData.items[formData.items.length - 1];
  const isTableEndPage = !!(lastItem && pageItems.some((item) => item.id === lastItem.id));

  return (
    <div
      className="w-[210mm] h-[297mm] relative p-[18mm] flex flex-col justify-start overflow-hidden bg-white text-slate-800 font-sans"
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Background Watermark */}
      {formData.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] z-0">
          <img src="/assets/logo.png" alt="Watermark Logo" className="w-[110mm] h-auto object-contain max-h-[140mm] grayscale" />
        </div>
      )}

      {/* Header Geometric Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[3.5mm] flex">
        <div className="flex-1 bg-indigo-950"></div>
        <div className="w-[50mm] bg-[#b08f57]"></div>
      </div>

      {/* Continuation Header */}
      {!showHeader && (
        <div className="relative z-10 flex justify-between items-center border-b border-slate-100 pb-2 text-[9px] text-slate-400 font-mono tracking-wider mb-4 select-none">
          <span>Robuverse. LLP — {formData.docType}</span>
          <span>Ref: {formData.refNo} | Page {pageIndex + 1} of {totalPages}</span>
        </div>
      )}

      {/* Full Header */}
      {showHeader && (
        <header className="relative z-10 flex flex-col items-center border-b border-[#b08f57]/30 pb-4 mb-5">
          <div className="flex items-center gap-4 mb-2">
            <img
              src="/assets/logo.png"
              alt="Robuverse Logo"
              className="object-contain"
              style={{ height: getLogoHeight() }}
            />
            <div className="flex flex-col">
              <h1 className="font-cinzel text-[23px] font-bold tracking-[0.24em] text-indigo-950 leading-none">
                Robuverse. LLP
              </h1>
              <p className="text-[7.5px] font-semibold text-slate-400 uppercase tracking-[0.21em] mt-2">
                Robotics • AI • Automation • Software • IoT • 3D Printing
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Document Details Block */}
      {showHeader && (
        <section className="relative z-10 flex justify-between items-start mb-6">
          <div className="text-[10px] text-slate-600 space-y-1">
            <div className="font-mono">
              <span className="font-semibold uppercase tracking-wider text-slate-400">Ref:</span> {formData.refNo}
            </div>
            <div className="font-mono">
              <span className="font-semibold uppercase tracking-wider text-slate-400">Date:</span> {formatDate(formData.date)}
            </div>
          </div>

          <div className="text-right">
            <h2 className="font-cinzel text-[14px] font-extrabold tracking-widest text-indigo-950 border-b-2 border-indigo-950/20 pb-0.5 inline-block uppercase">
              {formData.docType}
            </h2>
            {formData.docSubtitle && (
              <div className="text-[8px] font-bold text-indigo-900 max-w-[80mm] mt-1 font-sans leading-normal uppercase tracking-wider">
                {formData.docSubtitle}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recipient Block */}
      {showHeader && (formData.recipientName || formData.recipientOrg || formData.recipientAddress) && (
        <section className="relative z-10 mb-5 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
          <div className="text-[10.5px] leading-relaxed text-slate-700">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">To:</span>
            {formData.recipientName && (
              <div className="font-bold text-slate-800 text-[11.5px] tracking-wide">{formData.recipientName}</div>
            )}
            {formData.recipientOrg && (
              <div className="font-semibold text-indigo-950 text-[10.5px]">{formData.recipientOrg}</div>
            )}
            {formData.recipientAddress && (
              <div className="whitespace-pre-line text-slate-600 mt-1 leading-[1.6] text-[10px]">
                {formData.recipientAddress}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Subject Line Block */}
      {showHeader && formData.subject && (
        <section className="relative z-10 mb-4">
          <h3 className="text-[11px] font-bold text-indigo-950 leading-relaxed flex gap-1">
            <span className="underline decoration-slate-300">SUBJECT:</span>
            <span>{formData.subject}</span>
          </h3>
        </section>
      )}

      {/* Letter Body Text */}
      {pageParagraphs.length > 0 && (
        <section className="relative z-10 text-[10.5px] leading-[1.7] text-slate-700 space-y-3 mb-6">
          {pageParagraphs.map((para, idx) => (
            <p key={idx} className="text-justify whitespace-pre-wrap">{para}</p>
          ))}
        </section>
      )}

      {/* Pricing / Quotation Line Items Table */}
      {activePresetKey === "quotation" && pageItems.length > 0 && (
        <section className="relative z-10 mb-5">
          <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                {formData.tableMode === "simple" ? (
                  <tr className="bg-indigo-950 text-white text-[9.5px] font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4 w-[80%]">Description</th>
                    <th className="py-2.5 px-4 w-[20%] text-right">Amount</th>
                  </tr>
                ) : (
                  <tr className="bg-indigo-950 text-white text-[9.5px] font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-[8%] text-center">#</th>
                    <th className="py-2.5 px-3 w-[55%]">Item & Description</th>
                    <th className="py-2.5 px-3 w-[10%] text-center">Qty</th>
                    <th className="py-2.5 px-3 w-[13%] text-right">Unit Price</th>
                    <th className="py-2.5 px-3 w-[14%] text-right">Amount</th>
                  </tr>
                )}
              </thead>
              <tbody className="text-[10px] text-slate-700 divide-y divide-slate-100">
                {pageItems.map((item, idx) => {
                  const globalIdx = pageIndex === 0
                    ? idx
                    : pageIndex === 1
                      ? 8 + idx
                      : pageIndex === 2
                        ? 16 + idx
                        : 24 + idx;

                  return formData.tableMode === "simple" ? (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-800 leading-normal">{item.description || "—"}</td>
                      <td className="py-2.5 px-4 text-right font-semibold font-mono text-slate-800">
                        ₹ {item.price.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ) : (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-medium font-mono">{globalIdx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 leading-normal">{item.description || "—"}</td>
                      <td className="py-2 px-3 text-center font-semibold font-mono">{item.qty}</td>
                      <td className="py-2 px-3 text-right font-mono">₹ {item.price.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-right font-semibold font-mono">
                        ₹ {(item.qty * item.price).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}

                {isTableEndPage && (
                  formData.tableMode === "simple" ? (
                    <>
                      <tr className="bg-slate-50/40 font-semibold text-slate-800">
                        <td className="py-2.5 px-4 text-right text-slate-500 text-[9.5px] uppercase">
                          {formData.gstMode === "calculated" ? "Subtotal" : "Total Amount"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[11px] border-t border-slate-200">
                          ₹ {subtotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                      {formData.gstMode === "calculated" && formData.taxRate > 0 && (
                        <>
                          <tr className="bg-slate-50/40">
                            <td className="py-2 px-4 text-right font-semibold text-slate-400 text-[9px] uppercase">
                              GST ({formData.taxRate}%)
                            </td>
                            <td className="py-2 px-4 text-right font-semibold font-mono text-slate-800">
                              ₹ {taxAmount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr className="bg-indigo-50/40 text-indigo-950 font-bold">
                            <td className="py-2.5 px-4 text-right text-[10px] uppercase">
                              Grand Total
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-[11.5px] border-t border-slate-200">
                              ₹ {grandTotal.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <tr className="bg-slate-50/40">
                        <td colSpan={3} className="border-t border-slate-200"></td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-400 text-[9px] border-t border-slate-200 uppercase">
                          Subtotal
                        </td>
                        <td className="py-2 px-3 text-right font-semibold font-mono text-slate-800 border-t border-slate-200">
                          ₹ {subtotal.toLocaleString("en-IN")}
                        </td>
                      </tr>

                      {formData.gstMode === "calculated" && formData.taxRate > 0 && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={3}></td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-400 text-[9px] uppercase">
                            GST ({formData.taxRate}%)
                          </td>
                          <td className="py-2 px-3 text-right font-semibold font-mono text-slate-800">
                            ₹ {taxAmount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      )}

                      <tr className="bg-indigo-50/40 text-indigo-950 font-bold">
                        <td colSpan={3} className="border-t border-slate-200"></td>
                        <td className="py-2.5 px-3 text-right text-[10px] uppercase border-t border-slate-200">
                          {formData.gstMode === "calculated" ? "Grand Total" : "Total Amount"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] border-t border-slate-200">
                          ₹ {(formData.gstMode === "calculated" ? grandTotal : subtotal).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </>
                  )
                )}
              </tbody>
            </table>
          </div>

          {isTableEndPage && formData.gstMode !== "calculated" && (
            <div className="text-[9px] text-slate-500 italic font-medium font-sans">
              Note: The above amount of ₹{subtotal.toLocaleString("en-IN")} is {formData.gstMode === "exclusive" ? "exclusive" : "inclusive"} of GST.
            </div>
          )}
        </section>
      )}

      {showSignatures && activePresetKey === "quotation" && (formData.paymentTerms || formData.validityNotes) && (
        <section className="relative z-10 grid grid-cols-2 gap-5 mb-5 text-[9px] leading-relaxed text-slate-600 font-sans">
          {formData.paymentTerms && (
            <div className="bg-slate-50/40 p-2.5 rounded-lg border border-slate-100">
              <h4 className="font-bold text-indigo-950 uppercase text-[8.5px] tracking-wider mb-1.5 border-b border-indigo-950/10 pb-0.5">
                Payment Terms
              </h4>
              <ul className="list-disc pl-3.5 space-y-0.5">
                {formData.paymentTerms.split("\n").filter(Boolean).map((line, idx) => (
                  <li key={idx} className="leading-normal">{line}</li>
                ))}
              </ul>
            </div>
          )}
          {formData.validityNotes && (
            <div className="bg-slate-50/40 p-2.5 rounded-lg border border-slate-100">
              <h4 className="font-bold text-indigo-950 uppercase text-[8.5px] tracking-wider mb-1.5 border-b border-indigo-950/10 pb-0.5">
                Validity & Notes
              </h4>
              <ul className="list-disc pl-3.5 space-y-0.5">
                {formData.validityNotes.split("\n").filter(Boolean).map((line, idx) => (
                  <li key={idx} className="leading-normal">{line}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {showSignatures && activePresetKey === "quotation" && formData.closingText && (
        <section className="relative z-10 text-[9.5px] leading-relaxed text-slate-600 italic font-sans mb-4 text-justify">
          {formData.closingText}
        </section>
      )}

      {showSignatures && (
        <section className="relative z-10 flex justify-between items-end mt-auto pt-4 mb-3">
          <div className="flex items-center select-none">
            {formData.showSeal && (
              <div className="relative w-[22mm] h-[22mm] flex items-center justify-center opacity-90">
                <img src="/assets/digital_seal.png" alt="Robuverse Seal" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-[9px] font-bold text-indigo-950 tracking-wider mb-1 select-none">
              For Robuverse LLP
            </div>
            <div className="h-[12mm] flex items-end justify-center relative">
              {formData.showSignature && (
                <>
                  {formData.signatoryName && formData.signatoryName.toLowerCase().includes("mithlaj mt") ? (
                    <img
                      src="/assets/mithlaj_sign.png"
                      alt="Signature"
                      className="h-[16mm] w-auto object-contain select-none -mb-1"
                    />
                  ) : formData.signatoryName && formData.signatoryName.toLowerCase().includes("nihal") ? (
                    <img
                      src="/assets/nihal_sign.png"
                      alt="Signature"
                      className="h-[16mm] w-auto object-contain select-none -mb-1"
                    />
                  ) : (
                    <span className="font-serif text-2xl text-indigo-950 select-none pb-0.5 italic">
                      {formData.signatoryName ? formData.signatoryName.split(" ")[0] : ""}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="w-[45mm] h-[1px] bg-slate-200 mx-auto my-1.5"></div>
            <div className="text-[9px] font-semibold text-slate-400 tracking-wide uppercase">
              Authorized Signatory
            </div>
            <div className="text-[8px] font-bold text-indigo-950 mt-0.5">
              {formData.signatoryName}
            </div>
          </div>
        </section>
      )}

      <footer className="relative z-10 border-t border-[#b08f57]/30 pt-3 flex flex-col items-center text-center mt-auto">
        <div className="text-[7.5px] text-slate-400 font-medium flex items-center justify-center gap-1.5 leading-none">
          <span>Near NIT Calicut, Kozhikode, Kerala - 673601, India</span>
          <span>•</span>
          <span>www.robuverse.com</span>
          <span>•</span>
          <span>robuverselab@gmail.com</span>
        </div>
        <div className="text-[6.5px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
          LLPIN: ACZ-1342
        </div>
      </footer>
    </div>
  );
};
