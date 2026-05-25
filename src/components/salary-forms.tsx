"use client";

import { useActionState } from "react";
import { PaymentMethod } from "@prisma/client";
import { Plus, WalletCards } from "lucide-react";
import { createEmployee, recordSalaryPayment, type SalaryActionState } from "@/lib/actions/salary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

const initialState: SalaryActionState = { ok: false, message: "" };

export function SalaryPaymentForm({
  employees
}: {
  employees: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(recordSalaryPayment, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Salary Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div>
            <Label htmlFor="employeeId">Employee</Label>
            <Select id="employeeId" name="employeeId" required defaultValue={employees[0]?.id ?? ""}>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" min="0" step="0.01" inputMode="decimal" required />
            </div>
            <div>
              <Label htmlFor="transactionDate">Date</Label>
              <Input id="transactionDate" name="transactionDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment</Label>
            <Select id="paymentMethod" name="paymentMethod" defaultValue="OTHER">
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Salary paid for March, workshop support..." />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Optional salary context" />
          </div>
          {state.message && <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>{state.message}</p>}
          <Button type="submit" disabled={pending || employees.length === 0}>
            <WalletCards className="h-4 w-4" />
            {pending ? "Saving..." : "Record Salary"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function EmployeeForm() {
  const [state, action, pending] = useActionState(createEmployee, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Employee name" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="Trainer, maker..." />
            </div>
          </div>
          <div>
            <Label htmlFor="salaryType">Salary Type</Label>
            <Input id="salaryType" name="salaryType" placeholder="Monthly, event, freelance..." />
          </div>
          {state.message && <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>{state.message}</p>}
          <Button type="submit" variant="secondary" disabled={pending}>
            <Plus className="h-4 w-4" />
            {pending ? "Adding..." : "Add Employee"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
