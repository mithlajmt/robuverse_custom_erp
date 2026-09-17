"use client";

import { useState } from "react";
import { SerializedDebt } from "@/components/debt-card";
import { DebtPaymentForm } from "@/components/debt-payment-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, History, Calendar, CreditCard } from "lucide-react";

type DebtTableProps = {
  debts: SerializedDebt[];
};

export function DebtTable({ debts }: DebtTableProps) {
  const [selectedDebt, setSelectedDebt] = useState<SerializedDebt | null>(null);

  // Filtering states
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "RECEIVABLE" | "PAYABLE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNPAID" | "PAID">("ALL");

  const closeModal = () => setSelectedDebt(null);

  // Filter debts
  const filteredDebts = debts.filter((debt) => {
    if (directionFilter !== "ALL" && debt.direction !== directionFilter) {
      return false;
    }
    if (statusFilter === "UNPAID" && debt.status === "PAID") {
      return false;
    }
    if (statusFilter === "PAID" && debt.status !== "PAID") {
      return false;
    }
    return true;
  });

  // Calculate filtered totals
  const filteredTotal = filteredDebts.reduce((sum, d) => sum + Number(d.amount), 0);
  const filteredPaid = filteredDebts.reduce((sum, d) => sum + Number(d.paidAmount), 0);
  const filteredRemaining = filteredDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0);

  // Parse details for the selected debt modal if open
  const amount = selectedDebt ? Number(selectedDebt.amount) : 0;
  const paidAmount = selectedDebt ? Number(selectedDebt.paidAmount) : 0;
  const remainingAmount = selectedDebt ? Number(selectedDebt.remainingAmount) : 0;
  const progressPercent = amount > 0 ? Math.min(100, Math.round((paidAmount / amount) * 100)) : 0;

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
      {/* Filters Toolbar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Account Type Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setDirectionFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              directionFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setDirectionFilter("RECEIVABLE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              directionFilter === "RECEIVABLE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            To Get (Debtors)
          </button>
          <button
            onClick={() => setDirectionFilter("PAYABLE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              directionFilter === "PAYABLE"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            To Give (Creditors)
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter("UNPAID")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "UNPAID"
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("PAID")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === "PAID"
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Settled
          </button>
        </div>
      </div>

      {/* Filter Sums Banner */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
        <div>
          Showing <strong className="text-slate-900 font-bold">{filteredDebts.length}</strong> of {debts.length} records
        </div>
        <div className="flex gap-4">
          <span>Total: <strong className="text-slate-900 font-bold">{formatCurrency(filteredTotal)}</strong></span>
          <span>Remaining: <strong className="text-rose-600 font-bold">{formatCurrency(filteredRemaining)}</strong></span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-5">Account Type</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Total Amount</th>
              <th className="py-3.5 px-5 text-right text-emerald-700">Paid</th>
              <th className="py-3.5 px-5 text-right text-rose-700">Remaining</th>
              <th className="py-3.5 px-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {filteredDebts.map((debt) => {
              const dAmount = Number(debt.amount);
              const dPaid = Number(debt.paidAmount);
              const dRemaining = Number(debt.remainingAmount);
              const dProgress = dAmount > 0 ? Math.min(100, Math.round((dPaid / dAmount) * 100)) : 0;

              return (
                <tr
                  key={debt.id}
                  onClick={() => setSelectedDebt(debt)}
                  className="hover:bg-indigo-50/30 cursor-pointer transition duration-150"
                >
                  {/* Name & Note */}
                  <td className="py-3.5 px-5">
                    <div className="font-extrabold text-slate-900 text-xs md:text-sm">{debt.personName}</div>
                    {debt.notes && (
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5 italic">
                        {debt.notes}
                      </div>
                    )}
                  </td>

                  {/* Direction */}
                  <td className="py-3.5 px-5">
                    <span
                      className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                        debt.direction === "RECEIVABLE"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-indigo-50 border-indigo-200 text-indigo-700"
                      }`}
                    >
                      {debt.direction === "RECEIVABLE" ? "Debtor (Get)" : "Creditor (Give)"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <span
                      className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                        debt.status === "PAID"
                          ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                          : debt.status === "PARTIAL"
                          ? "bg-amber-100 border-amber-200 text-amber-800"
                          : "bg-rose-100 border-rose-200 text-rose-800"
                      }`}
                    >
                      {debt.status}
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="py-3.5 px-5 text-right font-mono text-xs font-semibold text-slate-700">
                    {formatCurrency(dAmount)}
                  </td>

                  {/* Paid Amount */}
                  <td className="py-3.5 px-5 text-right font-mono text-xs font-bold text-emerald-700">
                    {formatCurrency(dPaid)}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">({dProgress}%)</span>
                  </td>

                  {/* Remaining Amount */}
                  <td className="py-3.5 px-5 text-right font-mono text-xs font-extrabold text-rose-600">
                    {formatCurrency(dRemaining)}
                  </td>

                  {/* Quick Action Button */}
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDebt(debt);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg transition"
                    >
                      Pay / View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Popup Panel */}
      {selectedDebt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in">
          <div
            onClick={closeModal}
            className="absolute inset-0"
          />

          <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="pr-8 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">{selectedDebt.personName}</h3>

                <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md border ${
                  selectedDebt.direction === "RECEIVABLE"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-indigo-50 border-indigo-200 text-indigo-700"
                }`}>
                  {selectedDebt.direction === "RECEIVABLE" ? "Debtor" : "Creditor"}
                </span>

                <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md border ${
                  selectedDebt.status === "PAID"
                    ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                    : selectedDebt.status === "PARTIAL"
                    ? "bg-amber-100 border-amber-200 text-amber-800"
                    : "bg-rose-100 border-rose-200 text-rose-800"
                }`}>
                  {selectedDebt.status}
                </span>
              </div>

              {selectedDebt.notes && (
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 italic">
                  &ldquo;{selectedDebt.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Progress and Numbers */}
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatCurrency(amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Paid</p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{formatCurrency(paidAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Remaining</p>
                  <p className="text-sm font-extrabold text-rose-600 mt-0.5">{formatCurrency(remainingAmount)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative pt-1">
                <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-100 border border-slate-200">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      selectedDebt.direction === "RECEIVABLE" ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                  />
                </div>
                <div className="flex justify-end text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  {progressPercent}% Settled
                </div>
              </div>
            </div>

            {/* Content Splitter */}
            <div className="space-y-5">
              {/* Payment History Sub-Table */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  <span>Transaction History</span>
                </div>

                {selectedDebt.transactions.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDebt.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-700 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{formatDate(tx.transactionDate)}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                                {tx.paymentMethod}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 font-mono">
                              {formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    No transactions recorded for this account.
                  </p>
                )}
              </div>

              {/* Payoff Action Form */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  <span>Record Payoff Transaction</span>
                </div>
                <DebtPaymentForm
                  debtId={selectedDebt.id}
                  remainingAmount={remainingAmount.toString()}
                  disabled={remainingAmount <= 0 || selectedDebt.status === "PAID"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
