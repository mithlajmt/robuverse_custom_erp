"use server";

import { revalidatePath } from "next/cache";
import {
  CashFlowDirection,
  PaymentMethod,
  TransactionSource,
  TransactionStatus,
  TransactionType
} from "@prisma/client";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus).default("COMPLETED"),
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().min(1),
  transactionDate: z.string().min(1),
  paymentMethod: z.nativeEnum(PaymentMethod).default("OTHER"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});

export type TransactionActionState = {
  ok: boolean;
  message: string;
};

export async function createTransaction(
  _previousState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  try {
    const input = transactionSchema.parse(Object.fromEntries(formData));
    const prisma = getPrisma();

    await prisma.transaction.create({
      data: {
        type: input.type,
        status: input.status,
        cashFlowDirection: inferCashFlowDirection(input.type),
        categoryId: input.categoryId,
        amount: input.amount,
        description: input.description,
        transactionDate: new Date(input.transactionDate),
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber || null,
        notes: input.notes || null,
        source: "MANUAL",
        isSystemGenerated: false
      }
    });

    revalidateFinancialRoutes();
    return { ok: true, message: "Transaction created." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to create transaction." };
  }
}

export async function updateTransaction(
  _previousState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  try {
    const input = transactionSchema.extend({ id: z.string().min(1) }).parse(Object.fromEntries(formData));
    const prisma = getPrisma();

    await prisma.transaction.update({
      where: { id: input.id },
      data: {
        type: input.type,
        status: input.status,
        cashFlowDirection: inferCashFlowDirection(input.type),
        categoryId: input.categoryId,
        amount: input.amount,
        description: input.description,
        transactionDate: new Date(input.transactionDate),
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber || null,
        notes: input.notes || null,
        source: "MANUAL" satisfies TransactionSource
      }
    });

    revalidateFinancialRoutes();
    return { ok: true, message: "Transaction updated." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to update transaction." };
  }
}

function inferCashFlowDirection(type: TransactionType): CashFlowDirection {
  if (type === "INCOME" || type === "CAPITAL") return "INFLOW";
  if (type === "EXPENSE") return "OUTFLOW";
  return "NEUTRAL";
}

export async function softDeleteTransaction(id: string) {
  const prisma = getPrisma();
  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() }
  });
  revalidateFinancialRoutes();
}

export async function createCategoryForImport(name: string, type: TransactionType) {
  const prisma = getPrisma();
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { slug },
    update: { name, type },
    create: { name, slug, type }
  });
}

function revalidateFinancialRoutes() {
  for (const path of ["/dashboard", "/transactions", "/income", "/expense", "/salary", "/debts"]) {
    revalidatePath(path);
  }
}
