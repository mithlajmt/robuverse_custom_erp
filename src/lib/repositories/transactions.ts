import {
  Prisma,
  TransactionStatus,
  TransactionType
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type TransactionFilters = {
  type?: TransactionType;
  status?: TransactionStatus;
  query?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

export async function getTransactions(filters: TransactionFilters = {}) {
  try {
    const prisma = getPrisma();
    const where = buildWhere(filters);

    return await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        employee: true,
        project: true,
        debt: true
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      take: 200
    });
  } catch (error) {
    console.error("Error in getTransactions:", error);
    return [];
  }
}

export function getIncomeTransactions(filters: Omit<TransactionFilters, "type"> = {}) {
  return getTransactions({ ...filters, type: "INCOME" });
}

export function getExpenseTransactions(filters: Omit<TransactionFilters, "type"> = {}) {
  return getTransactions({ ...filters, type: "EXPENSE" });
}

export async function getCategories() {
  try {
    return await getPrisma().category.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
}

export async function getEmployees() {
  try {
    return await getPrisma().employee.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("Error in getEmployees:", error);
    return [];
  }
}

export async function getDashboardSummary() {
  try {
    const prisma = getPrisma();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Optimized consolidated queries to prevent database connection pool exhaustion
    const [stats, debtStats, salaryStats, recentTransactions, monthlyTrend, categorySpend] = await Promise.all([
      // 1. Transaction aggregations by Type & Cashflow
      prisma.$queryRaw<Array<{
        type: TransactionType;
        direction: string;
        total: Prisma.Decimal;
        monthlyTotal: Prisma.Decimal;
      }>>`
        SELECT 
          type,
          "cashFlowDirection" as direction,
          COALESCE(SUM(amount), 0) as total,
          COALESCE(SUM(CASE WHEN "transactionDate" >= ${monthStart} THEN amount ELSE 0 END), 0) as "monthlyTotal"
        FROM "Transaction"
        WHERE "isDeleted" = false AND status = 'COMPLETED'
        GROUP BY type, "cashFlowDirection"
      `,

      // 2. Debt aggregations by Direction
      prisma.$queryRaw<Array<{
        direction: string;
        totalRemaining: Prisma.Decimal;
      }>>`
        SELECT 
          direction,
          COALESCE(SUM("remainingAmount"), 0) as "totalRemaining"
        FROM "Debt"
        WHERE status != 'CANCELLED'
        GROUP BY direction
      `,

      // 3. Salary expense total
      prisma.transaction.aggregate({
        where: {
          isDeleted: false,
          status: "COMPLETED",
          type: "EXPENSE",
          OR: [
            { category: { slug: "salary" } },
            { description: { contains: "salary", mode: "insensitive" } }
          ]
        },
        _sum: { amount: true }
      }),

      // 4. Recent transactions
      prisma.transaction.findMany({
        where: { isDeleted: false },
        include: { category: true },
        orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
        take: 8
      }),

      // 5. Monthly trend
      prisma.$queryRaw<Array<{ month: Date; income: Prisma.Decimal; expense: Prisma.Decimal }>>`
        SELECT
          date_trunc('month', "transactionDate") as month,
          COALESCE(SUM(CASE WHEN "cashFlowDirection" = 'INFLOW' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN "cashFlowDirection" = 'OUTFLOW' THEN amount ELSE 0 END), 0) as expense
        FROM "Transaction"
        WHERE "isDeleted" = false AND status = 'COMPLETED'
        GROUP BY 1
        ORDER BY 1 ASC
      `,

      // 6. Spend by category
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { isDeleted: false, status: "COMPLETED", type: "EXPENSE" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 6
      })
    ]);

    // Parse aggregated stat rows
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCapital = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const row of stats) {
      const val = toNumber(row.total);
      const mVal = toNumber(row.monthlyTotal);

      if (row.direction === "INFLOW") {
        totalIncome += val;
        monthlyIncome += mVal;
      } else if (row.direction === "OUTFLOW") {
        totalExpense += val;
        monthlyExpense += mVal;
      }

      if (row.type === "CAPITAL") {
        totalCapital += val;
      }
    }

    let totalReceivables = 0;
    let totalPayables = 0;
    for (const d of debtStats) {
      if (d.direction === "RECEIVABLE") {
        totalReceivables += toNumber(d.totalRemaining);
      } else if (d.direction === "PAYABLE") {
        totalPayables += toNumber(d.totalRemaining);
      }
    }

    // Category names lookup
    const categories = categorySpend.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categorySpend.map((item) => item.categoryId) } }
        })
      : [];
    const categoryById = new Map(categories.map((c) => [c.id, c]));

    const currentBalance = totalCapital + totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      totalCapital,
      monthlyIncome,
      monthlyExpense,
      currentBalance,
      netProfit: totalIncome - totalExpense,
      totalReceivables,
      totalPayables,
      salaryPaid: toNumber(salaryStats._sum.amount),
      recentTransactions,
      monthlyTrend: monthlyTrend.map((item) => ({
        month: item.month ? item.month.toISOString().slice(0, 7) : "",
        income: toNumber(item.income),
        expense: toNumber(item.expense)
      })),
      categorySpend: categorySpend.map((item) => ({
        name: categoryById.get(item.categoryId)?.name ?? "Uncategorized",
        amount: toNumber(item._sum.amount)
      }))
    };
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      totalCapital: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      currentBalance: 0,
      netProfit: 0,
      totalReceivables: 0,
      totalPayables: 0,
      salaryPaid: 0,
      recentTransactions: [],
      monthlyTrend: [],
      categorySpend: []
    };
  }
}

function buildWhere(filters: TransactionFilters): Prisma.TransactionWhereInput {
  return {
    isDeleted: false,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.query
      ? {
          OR: [
            { description: { contains: filters.query, mode: "insensitive" } },
            { notes: { contains: filters.query, mode: "insensitive" } },
            { referenceNumber: { contains: filters.query, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(filters.from || filters.to
      ? {
          transactionDate: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {})
          }
        }
      : {})
  };
}

function toNumber(value: Prisma.Decimal | null | undefined) {
  return value ? Number(value.toString()) : 0;
}
