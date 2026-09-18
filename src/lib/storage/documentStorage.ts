import { BusinessDocument, Client, Product, CompanySettings, BankAccount, Signatory, DocType } from "@/types/document";
import { numberToIndianWords } from "@/lib/utils/currency";

const STORAGE_KEYS = {
  DOCUMENTS: "rbv_docs_v1",
  CLIENTS: "rbv_clients_v1",
  PRODUCTS: "rbv_products_v1",
  SETTINGS: "rbv_settings_v1",
  COUNTERS: "rbv_counters_v1",
};

// Seed Bank Accounts
export const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "bank_federal_nihal",
    bankName: "Federal Bank",
    accountName: "Nihal V (Founder / Managing Partner)",
    accountNumber: "99980111775909",
    ifsc: "FDRL0001090",
    branch: "Mukkam",
    upiId: "7356284208",
    note: "Beneficiary Designated Account for Robuverse LLP transfers",
    isDefault: true,
  },
  {
    id: "bank_robuverse_current",
    bankName: "HDFC Bank",
    accountName: "Robuverse LLP",
    accountNumber: "50200084729103",
    ifsc: "HDFC0001824",
    branch: "Kozhikode",
    upiId: "robuverse@hdfcbank",
    note: "Official Company Current Account",
    isDefault: false,
  },
];

// Seed Signatories
export const DEFAULT_SIGNATORIES: Signatory[] = [
  {
    id: "sig_mithlaj",
    name: "Mithlaj MT.",
    title: "Co-Founder & Chief Technology Officer",
    signatureUrl: "/assets/mithlaj_sign.png",
    isDefault: true,
  },
  {
    id: "sig_nihal",
    name: "Nihal V.",
    title: "Managing Partner & CEO",
    signatureUrl: "/assets/nihal_sign.png",
    isDefault: false,
  },
  {
    id: "sig_shahul",
    name: "Shahul Hameed",
    title: "Chief Operating Officer",
    signatureUrl: "/assets/shahul_sign.png",
    isDefault: false,
  },
];

// Seed Company Settings
export const DEFAULT_SETTINGS: CompanySettings = {
  name: "Robuverse LLP",
  tagline: "Robotics, Automation & Technology Solutions",
  gstin: "32ABOFR0193C1ZE",
  address: "Building No. 5/986/E, Kattangal, Chathamangalam, Kozhikode, Kerala - 673601, India",
  phone: "+91 7356284208",
  email: "contact@robuverse.com",
  website: "https://robuverse.com",
  companyGstin: "32ABOFR0193C1ZE",
  companyAddress: "Building No. 5/986/E, Kattangal, Chathamangalam, Kozhikode, Kerala - 673601, India",
  companyPhone: "+91 7356284208",
  logoUrl: "/assets/logo.png",
  sealUrl: "/assets/digital_seal.png",
  bankAccounts: DEFAULT_BANK_ACCOUNTS,
  signatories: DEFAULT_SIGNATORIES,
};

// Seed Clients (CRM)
export const DEFAULT_CLIENTS: Client[] = [
  {
    id: "cli_1",
    name: "Confederation of Renewable Energy",
    orgName: "CONFEDERATION OF RENEWABLE ENERGY",
    gstin: "32AAEAC6254D1Z7",
    address: "1st Floor, Building No. 5/211, City Palace Building\nEloor Road, Opp. Jothir Bhavan, North Kalamassery\nKalamassery, Ernakulam, Kerala - 683104",
    phone: "+91 9847012345",
    email: "info@cre-kerala.org",
    state: "Kerala",
  },
  {
    id: "cli_2",
    name: "List Institute of Tech",
    orgName: "Lourde Institute of Science & Technology",
    gstin: "32AAAAA0000A1Z5",
    address: "College Campus, Taliparamba, Kannur, Kerala - 670141",
    phone: "+91 4972700000",
    email: "principal@list.edu.in",
    state: "Kerala",
  },
];

// Seed Products Catalog
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    title: "Unitree G1 Humanoid Robot Live Showcase & Demo (per day)",
    description: "On-site deployment of Unitree G1 Humanoid Robot with 2 dedicated robotics engineers for live demonstrations",
    sacCode: "998313",
    defaultPrice: 53333.33,
    unit: "Days",
  },
  {
    id: "prod_2",
    title: "Robotics & AI Hands-on Workshop (Per Student)",
    description: "Comprehensive 2-day practical boot camp on ROS 2 navigation, hardware integration, and autonomous mobile robots",
    sacCode: "999293",
    defaultPrice: 1500,
    unit: "Students",
  },
  {
    id: "prod_3",
    title: "Custom Embedded Hardware & PCB Prototyping",
    description: "Schematic design, multilayer PCB layout, component sourcing, and assembly testing",
    sacCode: "998314",
    defaultPrice: 45000,
    unit: "Project",
  },
];

// Helper to calculate totals
export const calculateDocumentTotals = (
  items: { price: number; qty: number; discountPercent?: number }[],
  taxRate: number,
  gstMode: "exclusive" | "inclusive" | "calculated",
  gstType: "intrastate" | "interstate",
  showGstDetails?: "show" | "gstin_only" | "hide",
  totalDisplayMode?: "full_breakdown" | "total_only" | "subtotal_plus_tax" | "no_tax_grand_total",
  customSubtotal?: number
) => {
  let subtotal = 0;
  let discountTotal = 0;

  items.forEach((item) => {
    const lineGross = (item.price || 0) * (item.qty || 1);
    const lineDiscount = lineGross * ((item.discountPercent || 0) / 100);
    discountTotal += lineDiscount;
    subtotal += lineGross - lineDiscount;
  });

  if (customSubtotal !== undefined && customSubtotal > 0) {
    subtotal = customSubtotal;
  }

  let taxAmount = 0;
  let grandTotal = subtotal;

  const isNoTax =
    showGstDetails === "hide" ||
    showGstDetails === "gstin_only" ||
    totalDisplayMode === "no_tax_grand_total" ||
    totalDisplayMode === "total_only" ||
    taxRate === 0;

  if (!isNoTax) {
    if (gstMode === "calculated" || gstMode === "exclusive") {
      taxAmount = subtotal * (taxRate / 100);
      grandTotal = subtotal + taxAmount;
    } else if (gstMode === "inclusive") {
      taxAmount = subtotal - subtotal / (1 + taxRate / 100);
      grandTotal = subtotal;
      subtotal = grandTotal - taxAmount;
    }
  }

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (!isNoTax) {
    if (gstType === "intrastate") {
      cgstAmount = taxAmount / 2;
      sgstAmount = taxAmount / 2;
    } else {
      igstAmount = taxAmount;
    }
  }

  return {
    subtotal,
    discountTotal,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    grandTotal,
    amountInWords: numberToIndianWords(Math.round(grandTotal)),
  };
};

export class DocumentStorageService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- SETTINGS ---
  static getSettings(): CompanySettings {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  static saveSettings(settings: CompanySettings): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- CLIENTS ---
  static getClients(): Client[] {
    if (!this.isBrowser()) return DEFAULT_CLIENTS;
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
      return DEFAULT_CLIENTS;
    }
    return JSON.parse(data);
  }

  static saveClient(client: Omit<Client, "id"> & { id?: string }): Client {
    const clients = this.getClients();
    const newClient: Client = {
      ...client,
      id: client.id || `cli_${Date.now()}`,
      createdAt: client.id ? (clients.find((c) => c.id === client.id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = clients.findIndex((c) => c.id === newClient.id);
    if (existingIndex >= 0) {
      clients[existingIndex] = newClient;
    } else {
      clients.unshift(newClient);
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    }
    return newClient;
  }

  static deleteClient(id: string): void {
    const clients = this.getClients().filter((c) => c.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    }
  }

  // --- PRODUCTS ---
  static getProducts(): Product[] {
    if (!this.isBrowser()) return DEFAULT_PRODUCTS;
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(data);
  }

  static saveProduct(product: Omit<Product, "id"> & { id?: string }): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: product.id || `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = products.findIndex((p) => p.id === newProduct.id);
    if (existingIndex >= 0) {
      products[existingIndex] = newProduct;
    } else {
      products.unshift(newProduct);
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
    return newProduct;
  }

  static deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  // --- AUTO SEQUENTIAL REFERENCE NUMBERS ---
  static getNextDocNumber(docType: DocType): string {
    if (!this.isBrowser()) return `RBV/${docType.slice(0, 3)}/2026/001`;

    const countersStr = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    const counters = countersStr ? JSON.parse(countersStr) : { QUOTATION: 101, PROFORMA: 170, TAX_INVOICE: 50, LETTERHEAD: 10, CERTIFICATE: 1 };
    const year = new Date().getFullYear();

    const currentVal = counters[docType] || 1;
    const prefixMap: Record<DocType, string> = {
      QUOTATION: "RBV/QUO",
      PROFORMA: "RBV/PI",
      TAX_INVOICE: "RBV/INV",
      NON_GST_INVOICE: "RBV/BILL",
      LETTERHEAD: "RBV/LTR",
      CERTIFICATE: "RV-INT",
    };

    const prefix = prefixMap[docType] || "RBV/DOC";
    const formattedNum = String(currentVal).padStart(3, "0");
    return `${prefix}/${year}/${formattedNum}`;
  }

  static incrementDocNumber(docType: DocType): void {
    if (!this.isBrowser()) return;
    const countersStr = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    const counters = countersStr ? JSON.parse(countersStr) : { QUOTATION: 101, PROFORMA: 170, TAX_INVOICE: 50, LETTERHEAD: 10, CERTIFICATE: 1 };
    counters[docType] = (counters[docType] || 1) + 1;
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
  }

  // --- DOCUMENTS CRUD ---
  static getDocuments(): BusinessDocument[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) return [];
    return JSON.parse(data);
  }

  static getDocumentById(id: string): BusinessDocument | undefined {
    return this.getDocuments().find((d) => d.id === id);
  }

  static saveDocument(doc: Omit<BusinessDocument, "id" | "createdAt" | "updatedAt"> & { id?: string }): BusinessDocument {
    const docs = this.getDocuments();
    const isNew = !doc.id;
    const now = new Date().toISOString();

    const savedDoc: BusinessDocument = {
      ...doc,
      id: doc.id || `doc_${Date.now()}`,
      createdAt: isNew ? now : (docs.find((d) => d.id === doc.id)?.createdAt || now),
      updatedAt: now,
    };

    const existingIndex = docs.findIndex((d) => d.id === savedDoc.id);
    if (existingIndex >= 0) {
      docs[existingIndex] = savedDoc;
    } else {
      docs.unshift(savedDoc);
      this.incrementDocNumber(doc.docType);
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    }
    return savedDoc;
  }

  static deleteDocument(id: string): void {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    }
  }

  // --- ONE-CLICK DOCUMENT CONVERSION WITH DYNAMIC ADVANCE PERCENTAGE ---
  static convertDocument(docId: string, targetType: DocType, advancePercent: number = 50): BusinessDocument | null {
    const sourceDoc = this.getDocumentById(docId);
    if (!sourceDoc) return null;

    const newDocNumber = this.getNextDocNumber(targetType);
    const typeSubtitles: Record<DocType, string> = {
      QUOTATION: "OFFICIAL COMMERCIAL QUOTATION",
      PROFORMA: `${advancePercent}% ADVANCE PAYMENT - ${sourceDoc.recipientOrg || "BOOKING CONFIRMATION"}`,
      TAX_INVOICE: "OFFICIAL GST TAX INVOICE",
      NON_GST_INVOICE: "OFFICIAL BILL OF SUPPLY - NON-GST",
      LETTERHEAD: "OFFICIAL COMPANY CORRESPONDENCE",
      CERTIFICATE: "COMPLETION CERTIFICATE",
    };

    let convertedItems = sourceDoc.items.map((item) => {
      if (targetType === "PROFORMA" && sourceDoc.docType === "QUOTATION" && advancePercent > 0 && advancePercent <= 100) {
        const scaledPrice = Math.round((item.price * advancePercent) / 100);
        const scaledAmount = Math.round((item.amount * advancePercent) / 100);
        const cleanDesc = item.description.replace(/^\d+%\s*Advance:?\s*/i, "");
        return {
          ...item,
          description: advancePercent === 100 ? cleanDesc : `${advancePercent}% Advance: ${cleanDesc}`,
          price: scaledPrice,
          amount: scaledAmount,
        };
      }
      return { ...item };
    });

    const defaultBodyMap: Record<DocType, string> = {
      QUOTATION: "Thank you for your interest in Robuverse. LLP. Please find below our official commercial quotation for your review.",
      PROFORMA: `Thank you for confirming your booking. Please find below our Proforma Invoice towards the ${advancePercent}% advance payment required upon booking confirmation to schedule equipment deployment and technical staff.`,
      TAX_INVOICE: "Thank you for your business. Please find below our official Tax Invoice for the equipment deployment and technical services rendered.",
      NON_GST_INVOICE: "Thank you for your business. Please find below our official non-tax Bill of Supply for equipment deployment and technical services rendered.",
      LETTERHEAD: "Please find below our official company announcement and technical notice.",
      CERTIFICATE: "This is to certify the completion of practical training and workshop requirements.",
    };

    const totals = calculateDocumentTotals(
      convertedItems,
      sourceDoc.taxRate,
      sourceDoc.gstMode,
      sourceDoc.gstType,
      sourceDoc.showGstDetails,
      sourceDoc.totalDisplayMode
    );

    const convertedDoc: BusinessDocument = {
      ...sourceDoc,
      ...totals,
      id: `doc_${Date.now()}`,
      docType: targetType,
      docSubtitle: typeSubtitles[targetType] || sourceDoc.docSubtitle,
      bodyText: defaultBodyMap[targetType] || sourceDoc.bodyText,
      docNumber: newDocNumber,
      date: new Date().toISOString().split("T")[0],
      refNo: newDocNumber,
      piReference: sourceDoc.docType === "QUOTATION" ? `Quotation Ref: ${sourceDoc.docNumber}` : (sourceDoc.docType === "PROFORMA" ? sourceDoc.docNumber : sourceDoc.piReference),
      items: convertedItems,
      advancePercent: targetType === "PROFORMA" ? advancePercent : undefined,
      totalContractValue: targetType === "PROFORMA" ? sourceDoc.grandTotal : undefined,
      status: "ISSUED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveDocument(convertedDoc);
  }
}
