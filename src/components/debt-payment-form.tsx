"use client";

import { useActionState } from "react";
import { PaymentMethod } from "@prisma/client";
import { CheckCircle2 } from "lucide-react";
import { recordDebtPayment, type DebtActionState } from "@/lib/actions/debts";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";

const initialState: DebtActionState = { ok: false, message: "" };

export function DebtPaymentForm({
  debtId,
  remainingAmount,
  disabled
}: {
  debtId: string;
  remainingAmount: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(recordDebtPayment, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-cyan-300/10 bg-slate-950/40 p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
      <input type="hidden" name="debtId" value={debtId} />
      <div>
        <Label htmlFor={`amount-${debtId}`}>Amount</Label>
        <Input
          id={`amount-${debtId}`}
          name="amount"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          defaultValue={remainingAmount}
          disabled={disabled}
          required
        />
      </div>
      <div>
        <Label htmlFor={`date-${debtId}`}>Date</Label>
        <Input id={`date-${debtId}`} name="transactionDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} disabled={disabled} required />
      </div>
      <div>
        <Label htmlFor={`payment-${debtId}`}>Payment</Label>
        <Select id={`payment-${debtId}`} name="paymentMethod" defaultValue="OTHER" disabled={disabled}>
          {Object.values(PaymentMethod).map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending || disabled} className="w-full">
        <CheckCircle2 className="h-4 w-4" />
        {pending ? "Saving..." : "Record"}
      </Button>
      {state.message && (
        <p className={state.ok ? "text-sm text-emerald-300 md:col-span-4" : "text-sm text-rose-300 md:col-span-4"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
