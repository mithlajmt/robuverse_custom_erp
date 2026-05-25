import { Prisma } from "@prisma/client";
import { EmployeeForm, SalaryPaymentForm } from "@/components/salary-forms";
import { PageHeading } from "@/components/page-heading";
import { TransactionTable } from "@/components/transaction-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

type SalaryTransaction = Prisma.TransactionGetPayload<{
  include: { category: true; employee: true; project: true; debt: true };
}>;

export default async function SalaryPage() {
  const prisma = getPrisma();
  let employees: Array<{ id: string; name: string; phone: string | null; role: string | null; salaryType: string | null }> = [];
  let transactions: SalaryTransaction[] = [];

  try {
    [employees, transactions] = await Promise.all([
      prisma.employee.findMany({ orderBy: { name: "asc" } }),
      prisma.transaction.findMany({
        where: {
          isDeleted: false,
          type: "EXPENSE",
          OR: [
            { category: { slug: "salary" } },
            { description: { contains: "salary", mode: "insensitive" } }
          ]
        },
        include: { category: true, employee: true, project: true, debt: true },
        orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
        take: 300
      })
    ]);
  } catch {
    employees = [];
    transactions = [];
  }

  const employeeSummaries = employees.map((employee) => {
    const employeeTransactions = transactions.filter((transaction) => transaction.employeeId === employee.id);
    const totalPaid = employeeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount.toString()), 0);
    const lastPaid = employeeTransactions[0]?.transactionDate ?? null;
    return { ...employee, totalPaid, lastPaid, paymentCount: employeeTransactions.length };
  });
  const totalSalaryPaid = transactions.reduce((sum, transaction) => sum + Number(transaction.amount.toString()), 0);

  return (
    <>
      <PageHeading
        eyebrow="Salary operations"
        title="Salary"
        description="Salary payments are centralized expense transactions linked to employees, dates, descriptions, and payment methods."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Employees" value={String(employees.length)} />
        <Metric label="Salary Paid" value={formatCurrency(totalSalaryPaid)} />
        <Metric label="Salary Entries" value={String(transactions.length)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent>
              {employeeSummaries.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {employeeSummaries.map((employee) => (
                    <div key={employee.id} className="rounded-lg border border-cyan-300/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-cyan-50">{employee.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{employee.role || "No role"} · {employee.salaryType || "Salary type not set"}</p>
                        </div>
                        <p className="font-mono text-sm font-semibold text-cyan-100">{formatCurrency(employee.totalPaid)}</p>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {employee.paymentCount} payments{employee.lastPaid ? ` · Last ${formatDate(employee.lastPaid)}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No employees found. Add employees or import the salary register.</p>
              )}
            </CardContent>
          </Card>
          <section>
            <h2 className="mb-3 text-base font-semibold text-cyan-50">Salary Payment History</h2>
            <TransactionTable transactions={transactions} />
          </section>
        </section>
        <aside className="grid content-start gap-5">
          <SalaryPaymentForm employees={employees} />
          <EmployeeForm />
        </aside>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-cyan-100">{value}</p>
      </CardContent>
    </Card>
  );
}
