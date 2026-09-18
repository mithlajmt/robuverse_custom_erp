"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { BusinessDocument, DocType } from "@/types/document";

function getDocPrisma() {
  const p = getPrisma();
  if (!(p as any).document) {
    const { PrismaClient } = require("@prisma/client");
    return new PrismaClient();
  }
  return p;
}

function sanitizeDocument(doc: any): BusinessDocument {
  if (!doc) return doc;
  const parsed = JSON.parse(JSON.stringify(doc));
  return {
    ...parsed,
    taxRate: Number(parsed.taxRate || 0),
    subtotal: Number(parsed.subtotal || 0),
    discountTotal: Number(parsed.discountTotal || 0),
    taxAmount: Number(parsed.taxAmount || 0),
    cgstAmount: Number(parsed.cgstAmount || 0),
    sgstAmount: Number(parsed.sgstAmount || 0),
    igstAmount: Number(parsed.igstAmount || 0),
    grandTotal: Number(parsed.grandTotal || 0),
    advanceReceived: Number(parsed.advanceReceived || 0),
    balanceDue: Number(parsed.balanceDue || 0),
    customSubtotal: parsed.customSubtotal !== undefined && parsed.customSubtotal !== null ? Number(parsed.customSubtotal) : undefined,
    advancePercent: parsed.advancePercent !== undefined && parsed.advancePercent !== null ? Number(parsed.advancePercent) : undefined,
    totalContractValue: parsed.totalContractValue !== undefined && parsed.totalContractValue !== null ? Number(parsed.totalContractValue) : undefined,
    items: (parsed.items || []).map((item: any) => ({
      ...item,
      qty: Number(item.qty || 1),
      price: Number(item.price || 0),
      discountPercent: Number(item.discountPercent || 0),
      amount: Number(item.amount || 0),
    })),
  };
}

export async function getNextDocNumberAction(docType: DocType, isGstBill: boolean = true): Promise<string> {
  const prisma = getDocPrisma();
  const currentYear = new Date().getFullYear();

  let prefix = "RBV/INV";
  let minSeq = 201;

  if (!isGstBill || docType === "NON_GST_INVOICE") {
    prefix = "RBV/BILL";
    minSeq = 101;
  } else if (docType === "QUOTATION") {
    prefix = "RBV/QTN";
    minSeq = 101;
  } else if (docType === "PROFORMA") {
    prefix = "RBV/PI";
    minSeq = 170;
  } else if (docType === "LETTERHEAD") {
    prefix = "RBV/LTR";
    minSeq = 101;
  } else if (docType === "CERTIFICATE") {
    prefix = "RBV/CERT";
    minSeq = 101;
  }

  const existingDocs = await prisma.document.findMany({
    where: {
      docNumber: { startsWith: `${prefix}/${currentYear}/` }
    },
    select: { docNumber: true }
  });

  if (existingDocs.length === 0) {
    return `${prefix}/${currentYear}/${minSeq}`;
  }

  let maxSeq = minSeq - 1;
  for (const doc of existingDocs) {
    const parts = doc.docNumber.split("/");
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num) && num > maxSeq) {
      maxSeq = num;
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}/${currentYear}/${nextSeq}`;
}

export async function saveDocumentAction(doc: BusinessDocument) {
  const prisma = getDocPrisma();

  // Handle document payload
  const isGst = doc.isGstBill !== false && doc.docType !== "NON_GST_INVOICE";
  const docTypeToSave = !isGst && doc.docType === "TAX_INVOICE" ? "NON_GST_INVOICE" : doc.docType;

  const dataPayload = {
    docType: docTypeToSave as any,
    isGstBill: isGst,
    docSubtitle: doc.docSubtitle || null,
    docNumber: doc.docNumber,
    date: doc.date ? new Date(doc.date) : new Date(),
    dueDate: doc.dueDate ? new Date(doc.dueDate) : null,
    refNo: doc.refNo || null,
    piReference: doc.piReference || null,
    placeOfSupply: doc.placeOfSupply || "Kerala (State Code: 32)",
    leadId: doc.leadId || null,
    leadNumber: doc.leadNumber || null,

    recipientName: doc.recipientName || null,
    recipientOrg: doc.recipientOrg || "",
    recipientAddress: doc.recipientAddress || "",
    recipientGstin: doc.recipientGstin || null,

    subject: doc.subject || null,
    bodyText: doc.bodyText || null,

    gstMode: doc.gstMode || "calculated",
    gstType: doc.gstType || "intrastate",
    taxRate: doc.taxRate || (isGst ? 18 : 0),
    subtotal: doc.subtotal || 0,
    discountTotal: doc.discountTotal || 0,
    taxAmount: isGst ? (doc.taxAmount || 0) : 0,
    cgstAmount: isGst ? (doc.cgstAmount || 0) : 0,
    sgstAmount: isGst ? (doc.sgstAmount || 0) : 0,
    igstAmount: isGst ? (doc.igstAmount || 0) : 0,
    grandTotal: doc.grandTotal || 0,
    amountInWords: doc.amountInWords || null,

    advanceReceived: doc.advanceReceived || 0,
    balanceDue: doc.balanceDue || 0,
    paymentTerms: doc.paymentTerms || null,
    validityNotes: doc.validityNotes || null,
    closingText: doc.closingText || null,
    signatoryName: doc.signatoryName || "Mithlaj MT.",
    signatoryTitle: doc.signatoryTitle || "Co-Founder & CTO",
    bankAccountId: doc.bankAccountId || "bank_federal_nihal",

    showSeal: doc.showSeal !== false,
    showSignature: doc.showSignature !== false,
    showWatermark: doc.showWatermark !== false,
    showRecipientSection: doc.showRecipientSection !== false,
    showCompanyGst: doc.showCompanyGst !== false,
    showBankTransferNote: doc.showBankTransferNote !== false,

    status: doc.status || "ISSUED"
  };

  let savedDoc;

  if (doc.id && doc.id.trim() !== "" && !doc.id.startsWith("temp_")) {
    // Delete existing items and replace with updated list
    await prisma.documentItem.deleteMany({ where: { documentId: doc.id } });

    savedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: {
        ...dataPayload,
        items: {
          create: (doc.items || []).map((item) => ({
            description: item.description,
            sacCode: item.sacCode || null,
            qty: item.qty || 1,
            unit: item.unit || "Days",
            price: item.price || 0,
            discountPercent: item.discountPercent || 0,
            amount: item.amount || 0
          }))
        }
      },
      include: { items: true }
    });
  } else {
    savedDoc = await prisma.document.create({
      data: {
        ...dataPayload,
        items: {
          create: (doc.items || []).map((item) => ({
            description: item.description,
            sacCode: item.sacCode || null,
            qty: item.qty || 1,
            unit: item.unit || "Days",
            price: item.price || 0,
            discountPercent: item.discountPercent || 0,
            amount: item.amount || 0
          }))
        }
      },
      include: { items: true }
    });
  }

  // If document is linked to a Lead, add doc number to lead's linkedDocs array
  if (doc.leadId) {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: doc.leadId } });
      if (lead) {
        const existingDocs = lead.linkedDocs || [];
        if (!existingDocs.includes(doc.docNumber)) {
          await prisma.lead.update({
            where: { id: doc.leadId },
            data: { linkedDocs: [...existingDocs, doc.docNumber] }
          });
        }
      }
    } catch (e) {
      console.error("Could not link doc to lead:", e);
    }
  }

  revalidatePath("/documents");
  return { success: true, document: sanitizeDocument(savedDoc) };
}

export async function getDocumentsAction() {
  const prisma = getDocPrisma();
  const docs = await prisma.document.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
  return docs.map((d: any) => sanitizeDocument(d));
}

export async function getDocumentByIdAction(id: string) {
  const prisma = getDocPrisma();
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { items: true }
  });
  return doc ? sanitizeDocument(doc) : null;
}

export async function deleteDocumentAction(id: string) {
  const prisma = getDocPrisma();
  await prisma.document.delete({ where: { id } });
  revalidatePath("/documents");
  return { success: true };
}
