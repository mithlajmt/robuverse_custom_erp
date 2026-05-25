import { TransactionType } from "@prisma/client";
import { PageHeading } from "@/components/page-heading";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionTable } from "@/components/transaction-table";
import { getCategories, getExpenseTransactions } from "@/lib/repositories/transactions";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ExpensePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getExpenseTransactions({
      query: params.query,
      categoryId: params.categoryId,
      from: params.from,
      to: params.to
    })
  ]);

  return (
    <>
      <PageHeading
        eyebrow="Filtered ledger"
        title="Expense"
        description="/expense is a filtered transaction view where type is EXPENSE. Salary payments also appear here because salary is an expense transaction."
      />
      <TransactionFilters categories={categories.filter((category) => !category.type || category.type === "EXPENSE")} defaults={params} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <TransactionTable transactions={transactions} />
        {categories.length ? <TransactionForm categories={categories} defaultType={TransactionType.EXPENSE} /> : null}
      </div>
    </>
  );
}
