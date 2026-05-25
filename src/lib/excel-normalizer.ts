import {
  CashFlowDirection,
  DebtDirection,
  DebtStatus,
  PaymentMethod,
  TransactionSource,
  TransactionStatus,
  TransactionType
} from "@prisma/client";
import { slugify } from "@/lib/utils";

export type RawCashFlowRow = {
  date: Date;
  category: string;
  description: string;
  projectCode?: string | null;
  inflow?: number | null;
  outflow?: number | null;
};

export type RawSalaryRow = {
  date: Date;
  employee?: string | null;
  salaryAmount?: number | null;
  status?: string | null;
  projectCode?: string | null;
  description?: string | null;
};

export type RawDebtRow = {
  date: Date;
  person?: string | null;
  givenToCompany?: number | null;
  paidBack?: number | null;
};

export type RawOwnerCapitalRow = {
  date: Date;
  owner?: string | null;
  invested?: number | null;
  withdrawn?: number | null;
};

export type NormalizedTransaction = {
  type: TransactionType;
  status: TransactionStatus;
  cashFlowDirection: CashFlowDirection;
  categorySlug: string;
  categoryName: string;
  amount: string;
  description: string;
  transactionDate: Date;
  paymentMethod: PaymentMethod;
  projectCode?: string | null;
  employeeName?: string | null;
  debtPersonName?: string | null;
  debtDirection?: DebtDirection | null;
  source: TransactionSource;
  isSystemGenerated: boolean;
  notes?: string | null;
};

export function normalizeCashFlowCategory(category: string): {
  type: TransactionType;
  categorySlug: string;
  categoryName: string;
} {
  const normalized = category.trim().toLowerCase();

  if (normalized === "income") {
    return { type: "INCOME", categorySlug: "income", categoryName: "Income" };
  }

  if (normalized === "expense") {
    return { type: "EXPENSE", categorySlug: "expense", categoryName: "Expense" };
  }

  if (normalized === "owner_investment" || normalized === "owner investment") {
    return {
      type: "CAPITAL",
      categorySlug: "owner-investment",
      categoryName: "Owner Investment"
    };
  }

  if (normalized === "loan_taken" || normalized === "loan taken") {
    return { type: "TRANSFER", categorySlug: "loan-taken", categoryName: "Loan Taken" };
  }

  if (normalized === "loan_repaid" || normalized === "loan repaid") {
    return { type: "TRANSFER", categorySlug: "loan-repaid", categoryName: "Loan Repaid" };
  }

  if (normalized === "adjustment") {
    return { type: "TRANSFER", categorySlug: "adjustment", categoryName: "Adjustment" };
  }

  const slug = slugify(category);
  return { type: "TRANSFER", categorySlug: slug, categoryName: titleCase(category) };
}

export function normalizeCashFlowRow(row: RawCashFlowRow): NormalizedTransaction | null {
  const inflow = Number(row.inflow ?? 0);
  const outflow = Number(row.outflow ?? 0);
  const amount = inflow > 0 ? inflow : outflow;

  if (!amount || amount <= 0) {
    return null;
  }

  const mapped = normalizeCashFlowCategory(row.category);
  const isLoan = mapped.categorySlug === "loan-taken" || mapped.categorySlug === "loan-repaid";

  return {
    type: mapped.type,
    status: "COMPLETED",
    cashFlowDirection: inflow > 0 ? "INFLOW" : "OUTFLOW",
    categorySlug: mapped.categorySlug,
    categoryName: mapped.categoryName,
    amount: amount.toFixed(2),
    description: row.description || mapped.categoryName,
    transactionDate: row.date,
    paymentMethod: "OTHER",
    projectCode: row.projectCode || null,
    debtPersonName: isLoan ? row.description || null : null,
    debtDirection: isLoan ? "PAYABLE" : null,
    source: "EXCEL_IMPORT",
    isSystemGenerated: true
  };
}

export function normalizeSalaryRow(row: RawSalaryRow): NormalizedTransaction | null {
  const amount = Number(row.salaryAmount ?? 0);
  const employeeName = row.employee?.trim();

  if (!amount || amount <= 0 || !employeeName) {
    return null;
  }

  return {
    type: "EXPENSE",
    status: normalizeStatus(row.status),
    cashFlowDirection: "OUTFLOW",
    categorySlug: "salary",
    categoryName: "Salary",
    amount: amount.toFixed(2),
    description: row.description || `Salary to ${employeeName}`,
    transactionDate: row.date,
    paymentMethod: "OTHER",
    projectCode: row.projectCode || null,
    employeeName,
    source: "EXCEL_IMPORT",
    isSystemGenerated: true,
    notes: "Imported from Salary_Register"
  };
}

export function normalizeDebtRows(rows: RawDebtRow[]) {
  const byPerson = new Map<string, { personName: string; given: number; paid: number }>();
  const transactions: NormalizedTransaction[] = [];

  for (const row of rows) {
    const personName = row.person?.trim();
    if (!personName) continue;

    const existing = byPerson.get(personName.toLowerCase()) ?? {
      personName,
      given: 0,
      paid: 0
    };

    const given = Number(row.givenToCompany ?? 0);
    const paid = Number(row.paidBack ?? 0);
    existing.given += given;
    existing.paid += paid;
    byPerson.set(personName.toLowerCase(), existing);

    if (given > 0) {
      transactions.push({
        type: "TRANSFER",
        status: "COMPLETED",
        cashFlowDirection: "INFLOW",
        categorySlug: "loan-taken",
        categoryName: "Loan Taken",
        amount: given.toFixed(2),
        description: `Loan from ${personName}`,
        transactionDate: row.date,
        paymentMethod: "OTHER",
        debtPersonName: personName,
        debtDirection: "PAYABLE",
        source: "EXCEL_IMPORT",
        isSystemGenerated: true,
        notes: "Imported from Debt_Register"
      });
    }

    if (paid > 0) {
      transactions.push({
        type: "TRANSFER",
        status: "COMPLETED",
        cashFlowDirection: "OUTFLOW",
        categorySlug: "loan-repaid",
        categoryName: "Loan Repaid",
        amount: paid.toFixed(2),
        description: `Debt repayment to ${personName}`,
        transactionDate: row.date,
        paymentMethod: "OTHER",
        debtPersonName: personName,
        debtDirection: "PAYABLE",
        source: "EXCEL_IMPORT",
        isSystemGenerated: true,
        notes: "Imported from Debt_Register"
      });
    }
  }

  const debts = Array.from(byPerson.values()).map((debt) => ({
    personName: debt.personName,
    direction: "PAYABLE" as DebtDirection,
    amount: debt.given.toFixed(2),
    paidAmount: debt.paid.toFixed(2),
    remainingAmount: Math.max(debt.given - debt.paid, 0).toFixed(2),
    status: (
      Math.max(debt.given - debt.paid, 0) === 0
        ? "PAID"
        : debt.paid > 0
          ? "PARTIAL"
          : "OPEN"
    ) as DebtStatus
  }));

  return { debts, transactions };
}

export function normalizeOwnerCapitalRow(row: RawOwnerCapitalRow): NormalizedTransaction[] {
  const owner = row.owner?.trim();
  if (!owner) return [];

  const transactions: NormalizedTransaction[] = [];
  const invested = Number(row.invested ?? 0);
  const withdrawn = Number(row.withdrawn ?? 0);

  if (invested > 0) {
    transactions.push({
      type: "CAPITAL",
      status: "COMPLETED",
      cashFlowDirection: "INFLOW",
      categorySlug: "owner-investment",
      categoryName: "Owner Investment",
      amount: invested.toFixed(2),
      description: `Owner investment by ${owner}`,
      transactionDate: row.date,
      paymentMethod: "OTHER",
      source: "EXCEL_IMPORT",
      isSystemGenerated: true,
      notes: "Imported from Owner_Capital"
    });
  }

  if (withdrawn > 0) {
    transactions.push({
      type: "CAPITAL",
      status: "COMPLETED",
      cashFlowDirection: "OUTFLOW",
      categorySlug: "owner-withdrawal",
      categoryName: "Owner Withdrawal",
      amount: withdrawn.toFixed(2),
      description: `Owner withdrawal by ${owner}`,
      transactionDate: row.date,
      paymentMethod: "OTHER",
      source: "EXCEL_IMPORT",
      isSystemGenerated: true,
      notes: "Imported from Owner_Capital"
    });
  }

  return transactions;
}

function normalizeStatus(status?: string | null): TransactionStatus {
  const normalized = status?.trim().toLowerCase();
  if (!normalized || normalized === "paid" || normalized === "completed") {
    return "COMPLETED";
  }
  if (normalized === "pending") return "PENDING";
  if (normalized === "cancelled" || normalized === "canceled") return "CANCELLED";
  return "COMPLETED";
}

function titleCase(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
