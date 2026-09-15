"use server";

import { revalidatePath } from "next/cache";
import { DebtDirection, DebtStatus, PaymentMethod } from "@prisma/client";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

export type DebtActionState = {
  ok: boolean;
  message: string;
};

const createDebtSchema = z.object({
  personName: z.string().min(1, "Name is required"),
  direction: z.nativeEnum(DebtDirection),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paidAmount: z.coerce.number().nonnegative("Paid amount cannot be negative").default(0),
  notes: z.string().optional()
});

const debtPaymentSchema = z.object({
  debtId: z.string().min(1),
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  transactionDate: z.string().min(1, "Date is required"),
  paymentMethod: z.nativeEnum(PaymentMethod).default("OTHER"),
  description: z.string().optional(),
  notes: z.string().optional()
});

export async function createDebt(
  _previousState: DebtActionState,
  formData: FormData
): Promise<DebtActionState> {
  try {
    const rawData = Object.fromEntries(formData);
    const input = createDebtSchema.parse(rawData);

    if (input.paidAmount > input.amount) {
      return { ok: false, message: "Paid amount cannot exceed the total original debt amount." };
    }

    const prisma = getPrisma();
    const remainingAmount = input.amount - input.paidAmount;
    
    let status: DebtStatus = "OPEN";
    if (remainingAmount === 0) {
      status = "PAID";
    } else if (input.paidAmount > 0) {
      status = "PARTIAL";
    }

    await prisma.debt.create({
      data: {
        personName: input.personName.trim(),
        direction: input.direction,
        amount: input.amount,
        paidAmount: input.paidAmount,
        remainingAmount: remainingAmount,
        status,
        notes: input.notes || null
      }
    });

    revalidateDebtRoutes();
    return { ok: true, message: "Debt record created successfully." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to create debt record."
    };
  }
}

export async function recordDebtPayment(
  _previousState: DebtActionState,
  formData: FormData
): Promise<DebtActionState> {
  try {
    const input = debtPaymentSchema.parse(Object.fromEntries(formData));
    const prisma = getPrisma();
    const debt = await prisma.debt.findUnique({ where: { id: input.debtId } });

    if (!debt) {
      return { ok: false, message: "Debt record not found." };
    }

    const remaining = Number(debt.remainingAmount.toString());
    if (input.amount > remaining) {
      return { ok: false, message: `Payment amount is higher than the remaining balance (${remaining}).` };
    }

    const categorySlug = debt.direction === "PAYABLE" ? "loan-repaid" : "loan-taken";
    const categoryName = debt.direction === "PAYABLE" ? "Loan Repaid" : "Receivable Collected";
    const categoryType = "TRANSFER" as const;
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: { name: categoryName, type: categoryType },
      create: { slug: categorySlug, name: categoryName, type: categoryType }
    });

    const newPaidAmount = Number(debt.paidAmount.toString()) + input.amount;
    const newRemainingAmount = Math.max(remaining - input.amount, 0);

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          type: "TRANSFER",
          status: "COMPLETED",
          cashFlowDirection: debt.direction === "PAYABLE" ? "OUTFLOW" : "INFLOW",
          categoryId: category.id,
          amount: input.amount,
          description:
            input.description ||
            defaultDebtDescription(debt.personName, debt.direction, newRemainingAmount === 0),
          transactionDate: new Date(input.transactionDate),
          paymentMethod: input.paymentMethod,
          debtId: debt.id,
          source: "DEBT_MODULE",
          isSystemGenerated: false,
          notes: input.notes || null
        }
      }),
      prisma.debt.update({
        where: { id: debt.id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newRemainingAmount === 0 ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "OPEN"
        }
      })
    ]);

    revalidateDebtRoutes();
    return {
      ok: true,
      message: newRemainingAmount === 0 ? "Debt balance closed." : "Payment recorded successfully."
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to record payment."
    };
  }
}

function defaultDebtDescription(personName: string, direction: DebtDirection, closed: boolean) {
  if (direction === "PAYABLE") {
    return closed ? `Closed debt payable to ${personName}` : `Partial debt repayment to ${personName}`;
  }

  return closed ? `Closed receivable from ${personName}` : `Partial receivable collection from ${personName}`;
}

function revalidateDebtRoutes() {
  for (const path of ["/dashboard", "/transactions", "/debts"]) {
    revalidatePath(path);
  }
}
