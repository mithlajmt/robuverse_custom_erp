"use client";

import React, { useState, useEffect } from "react";
import { BusinessDocument, Client, Product, CompanySettings, DocType, DocumentItem } from "@/types/document";
import { DocumentStorageService, calculateDocumentTotals } from "@/lib/storage/documentStorage";
import { formatCurrency } from "@/lib/utils/currency";
import { saveDocumentAction, getNextDocNumberAction } from "@/lib/actions/documents";

interface DocumentFormProps {
  initialDocument?: Partial<BusinessDocument>;
  settings: CompanySettings;
  onSaveSuccess: (doc: BusinessDocument) => void;
  onPreviewUpdate: (doc: BusinessDocument) => void;
}

function buildInitialDoc(initialDocument?: Partial<BusinessDocument>, settings?: CompanySettings): BusinessDocument {
  const defaultType: DocType = (initialDocument?.docType as DocType) || "TAX_INVOICE";
  const defaultIsGst = initialDocument?.isGstBill !== undefined ? initialDocument.isGstBill : (defaultType !== "NON_GST_INVOICE");
  const refNum = initialDocument?.docNumber || (defaultIsGst ? "RBV/INV/2026/201" : "RBV/BILL/2026/101");
  
  const initialItems = initialDocument?.items && initialDocument.items.length > 0 ? initialDocument.items : [
    {
      id: "item_1",
      description: "Teacher Skill Development Program (AI & Robotics)",
      sacCode: "999293",
      qty: 3,
      unit: "Days",
      price: 0,
      discountPercent: 0,
      amount: 0,
    },
  ];

  const initialTaxRate = initialDocument?.taxRate !== undefined ? Number(initialDocument.taxRate) : (defaultIsGst ? 18 : 0);
  const initialCustomSubtotal = initialDocument?.customSubtotal;

  const initialTotals = calculateDocumentTotals(
    initialItems,
    initialTaxRate,
    initialDocument?.gstMode || "calculated",
    initialDocument?.gstType || "intrastate",
    initialDocument?.showGstDetails || (defaultIsGst ? "show" : "hide"),
    initialDocument?.totalDisplayMode || (defaultIsGst ? "full_breakdown" : "no_tax_grand_total"),
    initialCustomSubtotal
  );

  return {
    id: initialDocument?.id || "",
    docType: defaultType,
    isGstBill: defaultIsGst,
    docSubtitle: initialDocument?.docSubtitle !== undefined ? initialDocument.docSubtitle : (defaultIsGst ? "OFFICIAL GST TAX INVOICE" : "OFFICIAL BILL OF SUPPLY - NON-GST"),
    docNumber: refNum,
    date: initialDocument?.date || new Date().toISOString().split("T")[0],
    dueDate: initialDocument?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    refNo: initialDocument?.refNo || refNum,
    piReference: initialDocument?.piReference || "",
    placeOfSupply: initialDocument?.placeOfSupply || "Kerala (State Code: 32)",
    leadId: initialDocument?.leadId,
    leadNumber: initialDocument?.leadNumber,
    recipientName: initialDocument?.recipientName || "",
    recipientOrg: initialDocument?.recipientOrg || "",
    recipientAddress: initialDocument?.recipientAddress || "",
    recipientGstin: initialDocument?.recipientGstin || "",
    subject: initialDocument?.subject !== undefined ? initialDocument.subject : (defaultType === "QUOTATION" ? "Commercial Proposal & Quote for Robotics Setup" : defaultType === "PROFORMA" ? "Proforma Invoice for 50% Advance Booking Deposit" : defaultIsGst ? "Final GST Tax Invoice" : "Bill of Supply / Non-GST Invoice"),
    bodyText: initialDocument?.bodyText !== undefined ? initialDocument.bodyText : (defaultType === "QUOTATION" ? "We are pleased to submit our official commercial quotation for your review." : defaultType === "PROFORMA" ? "Thank you for confirming your booking. Please find below our Proforma Invoice towards the 50% advance payment required upon booking confirmation." : "Official GST Tax Invoice for equipment deployment and technical services rendered."),
    items: initialItems,
    tableMode: initialDocument?.tableMode || "tax_invoice",
    qtyColumnLabel: initialDocument?.qtyColumnLabel || "DAYS",
    colHeaderItem: initialDocument?.colHeaderItem || "ITEM & DESCRIPTION",
    colHeaderSac: initialDocument?.colHeaderSac || "SAC CODE",
    colHeaderQty: initialDocument?.colHeaderQty || initialDocument?.qtyColumnLabel || "QTY",
    colHeaderRate: initialDocument?.colHeaderRate || "RATE (₹)",
    colHeaderAmount: initialDocument?.colHeaderAmount || "AMOUNT",
    showSacCode: initialDocument?.showSacCode !== undefined ? initialDocument.showSacCode : true,
    showQtyColumn: initialDocument?.showQtyColumn !== undefined ? initialDocument.showQtyColumn : true,
    showRateColumn: initialDocument?.showRateColumn !== undefined ? initialDocument.showRateColumn : false,
    showRowAmounts: initialDocument?.showRowAmounts !== undefined ? initialDocument.showRowAmounts : true,
    totalDisplayMode: initialDocument?.totalDisplayMode || (defaultIsGst ? "full_breakdown" : "no_tax_grand_total"),
    showGstDetails: initialDocument?.showGstDetails || (defaultIsGst ? "show" : "hide"),
    gstMode: initialDocument?.gstMode || "calculated",
    gstType: initialDocument?.gstType || "intrastate",
    taxRate: initialTaxRate,
    customSubtotal: initialCustomSubtotal,
    advancePercent: initialDocument?.advancePercent,
    totalContractValue: initialDocument?.totalContractValue,
    ...initialTotals,
    advanceReceived: initialDocument?.advanceReceived || 0,
    balanceDue: initialDocument?.balanceDue || 0,
    paymentTerms: initialDocument?.paymentTerms !== undefined ? initialDocument.paymentTerms : (defaultType === "QUOTATION"
      ? ". 50% advance on confirmation of purchase order\n. 50% upon delivery, installation & final commissioning"
      : defaultType === "PROFORMA"
      ? ". 50% advance booking deposit upon confirmation\n. 50% balance before dispatch & deployment"
      : ". Full settlement as per contract agreement terms"),
    validityNotes: initialDocument?.validityNotes !== undefined ? initialDocument.validityNotes : (defaultType === "QUOTATION"
      ? ". Quote Validity: 30 days from date of issue.\n. Delivery & Deployment: Within 7 to 10 working days upon order confirmation.\n. Taxes & Statutory: GST @ 18% extra as applicable.\n. Warranty & Technical Support: 1 Year comprehensive technical coverage included."
      : defaultType === "PROFORMA"
      ? ". Proforma Invoice issued against confirmed booking order.\n. Advance payment locks in equipment reservation & engineer scheduling.\n. Statutory Tax Invoice will be issued upon delivery/service execution."
      : defaultIsGst
      ? ". Official Statutory Tax Invoice under Section 31 of CGST Act 2017 & Rule 46 of CGST Rules.\n. Place of Supply: Kerala (State Code: 32) | Intra-state Supply (CGST 9% + SGST 9%)"
      : ". Official Non-GST Bill of Supply / Cash Memo."),
    signatoryName: initialDocument?.signatoryName || settings?.signatories[0]?.name || "Mithlaj MT.",
    signatoryTitle: initialDocument?.signatoryTitle || settings?.signatories[0]?.title || "Co-Founder & CTO",
    showSeal: initialDocument?.showSeal !== undefined ? initialDocument.showSeal : true,
    showSignature: initialDocument?.showSignature !== undefined ? initialDocument.showSignature : true,
    showWatermark: initialDocument?.showWatermark !== undefined ? initialDocument.showWatermark : true,
    showRecipientSection: initialDocument?.showRecipientSection !== undefined ? initialDocument.showRecipientSection : true,
    showCompanyGst: initialDocument?.showCompanyGst !== undefined ? initialDocument.showCompanyGst : defaultIsGst,
    showBankDetails: initialDocument?.showBankDetails !== undefined ? initialDocument.showBankDetails : (defaultType !== "QUOTATION"),
    showBankTransferNote: initialDocument?.showBankTransferNote !== undefined ? initialDocument.showBankTransferNote : true,
    bankAccountId: initialDocument?.bankAccountId || settings?.bankAccounts[0]?.id || "bank_federal_nihal",
    bankAccountNote: initialDocument?.bankAccountNote,
    showTerms: initialDocument?.showTerms !== undefined ? initialDocument.showTerms : true,
    showValidity: initialDocument?.showValidity !== undefined ? initialDocument.showValidity : true,
    showFooter: initialDocument?.showFooter !== undefined ? initialDocument.showFooter : true,
    status: initialDocument?.status || "ISSUED",
    createdAt: initialDocument?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function DocumentForm({ initialDocument, settings, onSaveSuccess, onPreviewUpdate }: DocumentFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSaving, setIsSaving] = useState(false);

  const [doc, setDoc] = useState<BusinessDocument>(() => buildInitialDoc(initialDocument, settings));

  useEffect(() => {
    if (initialDocument) {
      setDoc(buildInitialDoc(initialDocument, settings));
    }
  }, [initialDocument, settings]);

  useEffect(() => {
    setClients(DocumentStorageService.getClients());
    setProducts(DocumentStorageService.getProducts());
  }, []);

  useEffect(() => {
    onPreviewUpdate(doc);
  }, [doc, onPreviewUpdate]);

  const handleGstToggle = async (isGst: boolean) => {
    const newType = isGst ? (doc.docType === "NON_GST_INVOICE" ? "TAX_INVOICE" : doc.docType) : (doc.docType === "TAX_INVOICE" ? "NON_GST_INVOICE" : doc.docType);
    const newRef = await getNextDocNumberAction(newType, isGst);
    
    const newTaxRate = isGst ? 18 : 0;
    const totals = calculateDocumentTotals(
      doc.items,
      newTaxRate,
      doc.gstMode,
      doc.gstType,
      isGst ? "show" : "hide",
      isGst ? "full_breakdown" : "no_tax_grand_total"
    );

    setDoc((prev) => ({
      ...prev,
      isGstBill: isGst,
      docType: newType,
      docNumber: newRef,
      refNo: newRef,
      taxRate: newTaxRate,
      showCompanyGst: isGst,
      docSubtitle: isGst
        ? (newType === "TAX_INVOICE" ? "OFFICIAL GST TAX INVOICE - ROBOTICS EXPO SHOWCASE" : prev.docSubtitle)
        : "OFFICIAL BILL OF SUPPLY - NON-GST",
      validityNotes: isGst
        ? ". Official Statutory Tax Invoice under Section 31 of CGST Act 2017 & Rule 46 of CGST Rules.\n. Supplier GSTIN: 32ABOFR0193C1ZE\n. Place of Supply: Kerala (State Code: 32) | Intra-state Supply (CGST 9% + SGST 9%)\n. SAC Code: 997319 (Renting/leasing of robots and other machinery/equipment)"
        : ". Official Non-GST Bill of Supply / Cash Memo.\n. Includes dedicated robotics engineers, on-site setup, and live demonstrations.",
      ...totals,
    }));
  };

  const handleDocTypeChange = async (type: DocType) => {
    const isGst = type !== "NON_GST_INVOICE" && doc.isGstBill !== false;
    const newRef = await getNextDocNumberAction(type, isGst);
    
    const subtitleMap: Record<DocType, string> = {
      QUOTATION: "OFFICIAL COMMERCIAL QUOTATION",
      PROFORMA: "PROFORMA INVOICE FOR PAYMENT ADVANCE",
      TAX_INVOICE: "OFFICIAL GST TAX INVOICE - ROBOTICS EXPO SHOWCASE",
      NON_GST_INVOICE: "OFFICIAL BILL OF SUPPLY - NON-GST",
      LETTERHEAD: "OFFICIAL COMPANY CORRESPONDENCE",
      CERTIFICATE: "COMPLETION CERTIFICATE",
    };

    const subjectMap: Record<DocType, string> = {
      QUOTATION: "Commercial Proposal & Quote for Robotics Setup",
      PROFORMA: "Proforma Invoice for 50% Advance Booking Deposit",
      TAX_INVOICE: "Final Tax Invoice for Unitree G1 Robotics Showcase & Demonstration",
      NON_GST_INVOICE: "Bill of Supply / Non-GST Invoice for Robotics Equipment & Services",
      LETTERHEAD: "Official Company Notice & Announcement",
      CERTIFICATE: "Certificate of Completion",
    };

    const defaultBodyMap: Record<DocType, string> = {
      QUOTATION: "We are pleased to submit our official commercial quotation for your review.",
      PROFORMA: "Thank you for confirming your booking. Please find below our Proforma Invoice towards the 50% advance payment required upon booking confirmation.",
      TAX_INVOICE: "Official GST Tax Invoice for deployment, live showcase, and technical operation of Unitree G1 robotics systems. Issued against confirmed purchase order.",
      NON_GST_INVOICE: "Official non-tax bill of supply for equipment deployment and technical services rendered.",
      LETTERHEAD: "Please find below our official company announcement and technical notice.",
      CERTIFICATE: "This is to certify the completion of practical training and workshop requirements.",
    };

    const paymentTermsMap: Record<DocType, string> = {
      QUOTATION: ". 50% advance on confirmation of purchase order\n. 50% upon delivery, installation & final commissioning",
      PROFORMA: ". 50% advance booking deposit payable upon confirmation\n. 50% balance before dispatch & deployment",
      TAX_INVOICE: ". Full settlement as per contract agreement terms",
      NON_GST_INVOICE: ". Full settlement upon receipt / delivery",
      LETTERHEAD: "",
      CERTIFICATE: "",
    };

    const validityNotesMap: Record<DocType, string> = {
      QUOTATION: ". Quote Validity: 30 days from date of issue.\n. Delivery & Deployment: Within 7 to 10 working days upon order confirmation.\n. Taxes & Statutory: GST @ 18% extra as applicable.\n. Warranty & Technical Support: 1 Year comprehensive technical coverage included.",
      PROFORMA: ". Proforma Invoice issued against confirmed booking order.\n. Advance payment locks in equipment reservation & engineer scheduling.\n. Statutory Tax Invoice will be issued upon delivery/service execution.",
      TAX_INVOICE: isGst
        ? ". Official Statutory Tax Invoice under Section 31 of CGST Act 2017 & Rule 46 of CGST Rules.\n. Supplier GSTIN: 32ABOFR0193C1ZE\n. Place of Supply: Kerala (State Code: 32) | Intra-state Supply (CGST 9% + SGST 9%)\n. SAC Code: 997319 (Renting/leasing of robots and other machinery/equipment)"
        : ". Official Non-GST Bill of Supply / Cash Memo.\n. Includes dedicated robotics engineers, on-site setup, and live demonstrations.",
      NON_GST_INVOICE: ". Official Non-GST Bill of Supply / Cash Memo.\n. Includes dedicated robotics engineers, on-site setup, and live demonstrations.",
      LETTERHEAD: "",
      CERTIFICATE: "",
    };

    setDoc((prev) => ({
      ...prev,
      docType: type,
      isGstBill: isGst,
      docSubtitle: subtitleMap[type] || prev.docSubtitle,
      subject: subjectMap[type] || prev.subject,
      bodyText: defaultBodyMap[type] || prev.bodyText,
      paymentTerms: paymentTermsMap[type] !== undefined ? paymentTermsMap[type] : prev.paymentTerms,
      validityNotes: validityNotesMap[type] !== undefined ? validityNotesMap[type] : prev.validityNotes,
      docNumber: newRef,
      refNo: newRef,
      piReference: type === "QUOTATION" || type === "NON_GST_INVOICE" ? "" : prev.piReference,
      showBankDetails: type === "QUOTATION" ? false : true,
    }));
  };

  const handleClientSelect = (clientId: string) => {
    const selected = clients.find((c) => c.id === clientId);
    if (!selected) return;
    setDoc((prev) => ({
      ...prev,
      recipientName: selected.name,
      recipientOrg: selected.orgName,
      recipientAddress: selected.address,
      recipientGstin: selected.gstin || "",
    }));
  };

  const updateItemsAndTotals = (
    newItems: DocumentItem[],
    newGstType = doc.gstType,
    newTaxRate = doc.taxRate,
    newShowGstDetails = doc.showGstDetails,
    newTotalDisplayMode = doc.totalDisplayMode,
    newCustomSubtotal = doc.customSubtotal
  ) => {
    const totals = calculateDocumentTotals(
      newItems,
      newTaxRate,
      doc.gstMode,
      newGstType,
      newShowGstDetails,
      newTotalDisplayMode,
      newCustomSubtotal
    );
    setDoc((prev) => ({
      ...prev,
      items: newItems,
      gstType: newGstType,
      taxRate: newTaxRate,
      showGstDetails: newShowGstDetails,
      totalDisplayMode: newTotalDisplayMode,
      customSubtotal: newCustomSubtotal,
      ...totals,
    }));
  };

  const handleApplyAdvancePercentage = (percent: number) => {
    const p = Math.max(1, Math.min(100, percent));
    const orgName = doc.recipientOrg || "BOOKING CONFIRMATION";
    const currentTotal = doc.totalContractValue || (doc.advancePercent && doc.advancePercent > 0 ? Math.round(doc.grandTotal / (doc.advancePercent / 100)) : Math.round(doc.grandTotal * 2));

    setDoc((prev) => ({
      ...prev,
      advancePercent: p,
      totalContractValue: currentTotal > 0 ? currentTotal : prev.totalContractValue,
      docSubtitle: `${p}% ADVANCE PAYMENT - ${orgName.toUpperCase()}`,
      bodyText: `Thank you for confirming your booking. Please find below our Proforma Invoice towards the ${p}% advance payment required upon booking confirmation to schedule equipment deployment and technical staff.`,
    }));
  };

  const handleSplitItemsToAdvance = (targetPercent: number = 50) => {
    const factor = targetPercent / 100;
    const proposalTotal = doc.totalContractValue || Math.round(doc.grandTotal);

    const scaledItems = doc.items.map((item) => {
      const scaledPrice = Math.round(item.price * factor);
      const scaledAmount = Math.round(item.amount * factor);
      const cleanDesc = item.description.replace(/^\d+%\s*Advance:?\s*/i, "");
      return {
        ...item,
        description: `${targetPercent}% Advance: ${cleanDesc}`,
        price: scaledPrice,
        amount: scaledAmount,
      };
    });

    const totals = calculateDocumentTotals(
      scaledItems,
      doc.taxRate,
      doc.gstMode,
      doc.gstType,
      doc.showGstDetails,
      doc.totalDisplayMode
    );

    const orgName = doc.recipientOrg || "BOOKING CONFIRMATION";

    setDoc((prev) => ({
      ...prev,
      items: scaledItems,
      totalContractValue: proposalTotal,
      advancePercent: targetPercent,
      docSubtitle: `${targetPercent}% ADVANCE PAYMENT - ${orgName.toUpperCase()}`,
      bodyText: `Thank you for confirming your booking. Please find below our Proforma Invoice towards the ${targetPercent}% advance payment required upon booking confirmation to schedule equipment deployment and technical staff.`,
      ...totals,
    }));
  };

  const handleAddItem = () => {
    const newItem: DocumentItem = {
      id: `item_${Date.now()}`,
      description: "Robotics Engineering & Technical Support",
      sacCode: "998313",
      qty: 1,
      unit: "Days",
      price: 10000,
      discountPercent: 0,
      amount: 10000,
    };
    updateItemsAndTotals([...doc.items, newItem]);
  };

  const handleSelectProductCatalog = (index: number, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const updated = [...doc.items];
    updated[index] = {
      ...updated[index],
      description: p.title,
      sacCode: p.sacCode || "998313",
      price: p.defaultPrice,
      unit: p.unit || "Days",
      amount: p.defaultPrice * updated[index].qty,
    };
    updateItemsAndTotals(updated);
  };

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const updated = [...doc.items];
    const item = { ...updated[index], [field]: value };

    if (field === "qty" || field === "price" || field === "discountPercent") {
      const q = field === "qty" ? parseFloat(value) || 0 : item.qty;
      const p = field === "price" ? parseFloat(value) || 0 : item.price;
      const d = field === "discountPercent" ? parseFloat(value) || 0 : item.discountPercent || 0;
      const gross = q * p;
      item.amount = gross - gross * (d / 100);
    }

    updated[index] = item;
    updateItemsAndTotals(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (doc.items.length <= 1) return;
    updateItemsAndTotals(doc.items.filter((_, i) => i !== index));
  };

  const handleLoadSampleInvoice = () => {
    const sampleDoc: BusinessDocument = {
      id: "",
      docType: "TAX_INVOICE",
      isGstBill: true,
      docSubtitle: "OFFICIAL GST TAX INVOICE - ROBOTICS EXPO SHOWCASE",
      docNumber: "RBV/INV/2026/201",
      date: "2026-09-14",
      dueDate: "2026-09-21",
      refNo: "RBV/INV/2026/201",
      piReference: "Settled against Proforma Invoices: RBV/PI/2026/170 & RBV/PI/2026/170-B",
      placeOfSupply: "Kerala (State Code: 32)",
      recipientName: "",
      recipientOrg: "CONFEDERATION OF RENEWABLE ENERGY",
      recipientAddress: "1st Floor, Building No. 5/211, City Palace Building\nEloor Road, Opp. Jothir Bhavan, North Kalamassery\nKalamassery, Ernakulam, Kerala - 683104",
      recipientGstin: "32AAEAC6254D1Z7",
      subject: "Final Tax Invoice for Unitree G1 Robotics Showcase & Demonstration (3-Day Expo)",
      bodyText: "Official GST Tax Invoice for deployment, live showcase, and technical operation of Unitree G1 robotics systems for 3-day expo/event. Issued against Proforma Invoice Ref: RBV/PI/2026/170 (50% Advance) & Ref: RBV/PI/2026/170-B (50% Balance).",
      items: [
        {
          id: "item_sample_1",
          description: "Unitree G1 Live Showcase & Demonstration (3-Day Expo Complete Package)",
          sacCode: "997319",
          qty: 3,
          unit: "Days",
          price: 53333.3333,
          discountPercent: 0,
          amount: 160000,
        },
      ],
      tableMode: "tax_invoice",
      colHeaderItem: "ITEM & SERVICE DESCRIPTION",
      colHeaderSac: "SAC CODE",
      colHeaderQty: "DAYS",
      colHeaderAmount: "TAXABLE VALUE",
      showSacCode: true,
      showQtyColumn: true,
      qtyColumnLabel: "DAYS",
      gstMode: "calculated",
      gstType: "intrastate",
      taxRate: 18,
      subtotal: 160000,
      discountTotal: 0,
      taxAmount: 28800,
      cgstAmount: 14400,
      sgstAmount: 14400,
      igstAmount: 0,
      grandTotal: 188800,
      amountInWords: "Rupees One Lakh Eighty-Eight Thousand Eight Hundred Only",
      advanceReceived: 94400,
      balanceDue: 94400,
      validityNotes: ". Official Statutory Tax Invoice under Section 31 of CGST Act 2017 & Rule 46 of CGST Rules.\n. Supplier GSTIN: 32ABOFR0193C1ZE | Recipient GSTIN: 32AAEAC6254D1Z7\n. Place of Supply: Kerala (State Code: 32) | Intra-state Supply (CGST 9% + SGST 9%)\n. SAC Code: 997319 (Renting/leasing of robots and other machinery/equipment (without operator))\n. Includes dedicated robotics engineers, on-site setup, and live demonstrations for 3 days.",
      signatoryName: settings.signatories[0]?.name || "Mithlaj MT.",
      signatoryTitle: settings.signatories[0]?.title || "Co-Founder & CTO",
      showSeal: true,
      showSignature: true,
      showWatermark: true,
      showRecipientSection: true,
      showCompanyGst: true,
      bankAccountId: settings.bankAccounts[0]?.id || "bank_federal_nihal",
      status: "ISSUED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDoc(sampleDoc);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveDocumentAction(doc);
      if (res.success && res.document) {
        DocumentStorageService.saveDocument(doc);
        onSaveSuccess(res.document);
      } else {
        const saved = DocumentStorageService.saveDocument(doc);
        onSaveSuccess(saved);
      }
    } catch (err) {
      console.error("Save error:", err);
      const saved = DocumentStorageService.saveDocument(doc);
      onSaveSuccess(saved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Sample Invoice Banner Button */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-900 via-indigo-850 to-blue-900 text-white rounded-2xl shadow-md border border-indigo-700/50">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-base">💎</span>
          <div>
            <span className="font-extrabold text-amber-300">Preset Sample Invoice:</span>{" "}
            <span className="text-slate-200">CONFEDERATION OF RENEWABLE ENERGY (RBV/INV/2026/201)</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLoadSampleInvoice}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
        >
          ⚡ Load Shared Invoice
        </button>
      </div>
      {/* Step Indicator Tabs */}
      <div className="grid grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {[
          { step: 1, label: "1. Type & Ref", icon: "📑" },
          { step: 2, label: "2. Client & Org", icon: "🏢" },
          { step: 3, label: "3. Items & Tax", icon: "📦" },
          { step: 4, label: "4. Auth & Bank", icon: "🏦" },
        ].map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setActiveStep(s.step as any)}
            className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStep === s.step
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: Document Type & Reference Details */}
      {activeStep === 1 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 animate-fade-in">
          {/* GST vs NON-GST BILL TOGGLE CARD */}
          <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-blue-50/80 border border-indigo-200/80 rounded-2xl space-y-2 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️</span> Tax Billing Mode
                </h4>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {doc.isGstBill !== false
                    ? "GST Tax Invoice: Includes 18% GST breakdown, HSN/SAC codes, Supplier & Recipient GSTIN."
                    : "Non-GST Bill of Supply / Cash Memo: Hides tax calculations & GSTIN requirements."}
                </p>
              </div>

              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => handleGstToggle(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    doc.isGstBill !== false
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏢 GST Tax Bill
                </button>
                <button
                  type="button"
                  onClick={() => handleGstToggle(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    doc.isGstBill === false
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📄 Non-GST Bill
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <span>📑</span> Select Document Type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "TAX_INVOICE", label: "GST Tax Invoice (Ref 201+)", desc: "Official GST tax invoice (RBV/INV/2026/201)" },
                { type: "NON_GST_INVOICE", label: "Non-GST Bill (Ref 101+)", desc: "Official Non-GST bill of supply (RBV/BILL/2026/101)" },
                { type: "PROFORMA", label: "Proforma Invoice (Ref 170+)", desc: "Advance deposit PI (RBV/PI/2026/170)" },
                { type: "QUOTATION", label: "Commercial Quotation", desc: "Official commercial proposal (RBV/QTN/2026/101)" },
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => handleDocTypeChange(t.type as DocType)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    doc.docType === t.type
                      ? "bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-extrabold text-xs text-slate-900">{t.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Doc Ref Number *</label>
              <input
                type="text"
                required
                value={doc.docNumber}
                onChange={(e) => setDoc({ ...doc, docNumber: e.target.value, refNo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-indigo-700 font-extrabold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Issue Date *</label>
              <input
                type="date"
                required
                value={doc.date}
                onChange={(e) => setDoc({ ...doc, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Valid Until / Due Date</label>
              <input
                type="date"
                value={doc.dueDate || ""}
                onChange={(e) => setDoc({ ...doc, dueDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-bold">Document Subtitle / Banner Text</label>
              <input
                type="text"
                placeholder="e.g. 50% ADVANCE PAYMENT - ROBOTICS EXPO SHOWCASE"
                value={doc.docSubtitle || ""}
                onChange={(e) => setDoc({ ...doc, docSubtitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-bold">Against PI Ref / Linked Ref (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank for new Quotations / Invoices"
                value={doc.piReference || ""}
                onChange={(e) => setDoc({ ...doc, piReference: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Dynamic Advance Payment % Tool for Proforma Invoices */}
          {doc.docType === "PROFORMA" && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <span className="text-base">⚡</span> Proforma Advance % & Total Value Tool
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">Quick Presets:</span>
                  {[25, 30, 50, 70, 100].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleApplyAdvancePercentage(p)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        doc.advancePercent === p
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                          : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100"
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
                    Advance Percentage (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={doc.advancePercent || 50}
                      onChange={(e) => setDoc({ ...doc, advancePercent: parseFloat(e.target.value) || 50 })}
                      className="w-20 bg-white border border-slate-200/80 rounded-lg p-2 font-mono font-bold text-indigo-700 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyAdvancePercentage(doc.advancePercent || 50)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-extrabold border border-indigo-500 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                    >
                      Apply {doc.advancePercent || 50}% Advance
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
                    Total Proposal / Contract Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 118000 (Optional full project value)"
                    value={doc.totalContractValue || ""}
                    onChange={(e) => setDoc({ ...doc, totalContractValue: parseFloat(e.target.value) || undefined })}
                    className="w-full bg-white border border-slate-200/80 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Shows: "Total Proposal Value: ₹{doc.totalContractValue ? doc.totalContractValue.toLocaleString("en-IN") : "---"}. Issued for {doc.advancePercent || 50}% Advance."
                  </div>
                </div>
              </div>

              {/* 1-Click Math Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSplitItemsToAdvance(doc.advancePercent || 50)}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  title="Cut current item amounts in half (e.g. ₹25,000 → ₹12,500) and set proposal value to ₹25,000"
                >
                  ⚡ Split Item Prices to {doc.advancePercent || 50}% (e.g. ₹25k → ₹12.5k)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDoc((prev) => ({
                      ...prev,
                      totalContractValue: Math.round(prev.grandTotal * 2),
                    }))
                  }
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-800 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  title="Keep current PI at ₹25,000 and mark full proposal as 2x (₹50,000)"
                >
                  ⚡ Set Proposal Value to 2x (PI ₹25k → Proposal ₹50k)
                </button>
              </div>
            </div>
          )}

          {/* Header Display Toggles in Step 1 */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🏢</span>
              <div>
                <div className="text-xs font-bold text-slate-900">Company Header GSTIN</div>
                <div className="text-[10px] text-slate-500">Display GSTIN (32ABOFR0193C1ZE) in top header reference block</div>
              </div>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
              <input
                type="checkbox"
                checked={doc.showCompanyGst !== false}
                onChange={(e) => setDoc({ ...doc, showCompanyGst: e.target.checked })}
                className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-indigo-600">Show GSTIN in Header</span>
            </label>
          </div>

          <div className="text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 font-bold">
                ✍️ Opening Note / Preamble Paragraph (Fully Editable)
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {doc.docType === "QUOTATION" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setDoc((prev) => ({
                          ...prev,
                          bodyText:
                            "We are pleased to submit our official commercial quotation for your review.",
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                        doc.bodyText === "We are pleased to submit our official commercial quotation for your review."
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      Quotation Intro
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDoc((prev) => ({
                          ...prev,
                          bodyText:
                            "Thank you for your interest in Robuverse. LLP. Please find below our official commercial proposal and quotation for your review and approval.",
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                        doc.bodyText?.includes("commercial proposal and quotation")
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      Proposal & Quote
                    </button>
                  </>
                )}

                {doc.docType === "PROFORMA" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setDoc((prev) => ({
                          ...prev,
                          bodyText:
                            "Thank you for confirming your booking. Please find below our Proforma Invoice towards the 50% advance payment required upon booking confirmation to schedule equipment deployment and technical staff.",
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                        doc.bodyText?.includes("50% advance payment")
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      Proforma 50% Advance
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDoc((prev) => ({
                          ...prev,
                          bodyText:
                            "Please find below our Proforma Invoice towards the remaining 50% balance payment prior to dispatch and equipment deployment.",
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                        doc.bodyText?.includes("balance payment")
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      Proforma 50% Balance
                    </button>
                  </>
                )}

                {doc.docType === "TAX_INVOICE" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setDoc((prev) => ({
                          ...prev,
                          bodyText:
                            "Official GST Tax Invoice for equipment deployment, live showcase, and technical operation rendered.",
                        }))
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                        doc.bodyText?.includes("Official GST Tax Invoice")
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      Tax Invoice Standard
                    </button>
                  </>
                )}

                {doc.docType === "NON_GST_INVOICE" && (
                  <button
                    type="button"
                    onClick={() =>
                      setDoc((prev) => ({
                        ...prev,
                        bodyText:
                          "Official non-tax bill of supply for equipment deployment and technical services rendered.",
                      }))
                    }
                    className="text-[10px] bg-indigo-600 text-white border-indigo-600 px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer"
                  >
                    Bill of Supply Intro
                  </button>
                )}
              </div>
            </div>
            <textarea
              rows={3}
              placeholder="Type your custom opening note, booking confirmation message, or introductory text here..."
              value={doc.bodyText || ""}
              onChange={(e) => setDoc({ ...doc, bodyText: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              Next: Client & Recipient Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Client & Recipient Info */}
      {activeStep === 2 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>🏢</span> Client & Recipient Details
            </h3>
            {clients.length > 0 && (
              <select
                onChange={(e) => handleClientSelect(e.target.value)}
                className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-3 py-1.5 rounded-xl font-bold focus:outline-none cursor-pointer"
              >
                <option value="">⚡ Autofill from Saved Clients CRM...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.orgName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Client / Organization Name *</label>
              <input
                type="text"
                required
                placeholder="BHARATHEEYA VIDYA NIKETHAN"
                value={doc.recipientOrg}
                onChange={(e) => setDoc({ ...doc, recipientOrg: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-500 font-bold">Attention To / Contact Person</label>
                {doc.recipientName && (
                  <button
                    type="button"
                    onClick={() => setDoc({ ...doc, recipientName: "" })}
                    className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. Vipin Sir (Optional)"
                value={doc.recipientName || ""}
                onChange={(e) => setDoc({ ...doc, recipientName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Client GSTIN Number</label>
              <input
                type="text"
                placeholder="32AAEAC6254D1Z7"
                value={doc.recipientGstin || ""}
                onChange={(e) => setDoc({ ...doc, recipientGstin: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Billing Address & Pincode *</label>
              <textarea
                rows={3}
                required
                placeholder="Building No, Street, City, State, Pincode"
                value={doc.recipientAddress}
                onChange={(e) => setDoc({ ...doc, recipientAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 mb-1 font-bold">Place of Supply</label>
                <input
                  type="text"
                  placeholder="Kerala (State Code: 32)"
                  value={doc.placeOfSupply || ""}
                  onChange={(e) => setDoc({ ...doc, placeOfSupply: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Recipient Block Visibility</div>
                  <div className="text-[10px] text-slate-400">Show TO: Client Box on Document</div>
                </div>
                <label className="flex items-center space-x-1.5 cursor-pointer bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  <input
                    type="checkbox"
                    checked={doc.showRecipientSection !== false}
                    onChange={(e) => setDoc({ ...doc, showRecipientSection: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span className="text-[11px] font-bold text-indigo-700">Show TO Box</span>
                </label>
              </div>
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-500 mb-1 font-bold">Subject Line (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Proforma Invoice for 50% Advance Booking - Unitree G1 Robotics Showcase"
              value={doc.subject || ""}
              onChange={(e) => setDoc({ ...doc, subject: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="text-xs space-y-1.5">
            <label className="block text-slate-500 font-bold">
              Opening Preamble / Intro Note (Editable)
            </label>
            <textarea
              rows={2}
              placeholder="Enter custom introductory text or booking note..."
              value={doc.bodyText || ""}
              onChange={(e) => setDoc({ ...doc, bodyText: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Type
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              Next: Line Items & Scope →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Line Items & Tax Calculation */}
      {activeStep === 3 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>📦</span> Line Items & Tax Breakdown
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
            >
              + Add Item Row
            </button>
          </div>

          <div className="space-y-3">
            {doc.items.map((item, index) => (
              <div key={item.id || index} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Item #{index + 1}</span>
                  <div className="flex items-center space-x-2">
                    {products.length > 0 && (
                      <select
                        onChange={(e) => handleSelectProductCatalog(index, e.target.value)}
                        className="bg-white border border-slate-200 text-[11px] text-slate-700 px-2 py-1 rounded-lg"
                      >
                        <option value="">Insert from Product Catalog...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    )}
                    {doc.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-rose-600 hover:underline text-[11px] font-bold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Description & scope of service/item..."
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="w-full bg-white border border-slate-200/80 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 text-[10px]">SAC / HSN</label>
                    <input
                      type="text"
                      value={item.sacCode || "998313"}
                      onChange={(e) => handleItemChange(index, "sacCode", e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-lg p-1.5 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">Qty</label>
                    <input
                      type="number"
                      step="any"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-lg p-1.5 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">Unit / Measure</label>
                    <select
                      value={item.unit || "Days"}
                      onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-lg p-1.5 text-slate-900 text-[11px] font-medium"
                    >
                      <option value="Days">Days</option>
                      <option value="Day">Day</option>
                      <option value="Scope">Scope</option>
                      <option value="Hrs">Hrs</option>
                      <option value="Units">Units</option>
                      <option value="Nos">Nos</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Set">Set</option>
                      <option value="Month">Month</option>
                      <option value="Lots">Lots</option>
                      <option value="">None (Number Only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">Rate (₹)</label>
                    <input
                      type="number"
                      step="any"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", e.target.value)}
                      className="w-full bg-white border border-slate-200/80 rounded-lg p-1.5 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">Amount (₹)</label>
                    <input
                      type="text"
                      readOnly
                      value={(Number(item.amount) || 0).toFixed(2)}
                      className="w-full bg-slate-100 border border-slate-200/80 rounded-lg p-1.5 font-mono font-bold text-emerald-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Customization & Column Options */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <h4 className="font-bold text-indigo-700 text-xs flex items-center gap-1.5">
                <span>⚙️</span> Custom Table Columns & Headings
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">100% Customizable Table Schema</span>
            </div>

            {/* Custom Heading Inputs */}
            <div>
              <label className="block text-slate-700 mb-1.5 font-semibold text-[11px]">
                ✏️ Edit Column Headings & Titles:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 text-[10px]">Item / Scope Heading</label>
                  <input
                    type="text"
                    placeholder="ITEM & DESCRIPTION"
                    value={doc.colHeaderItem || ""}
                    onChange={(e) => setDoc({ ...doc, colHeaderItem: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">SAC / HSN Heading</label>
                  <input
                    type="text"
                    placeholder="SAC CODE"
                    value={doc.colHeaderSac || ""}
                    onChange={(e) => setDoc({ ...doc, colHeaderSac: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Qty / Scope Heading</label>
                  <input
                    type="text"
                    placeholder="QTY / SCOPE"
                    value={doc.colHeaderQty || doc.qtyColumnLabel || ""}
                    onChange={(e) => setDoc({ ...doc, colHeaderQty: e.target.value, qtyColumnLabel: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Price / Rate Heading</label>
                  <input
                    type="text"
                    placeholder="RATE (₹)"
                    value={doc.colHeaderRate || ""}
                    onChange={(e) => setDoc({ ...doc, colHeaderRate: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px]">Amount Heading</label>
                  <input
                    type="text"
                    placeholder="AMOUNT (₹)"
                    value={doc.colHeaderAmount || ""}
                    onChange={(e) => setDoc({ ...doc, colHeaderAmount: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Total & GST Display Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Total & GST Display Mode</label>
                <select
                  value={doc.totalDisplayMode || (doc.showGstDetails === "hide" ? "no_tax_grand_total" : "full_breakdown")}
                  onChange={(e) => {
                    const mode = e.target.value as any;
                    const showGst = mode === "total_only" || mode === "no_tax_grand_total" ? "hide" : "show";
                    updateItemsAndTotals(doc.items, doc.gstType, doc.taxRate, showGst, mode);
                  }}
                  className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="full_breakdown">📊 Full GST Breakdown (Subtotal + CGST/SGST + Total)</option>
                  <option value="total_only">💰 Single Total Amount Only (Just Total Payable Amount)</option>
                  <option value="subtotal_plus_tax">🧾 Subtotal + Combined Tax (1 Line) + Total</option>
                  <option value="no_tax_grand_total">🚫 Net Total Amount (No Tax Added / Non-GST)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Table Layout Preset</label>
                <select
                  value={doc.tableMode}
                  onChange={(e) => {
                    const m = e.target.value as any;
                    let showSac = doc.showSacCode;
                    let showQty = doc.showQtyColumn;
                    let showRate = doc.showRateColumn;
                    let showRowAmounts = doc.showRowAmounts;
                    let totalMode = doc.totalDisplayMode;
                    if (m === "summary") {
                      showSac = false;
                      showRate = false;
                      showQty = true;
                    } else if (m === "detailed") {
                      showSac = true;
                      showQty = true;
                      showRate = true;
                      showRowAmounts = true;
                    } else if (m === "tax_invoice") {
                      showSac = true;
                      showQty = true;
                      showRate = false;
                      showRowAmounts = true;
                    } else if (m === "item_days_amount") {
                      showSac = false;
                      showQty = true;
                      showRate = false;
                      showRowAmounts = true;
                    } else if (m === "total_only") {
                      showRowAmounts = false;
                      totalMode = "total_only";
                    }
                    setDoc({
                      ...doc,
                      tableMode: m,
                      showSacCode: showSac,
                      showQtyColumn: showQty,
                      showRateColumn: showRate,
                      showRowAmounts: showRowAmounts,
                      totalDisplayMode: totalMode
                    });
                  }}
                  className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="tax_invoice">GST Tax Invoice Standard</option>
                  <option value="detailed">Detailed Itemized Breakdown (With Rate & Amount)</option>
                  <option value="summary">Summary Table (Scope & Total)</option>
                  <option value="item_days_amount">Item, Units & Amount</option>
                  <option value="total_only">Total Only (Lump Sum Contract)</option>
                </select>
              </div>
            </div>

            {/* Column Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs border-t border-slate-200/80">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.showSacCode !== false}
                  onChange={(e) => setDoc({ ...doc, showSacCode: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded bg-white border-slate-300"
                />
                <span className="text-slate-700 font-semibold">Show SAC / HSN Column</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.showQtyColumn !== false}
                  onChange={(e) => setDoc({ ...doc, showQtyColumn: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded bg-white border-slate-300"
                />
                <span className="text-slate-700 font-semibold">Show Quantity / Scope Column</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.showRateColumn === true}
                  onChange={(e) => setDoc({ ...doc, showRateColumn: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded bg-white border-slate-300"
                />
                <span className="text-slate-700 font-semibold">Show Unit Price / Rate Column</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                <input
                  type="checkbox"
                  checked={doc.showRowAmounts !== false}
                  onChange={(e) => setDoc({ ...doc, showRowAmounts: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded bg-white border-slate-300"
                />
                <span className="text-indigo-950 font-bold">Show Row Prices in Table</span>
              </label>
            </div>
          </div>

          {/* Tax Engine */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">GST Calculation Type</label>
              <select
                value={doc.gstType}
                onChange={(e) => updateItemsAndTotals(doc.items, e.target.value as any, doc.taxRate)}
                className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900"
              >
                <option value="intrastate">Intrastate (CGST 9% + SGST 9%)</option>
                <option value="interstate">Interstate (IGST 18%)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">GST Tax Rate (%)</label>
              <input
                type="number"
                value={doc.taxRate}
                onChange={(e) => updateItemsAndTotals(doc.items, doc.gstType, parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-indigo-950 font-extrabold mb-1">⚡ Package Subtotal Override (₹)</label>
              <input
                type="number"
                placeholder="e.g. 150000 (Subtotal before GST)"
                value={doc.customSubtotal || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || undefined;
                  updateItemsAndTotals(doc.items, doc.gstType, doc.taxRate, doc.showGstDetails, doc.totalDisplayMode, val);
                }}
                className="w-full bg-white border border-indigo-300 rounded-xl p-2.5 font-mono text-indigo-900 font-extrabold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 font-semibold">Grand Total Payable:</span>
            <span className="text-emerald-700 font-bold text-base">{formatCurrency(doc.grandTotal)}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              ← Back to Client
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Next: Bank & Signatory →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Bank Account & Authorization */}
      {activeStep === 4 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200/80 pb-3 flex items-center gap-2">
            <span>🏦</span> Bank Profile & Signatory Auth
          </h3>

          {/* Bank Details Toggle Banner */}
          <div className="p-3 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-blue-50/80 border border-indigo-200/80 rounded-xl flex items-center justify-between text-xs">
            <div>
              <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                <span>🏦</span> Company Bank Account Details
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {doc.showBankDetails !== false
                  ? "Bank Details Box active (Renders Federal/HDFC Account details on PDF)"
                  : "Bank Details hidden (Renders clean Payment Terms box on PDF instead)"}
              </div>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
              <input
                type="checkbox"
                checked={doc.showBankDetails !== false}
                onChange={(e) => setDoc({ ...doc, showBankDetails: e.target.checked })}
                className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="text-xs font-bold text-indigo-600">
                {doc.showBankDetails !== false ? "Show Bank Details" : "Hide Bank Details"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Payment Bank Profile</label>
              <select
                value={doc.bankAccountId}
                onChange={(e) => setDoc({ ...doc, bankAccountId: e.target.value })}
                disabled={doc.showBankDetails === false}
                className={`w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 ${
                  doc.showBankDetails === false ? "opacity-50 cursor-not-allowed bg-slate-100" : ""
                }`}
              >
                {settings.bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} - {b.accountName} ({b.branch})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Authorized Signatory</label>
                <select
                  value={doc.signatoryName}
                  onChange={(e) => {
                    const name = e.target.value;
                    const sig = settings.signatories.find((s) => s.name === name);
                    setDoc({
                      ...doc,
                      signatoryName: name,
                      signatoryTitle: sig?.title || doc.signatoryTitle,
                    });
                  }}
                  className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  {settings.signatories.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.title})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-bold">Signatory Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Co-Founder & CTO"
                  value={doc.signatoryTitle || ""}
                  onChange={(e) => setDoc({ ...doc, signatoryTitle: e.target.value })}
                  className="w-full bg-white border border-slate-200/80 rounded-lg p-1.5 text-slate-900 font-medium text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="text-xs space-y-3">
            {doc.showBankDetails !== false && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-indigo-700 font-semibold flex items-center gap-1.5">
                    <span>💳</span> Bank Transfer Note (Editable Note under Bank Details)
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px]">
                    <input
                      type="checkbox"
                      checked={doc.showBankTransferNote !== false}
                      onChange={(e) => setDoc({ ...doc, showBankTransferNote: e.target.checked })}
                      className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0 text-xs"
                    />
                    <span className={doc.showBankTransferNote !== false ? "text-indigo-700 font-bold" : "text-slate-500"}>
                      {doc.showBankTransferNote !== false ? "Visible on Document" : "Hidden on Document"}
                    </span>
                  </label>
                </div>
                {doc.showBankTransferNote !== false && (
                  <input
                    type="text"
                    placeholder="Note: Beneficiary Designated Account for Robuverse LLP transfers"
                    value={
                      doc.bankAccountNote !== undefined
                        ? doc.bankAccountNote
                        : (settings.bankAccounts.find((b) => b.id === doc.bankAccountId) || settings.bankAccounts[0])?.note ||
                          "Beneficiary Designated Account for Robuverse LLP transfers"
                    }
                    onChange={(e) => setDoc({ ...doc, bankAccountNote: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 mt-1"
                  />
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">
                  📋 Payment Terms (Renders in Left Box when Bank Details are Hidden or combined)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg text-[10px]">
                    <input
                      type="checkbox"
                      checked={doc.showTerms !== false}
                      onChange={(e) => setDoc({ ...doc, showTerms: e.target.checked })}
                      className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0 text-xs"
                    />
                    <span className={doc.showTerms !== false ? "text-indigo-700 font-bold" : "text-slate-500"}>
                      {doc.showTerms !== false ? "Show Box" : "Hide"}
                    </span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {doc.docType === "QUOTATION" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setDoc((prev) => ({
                              ...prev,
                              paymentTerms: ". 50% advance on confirmation of purchase order\n. 50% upon delivery, installation & final commissioning",
                            }))
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                            doc.paymentTerms?.includes("purchase order")
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          }`}
                        >
                          ⚡ 50/50 Quote Terms
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDoc((prev) => ({
                              ...prev,
                              paymentTerms: ". 100% payment upon delivery, installation & satisfactory testing",
                            }))
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                            doc.paymentTerms?.includes("100% payment upon delivery")
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          }`}
                        >
                          ⚡ 100% On Delivery
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setDoc((prev) => ({
                              ...prev,
                              paymentTerms: ". 50% advance on confirmation of order\n. 30% on equipment delivery & installation\n. 20% on handover & launch",
                            }))
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                            doc.paymentTerms?.includes("50% advance on confirmation of order")
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          }`}
                        >
                          ⚡ 50/30/20 Stage Payment
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDoc((prev) => ({
                              ...prev,
                              paymentTerms: ". 50% advance booking deposit upon confirmation\n. 50% balance before dispatch & deployment",
                            }))
                          }
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                            doc.paymentTerms?.includes("advance booking deposit")
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          }`}
                        >
                          ⚡ 50/50 Advance
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <textarea
                rows={3}
                placeholder=". 50% advance on confirmation of order&#10;. 30% on equipment delivery & installation&#10;. 20% on handover & launch"
                value={doc.paymentTerms || ""}
                onChange={(e) => setDoc({ ...doc, paymentTerms: e.target.value })}
                className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium text-xs leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">Validity & Notes (Renders in Right Box on PDF)</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg text-[10px]">
                    <input
                      type="checkbox"
                      checked={doc.showValidity !== false}
                      onChange={(e) => setDoc({ ...doc, showValidity: e.target.checked })}
                      className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0 text-xs"
                    />
                    <span className={doc.showValidity !== false ? "text-indigo-700 font-bold" : "text-slate-500"}>
                      {doc.showValidity !== false ? "Show Box" : "Hide"}
                    </span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {doc.docType === "QUOTATION" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDoc((prev) => ({
                            ...prev,
                            validityNotes: ". Quote Validity: 30 days from date of issue.\n. Delivery & Deployment: Within 7 to 10 working days upon order confirmation.\n. Taxes & Statutory: GST @ 18% extra as applicable.\n. Warranty & Technical Support: 1 Year comprehensive technical coverage included.",
                          }))
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                          doc.validityNotes?.includes("Quote Validity: 30 days")
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        }`}
                      >
                        ⚡ 30-Day Quote Terms
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setDoc((prev) => ({
                            ...prev,
                            validityNotes: ". Official Statutory Tax Invoice under Section 31 of CGST Act 2017 & Rule 46 of CGST Rules.\n. Supplier GSTIN: 32ABOFR0193C1ZE\n. Place of Supply: Kerala (State Code: 32) | Intra-state Supply (CGST 9% + SGST 9%)\n. SAC Code: 997319 (Renting/leasing of robots and other machinery/equipment)",
                          }))
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                          doc.validityNotes?.includes("Section 31 of CGST Act")
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        }`}
                      >
                        ⚡ Statutory GST Notes
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <textarea
                rows={4}
                value={doc.validityNotes || ""}
                onChange={(e) => setDoc({ ...doc, validityNotes: e.target.value })}
                className="w-full bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doc.showSignature}
                onChange={(e) => setDoc({ ...doc, showSignature: e.target.checked })}
                className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-700 font-medium">Show Digital Signature</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doc.showSeal}
                onChange={(e) => setDoc({ ...doc, showSeal: e.target.checked })}
                className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-700 font-medium">Show Official Digital Stamp</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doc.showWatermark}
                onChange={(e) => setDoc({ ...doc, showWatermark: e.target.checked })}
                className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-700 font-medium">Show Robuverse Watermark</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doc.showFooter !== false}
                onChange={(e) => setDoc({ ...doc, showFooter: e.target.checked })}
                className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-700 font-medium">Show Bottom Footer</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              ← Back to Items
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-3 rounded-xl shadow-md shadow-indigo-500/20 transition-all transform active:scale-95 text-xs cursor-pointer"
            >
              ✓ Save & Issue Official Document
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
