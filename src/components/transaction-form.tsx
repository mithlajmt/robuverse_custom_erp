"use client";

import { useActionState } from "react";
import { PaymentMethod, TransactionStatus, TransactionType } from "@prisma/client";
import { Plus } from "lucide-react";
import { createTransaction, type TransactionActionState } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

const initialState: TransactionActionState = { ok: false, message: "" };

export function TransactionForm({
  categories,
  defaultType
}: {
  categories: Array<{ id: string; name: string; type: TransactionType | null }>;
  defaultType?: TransactionType;
}) {
  const [state, action, pending] = useActionState(createTransaction, initialState);
  const filteredCategories = defaultType ? categories.filter((category) => !category.type || category.type === defaultType) : categories;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Transaction Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue={defaultType ?? "EXPENSE"}>
                {Object.values(TransactionType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue="COMPLETED">
                {Object.values(TransactionStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" required defaultValue={filteredCategories[0]?.id ?? ""}>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" min="0" step="0.01" inputMode="decimal" required placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="transactionDate">Date</Label>
              <Input id="transactionDate" name="transactionDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required placeholder="Workshop payment, petrol, salary..." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="paymentMethod">Payment</Label>
              <Select id="paymentMethod" name="paymentMethod" defaultValue="OTHER">
                {Object.values(PaymentMethod).map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="referenceNumber">Reference</Label>
              <Input id="referenceNumber" name="referenceNumber" placeholder="UPI ref, cheque no." />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Optional context for accountant or internal review" />
          </div>
          {state.message && <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>{state.message}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            <Plus className="h-4 w-4" />
            {pending ? "Saving..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
