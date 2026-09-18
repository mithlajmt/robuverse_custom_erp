export type DocType = "QUOTATION" | "PROFORMA" | "TAX_INVOICE" | "NON_GST_INVOICE" | "LETTERHEAD" | "CERTIFICATE";

export type DocStatus = "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";

export type GstType = "intrastate" | "interstate";

export type GstMode = "exclusive" | "inclusive" | "calculated";

export type TableMode = "simple" | "detailed" | "summary" | "total_only" | "item_days_amount" | "tax_invoice";

export interface Client {
  id: string;
  name: string;
  orgName: string;
  gstin?: string;
  address: string;
  phone?: string;
  email?: string;
  state?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  sacCode?: string;
  defaultPrice: number;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId?: string;
  note?: string;
  isDefault?: boolean;
}

export interface Signatory {
  id: string;
  name: string;
  title: string;
  signatureUrl?: string;
  isDefault?: boolean;
}

export interface CompanySettings {
  name: string;
  tagline?: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  companyGstin: string;
  companyAddress: string;
  companyPhone: string;
  logoUrl?: string;
  sealUrl?: string;
  bankAccounts: BankAccount[];
  signatories: Signatory[];
}

export interface DocumentItem {
  id: string;
  description: string;
  sacCode?: string;
  qty: number;
  unit?: string;
  price: number;
  discountPercent?: number;
  amount: number;
}

export interface BusinessDocument {
  id: string;
  docType: DocType;
  isGstBill?: boolean;
  docSubtitle?: string;
  docNumber: string;
  date: string;
  dueDate?: string;
  refNo?: string;
  piReference?: string;
  placeOfSupply?: string;
  leadId?: string;
  leadNumber?: string;
  
  // Client details
  recipientName?: string;
  recipientOrg: string;
  recipientAddress: string;
  recipientGstin?: string;

  // Content
  subject?: string;
  bodyText?: string;
  
  // Items & Table Configuration
  items: DocumentItem[];
  tableMode: TableMode;
  qtyColumnLabel?: string;
  
  // Tax details
  gstMode: GstMode;
  gstType: GstType;
  taxRate: number;
  subtotal: number;
  discountTotal?: number;
  taxAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  grandTotal: number;
  amountInWords?: string;

  // Notes & Signatory
  advanceReceived?: number;
  balanceDue?: number;
  paymentTerms?: string;
  validityNotes?: string;
  closingText?: string;
  signatoryName: string;
  signatoryTitle: string;
  
  // Display Toggles
  showSeal: boolean;
  showSignature: boolean;
  showWatermark: boolean;
  showRecipientSection?: boolean;
  showCompanyGst?: boolean;
  showBankTransferNote?: boolean;
  showBankDetails?: boolean;
  // Custom Table Column Headings & Visibility Toggles
  colHeaderItem?: string;
  colHeaderSac?: string;
  colHeaderQty?: string;
  colHeaderRate?: string;
  colHeaderAmount?: string;
  showQtyColumn?: boolean;
  showRateColumn?: boolean;
  showSacCode?: boolean;
  showRowAmounts?: boolean;
  customSubtotal?: number;
  
  // Total / GST Display Customization
  totalDisplayMode?: "full_breakdown" | "total_only" | "subtotal_plus_tax" | "no_tax_grand_total";
  showGstDetails?: "show" | "gstin_only" | "hide";
  
  // Account & Metadata
  bankAccountId?: string;
  bankAccountNote?: string;
  bankAccountDetails?: BankAccount;
  advancePercent?: number;
  totalContractValue?: number;
  status: DocStatus;
  createdAt: string;
  updatedAt: string;
}
