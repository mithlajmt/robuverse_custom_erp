"use client";

import { useActionState, startTransition, useState } from "react";
import { PaymentMethod } from "@prisma/client";
import { recordDebtPayment } from "@/lib/actions/debts";
import { CheckCircle2, Loader2 } from "lucide-react";

export type DebtPaymentFormProps = {
  debtId: string;
  remainingAmount: string;
  disabled?: boolean;
};

export function DebtPaymentForm({ debtId, remainingAmount, disabled = false }: DebtPaymentFormProps) {
  const [state, formAction, isPending] = useActionState(recordDebtPayment, {
    ok: false,
    message: ""
  });

  const [amount, setAmount] = useState(remainingAmount);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("paymentMethod", paymentMethod);

    startTransition(() => {
      formAction(formData);
    });

    if (state?.ok) {
      setAmount("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-4"
    >
      <input type="hidden" name="debtId" value={debtId} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Amount */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Amount (INR)
          </label>
          <input
            type="number"
            name="amount"
            required
            min="0.01"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled || isPending}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none transition disabled:opacity-50"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Payment Date
          </label>
          <input
            type="date"
            name="transactionDate"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            disabled={disabled || isPending}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none transition disabled:opacity-50"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            disabled={disabled || isPending}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-lg py-2 px-2 text-xs font-semibold focus:outline-none transition disabled:opacity-50"
          >
            <option value="UPI">UPI</option>
            <option value="BANK">Bank</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Button & Feedback */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
        <div className="min-w-0">
          {state?.message && (
            <p
              className={`text-xs font-bold truncate ${
                state.ok ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {state.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || isPending}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-xs font-extrabold shadow-md shadow-indigo-500/20 transition disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Recording...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Record Payment</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
