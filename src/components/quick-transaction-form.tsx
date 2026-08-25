"use client";

import { useActionState, startTransition, useState } from "react";
import { createTransaction } from "@/lib/actions/transactions";
import { PlusCircle, Loader2 } from "lucide-react";
import { Category, TransactionType, PaymentMethod } from "@prisma/client";

export type QuickTransactionFormProps = {
  categories: Category[];
};

export function QuickTransactionForm({ categories }: QuickTransactionFormProps) {
  const [state, formAction, isPending] = useActionState(createTransaction, {
    ok: false,
    message: ""
  });

  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Filter categories based on transaction type
  const filteredCategories = categories.filter((cat) => cat.type === type);

  // Set default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const related = categories.filter((cat) => cat.type === newType);
    if (related.length > 0) {
      setSelectedCategoryId(related[0].id);
    } else {
      setSelectedCategoryId("");
    }
  };

  // Set initial default category if empty
  if (selectedCategoryId === "" && filteredCategories.length > 0) {
    setSelectedCategoryId(filteredCategories[0].id);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Server validation fields must be present
    formData.set("type", type);
    formData.set("categoryId", selectedCategoryId);
    formData.set("paymentMethod", paymentMethod);
    
    startTransition(() => {
      formAction(formData);
    });

    // Reset some fields if successful
    if (state?.ok) {
      setAmount("");
      setDescription("");
      setReferenceNumber("");
      setNotes("");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <PlusCircle className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-slate-100">Quick Record</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Buttons */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["CAPITAL", "INCOME", "EXPENSE"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  type === t
                    ? t === "CAPITAL"
                      ? "bg-purple-500/10 border-purple-500 text-purple-400 shadow-md shadow-purple-500/5"
                      : t === "INCOME"
                      ? "bg-green-500/10 border-green-500 text-green-400 shadow-md shadow-green-500/5"
                      : "bg-red-500/10 border-red-500 text-red-400 shadow-md shadow-red-500/5"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {t === "CAPITAL" ? "Capital" : t === "INCOME" ? "Income" : "Expense"}
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Amount (INR)
            </label>
            <input
              type="number"
              name="amount"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Date
            </label>
            <input
              type="date"
              name="transactionDate"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              {filteredCategories.length === 0 && (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            >
              <option value="UPI">UPI</option>
              <option value="BANK">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this transaction for?"
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
          />
        </div>

        {/* Collapsible reference and notes details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Ref Number (Optional)
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. TXN10283921"
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal remarks"
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>
        </div>

        {/* Status Message */}
        {state?.message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border ${
              state.ok
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending || filteredCategories.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold text-sm py-2.5 shadow-md shadow-cyan-500/10"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Recording...</span>
            </>
          ) : (
            <span>Record Transaction</span>
          )}
        </button>
      </form>
    </div>
  );
}
