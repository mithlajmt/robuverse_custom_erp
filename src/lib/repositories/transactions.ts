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
    const baseWhere = {
      isDeleted: false,
      status: "COMPLETED" as TransactionStatus
    };
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      income,
      expense,
      capital,
      monthlyIncome,
      monthlyExpense,
      recentTransactions,
      debtTotals,
      salaryPaid,
      totalInflow,
      totalOutflow,
      monthlyTrend,
      categorySpend
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: "INCOME" },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: "EXPENSE" },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: "CAPITAL" },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, cashFlowDirection: "INFLOW", transactionDate: { gte: monthStart } },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, cashFlowDirection: "OUTFLOW", transactionDate: { gte: monthStart } },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        where: { isDeleted: false },
        include: { category: true },
        orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
        take: 8
      }),
      prisma.debt.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { remainingAmount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          type: "EXPENSE",
          OR: [
            { category: { slug: "salary" } },
            { description: { contains: "salary", mode: "insensitive" } }
          ]
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, cashFlowDirection: "INFLOW" },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, cashFlowDirection: "OUTFLOW" },
        _sum: { amount: true }
      }),
      prisma.$queryRaw<Array<{ month: Date; income: Prisma.Decimal; expense: Prisma.Decimal }>>`
        SELECT
          date_trunc('month', "transactionDate") as month,
          SUM(CASE WHEN "cashFlowDirection" = 'INFLOW' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN "cashFlowDirection" = 'OUTFLOW' THEN amount ELSE 0 END) as expense
        FROM "Transaction"
        WHERE "isDeleted" = false AND status = 'COMPLETED'
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { ...baseWhere, type: "EXPENSE" },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 6
      })
    ]);

    const categories = await prisma.category.findMany({
      where: { id: { in: categorySpend.map((item) => item.categoryId) } }
    });
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    return {
      totalIncome: toNumber(totalInflow._sum.amount),
      totalExpense: toNumber(totalOutflow._sum.amount),
      totalCapital: toNumber(capital._sum.amount),
      monthlyIncome: toNumber(monthlyIncome._sum.amount),
      monthlyExpense: toNumber(monthlyExpense._sum.amount),
      currentBalance: toNumber(totalInflow._sum.amount) - toNumber(totalOutflow._sum.amount),
      netProfit: toNumber(income._sum.amount) - toNumber(expense._sum.amount),
      pendingDebts: toNumber(debtTotals._sum.remainingAmount),
      salaryPaid: toNumber(salaryPaid._sum.amount),
      recentTransactions,
      monthlyTrend: monthlyTrend.map((item) => ({
        month: item.month.toISOString().slice(0, 7),
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
      pendingDebts: 0,
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
