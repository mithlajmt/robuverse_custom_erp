import { PageHeading } from "@/components/page-heading";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionTable } from "@/components/transaction-table";
import { getCategories, getTransactions } from "@/lib/repositories/transactions";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getTransactions({
      query: params.query,
      categoryId: params.categoryId,
      from: params.from,
      to: params.to
    })
  ]);

  return (
    <>
      <PageHeading
        eyebrow="Central ledger"
        title="Transactions"
        description="Every financial event originates here. Income, expense, salary, capital, debt, and project views are filters over this same data."
      />
      <TransactionFilters categories={categories} defaults={params} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <TransactionTable transactions={transactions} />
        {categories.length ? <TransactionForm categories={categories} /> : null}
      </div>
    </>
  );
}
