import { describe, expect, it } from "vitest";
import {
  normalizeCashFlowCategory,
  normalizeCashFlowRow,
  normalizeDebtRows,
  normalizeOwnerCapitalRow,
  normalizeSalaryRow
} from "@/lib/excel-normalizer";

describe("excel normalizer", () => {
  it("maps cash-flow categories to transaction enums", () => {
    expect(normalizeCashFlowCategory("Income").type).toBe("INCOME");
    expect(normalizeCashFlowCategory("expense").type).toBe("EXPENSE");
    expect(normalizeCashFlowCategory("Owner_Investment").type).toBe("CAPITAL");
    expect(normalizeCashFlowCategory("Loan_taken").type).toBe("TRANSFER");
  });

  it("uses inflow or outflow as Decimal-ready string amounts", () => {
    const income = normalizeCashFlowRow({
      date: new Date("2026-02-01"),
      category: "Income",
      description: "exhibition",
      inflow: 3250,
      outflow: null
    });
    const expense = normalizeCashFlowRow({
      date: new Date("2026-02-01"),
      category: "Expense",
      description: "petrol",
      inflow: null,
      outflow: 500
    });

    expect(income?.amount).toBe("3250.00");
    expect(income?.type).toBe("INCOME");
    expect(expense?.amount).toBe("500.00");
    expect(expense?.type).toBe("EXPENSE");
  });

  it("normalizes salary rows as expense transactions", () => {
    const transaction = normalizeSalaryRow({
      date: new Date("2026-03-22"),
      employee: "unni",
      salaryAmount: 5000,
      status: "paid",
      description: "March salary"
    });

    expect(transaction?.type).toBe("EXPENSE");
    expect(transaction?.categorySlug).toBe("salary");
    expect(transaction?.employeeName).toBe("unni");
    expect(transaction?.status).toBe("COMPLETED");
  });

  it("rolls debt rows into payable balances and transaction history", () => {
    const result = normalizeDebtRows([
      { date: new Date("2026-01-01"), person: "matta", givenToCompany: 1000, paidBack: null },
      { date: new Date("2026-01-02"), person: "matta", givenToCompany: null, paidBack: 250 }
    ]);

    expect(result.debts[0]).toMatchObject({
      personName: "matta",
      amount: "1000.00",
      paidAmount: "250.00",
      remainingAmount: "750.00"
    });
    expect(result.transactions).toHaveLength(2);
  });

  it("normalizes owner capital into capital transactions", () => {
    const transactions = normalizeOwnerCapitalRow({
      date: new Date("2025-10-31"),
      owner: "unni",
      invested: 11053,
      withdrawn: null
    });

    expect(transactions[0]).toMatchObject({
      type: "CAPITAL",
      categorySlug: "owner-investment",
      amount: "11053.00"
    });
  });
});
