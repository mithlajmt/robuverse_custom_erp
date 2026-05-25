import { Transaction } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

type TransactionWithCategory = Transaction & {
  category?: { name: string } | null;
  employee?: { name: string } | null;
  project?: { name: string } | null;
};

export function TransactionTable({ transactions }: { transactions: TransactionWithCategory[] }) {
  if (!transactions.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm font-medium text-cyan-50">No transactions found</p>
          <p className="mt-2 text-sm text-slate-400">Add a transaction or import the Excel workbook to populate this view.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-cyan-300/10 bg-cyan-300/5 text-xs uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Cash</th>
              <th className="px-5 py-4">Source</th>
              <th className="px-5 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-300/10">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="text-slate-300">
                <td className="px-5 py-4 font-mono text-xs text-slate-400">{formatDate(transaction.transactionDate)}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-cyan-50">{transaction.description}</p>
                  {transaction.employee?.name && <p className="mt-1 text-xs text-slate-500">{transaction.employee.name}</p>}
                </td>
                <td className="px-5 py-4">{transaction.category?.name ?? "Uncategorized"}</td>
                <td className="px-5 py-4"><Badge>{transaction.status}</Badge></td>
                <td className="px-5 py-4"><Badge>{transaction.cashFlowDirection}</Badge></td>
                <td className="px-5 py-4 text-xs text-slate-400">{transaction.source}</td>
                <td className="px-5 py-4 text-right font-mono font-semibold text-cyan-100">{formatCurrency(transaction.amount.toString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="rounded-lg border border-cyan-300/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-cyan-50">{transaction.description}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(transaction.transactionDate)} · {transaction.category?.name}</p>
              </div>
              <p className="font-mono font-semibold text-cyan-100">{formatCurrency(transaction.amount.toString())}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{transaction.type}</Badge>
              <Badge>{transaction.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
