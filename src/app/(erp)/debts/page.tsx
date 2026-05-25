import { DebtPaymentForm } from "@/components/debt-payment-form";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DebtsPage() {
  let debts: Array<{
    id: string;
    personName: string;
    amount: unknown;
    paidAmount: unknown;
    remainingAmount: unknown;
    direction: string;
    status: string;
    transactions: Array<{ id: string; amount: unknown; description: string; transactionDate: Date; cashFlowDirection: string }>;
  }> = [];

  try {
    debts = await getPrisma().debt.findMany({
      include: {
        transactions: {
          where: { isDeleted: false },
          orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
          take: 5
        }
      },
      orderBy: [{ status: "asc" }, { personName: "asc" }]
    });
  } catch {
    debts = [];
  }

  const totalRemaining = debts.reduce((sum, debt) => sum + Number(String(debt.remainingAmount)), 0);
  const totalPaid = debts.reduce((sum, debt) => sum + Number(String(debt.paidAmount)), 0);

  return (
    <>
      <PageHeading
        eyebrow="Debt operations"
        title="Debts"
        description="Record partial payments or close debts. Each payment creates a centralized transaction and updates the debt balance."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Open Debt Records" value={String(debts.filter((debt) => debt.status !== "PAID").length)} />
        <Metric label="Total Paid" value={formatCurrency(totalPaid)} />
        <Metric label="Remaining" value={formatCurrency(totalRemaining)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Debt Register</CardTitle>
        </CardHeader>
        <CardContent>
          {debts.length ? (
            <div className="grid gap-4">
              {debts.map((debt) => {
                const remaining = Number(String(debt.remainingAmount));
                const original = Number(String(debt.amount));
                const paid = Number(String(debt.paidAmount));
                const progress = original > 0 ? Math.min(100, Math.round((paid / original) * 100)) : 0;

                return (
                  <div key={debt.id} className="rounded-lg border border-cyan-300/10 bg-white/[0.03] p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_520px] lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-cyan-50">{debt.personName}</p>
                          <Badge>{debt.direction}</Badge>
                          <Badge>{debt.status}</Badge>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <DebtValue label="Original" value={original} />
                          <DebtValue label="Paid" value={paid} />
                          <DebtValue label="Remaining" value={remaining} />
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full bg-cyan-300" style={{ width: `${progress}%` }} />
                        </div>
                        {debt.transactions.length ? (
                          <div className="mt-4 grid gap-2">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Recent payments</p>
                            {debt.transactions.map((transaction) => (
                              <div key={transaction.id} className="flex justify-between gap-3 text-xs text-slate-400">
                                <span>{formatDate(transaction.transactionDate)} · {transaction.description}</span>
                                <span className="font-mono text-cyan-100">{formatCurrency(String(transaction.amount))}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <DebtPaymentForm debtId={debt.id} remainingAmount={String(debt.remainingAmount)} disabled={remaining <= 0 || debt.status === "PAID"} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Import the workbook to seed debt balances.</p>
          )}
        </CardContent>
      </Card>
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

function DebtValue({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-cyan-100">{formatCurrency(value)}</p>
    </div>
  );
}
