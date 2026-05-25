import { TransactionType } from "@prisma/client";
import { PageHeading } from "@/components/page-heading";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionTable } from "@/components/transaction-table";
import { getCategories, getIncomeTransactions } from "@/lib/repositories/transactions";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function IncomePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getIncomeTransactions({
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
        title="Income"
        description="/income is a filtered transaction view where type is INCOME. It does not have separate database logic or persistence."
      />
      <TransactionFilters categories={categories.filter((category) => !category.type || category.type === "INCOME")} defaults={params} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <TransactionTable transactions={transactions} />
        {categories.length ? <TransactionForm categories={categories} defaultType={TransactionType.INCOME} /> : null}
      </div>
    </>
  );
}
