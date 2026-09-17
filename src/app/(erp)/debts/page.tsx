import { getPrisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { CollapsibleDebtForm } from "@/components/collapsible-debt-form";
import { DebtTable } from "@/components/debt-table";
import { type SerializedDebt } from "@/components/debt-card";
import {
  Layers,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { DebtDirection, DebtStatus, Debt, Transaction } from "@prisma/client";

export const dynamic = "force-dynamic";

type DebtWithTransactions = Debt & {
  transactions: Transaction[];
};

export default async function DebtsPage() {
  const prisma = getPrisma();
  
  let debts: DebtWithTransactions[] = [];
  try {
    debts = await prisma.debt.findMany({
      include: {
        transactions: {
          where: { isDeleted: false },
          orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
          take: 5
        }
      },
      orderBy: [
        { status: "asc" }, // OPEN/PARTIAL first, PAID last
        { updatedAt: "desc" }
      ]
    });
  } catch (error) {
    console.error("Error fetching debts:", error);
  }

  // Serialize Prisma objects to plain JSON-compatible objects
  const serializedDebts: SerializedDebt[] = debts.map((d) => ({
    id: d.id,
    personName: d.personName,
    direction: d.direction,
    amount: d.amount.toString(),
    paidAmount: d.paidAmount.toString(),
    remainingAmount: d.remainingAmount.toString(),
    status: d.status,
    notes: d.notes,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    transactions: d.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      status: tx.status,
      cashFlowDirection: tx.cashFlowDirection,
      amount: tx.amount.toString(),
      description: tx.description,
      transactionDate: tx.transactionDate.toISOString(),
      paymentMethod: tx.paymentMethod,
      referenceNumber: tx.referenceNumber,
      notes: tx.notes,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString()
    }))
  }));

  // Calculate totals
  const openAccountsCount = serializedDebts.filter((d) => d.status !== "PAID").length;
  
  const totalPayable = serializedDebts
    .filter((d) => d.direction === "PAYABLE" && d.status !== "PAID")
    .reduce((sum, d) => sum + Number(d.remainingAmount), 0);

  const totalReceivable = serializedDebts
    .filter((d) => d.direction === "RECEIVABLE" && d.status !== "PAID")
    .reduce((sum, d) => sum + Number(d.remainingAmount), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Debts & Credit Operations</p>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
          Creditors & Debtors
        </h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
          Track outstanding payables and receivables, manage initial/partial payments, and review payment history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-5">
        {/* Open Accounts Count */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 md:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            {/* Responsive Label */}
            <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-wider">Open Accounts</span>
            <span className="sm:hidden text-[9px] font-bold text-slate-400 uppercase tracking-wider">Open</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
              <Layers className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="mt-2.5 md:mt-4">
            <p className="text-sm sm:text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {openAccountsCount}
            </p>
            <p className="hidden sm:block text-xs text-slate-500 font-medium mt-1">Active ledger files</p>
            <p className="sm:hidden text-[8px] text-slate-500 mt-0.5">Active files</p>
          </div>
        </div>

        {/* Total Receivables (Get Money) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 md:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            {/* Responsive Label */}
            <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-wider">Receivables (Get)</span>
            <span className="sm:hidden text-[9px] font-bold text-slate-400 uppercase tracking-wider">To Get</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="mt-2.5 md:mt-4">
            <p className="text-sm sm:text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalReceivable)}
            </p>
            <p className="hidden sm:block text-xs text-slate-500 font-medium mt-1">To collect</p>
            <p className="sm:hidden text-[8px] text-slate-500 mt-0.5">Receivable</p>
          </div>
        </div>

        {/* Total Payables (Give Money) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 md:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            {/* Responsive Label */}
            <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-wider">Payables (Give)</span>
            <span className="sm:hidden text-[9px] font-bold text-slate-400 uppercase tracking-wider">To Give</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 shrink-0">
              <TrendingDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="mt-2.5 md:mt-4">
            <p className="text-sm sm:text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalPayable)}
            </p>
            <p className="hidden sm:block text-xs text-slate-500 font-medium mt-1">Owed to others</p>
            <p className="sm:hidden text-[8px] text-slate-500 mt-0.5">Owed</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Debts Register List */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900">Accounts Register</h2>

          {serializedDebts.length > 0 ? (
            <DebtTable debts={serializedDebts} />
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm h-64 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No active accounts found.</p>
              <p className="text-xs text-slate-400 mt-1">
                Use the &ldquo;Create New Account&rdquo; panel to log new payables or receivables.
              </p>
            </div>
          )}
        </div>

        {/* Add Debt Record Collapsible Sidebar Panel */}
        <div className="xl:col-span-1">
          <CollapsibleDebtForm />
        </div>
      </div>
    </div>
  );
}
