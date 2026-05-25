"use server";

import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

export type SalaryActionState = {
  ok: boolean;
  message: string;
};

const salaryPaymentSchema = z.object({
  employeeId: z.string().min(1),
  amount: z.coerce.number().positive(),
  transactionDate: z.string().min(1),
  paymentMethod: z.nativeEnum(PaymentMethod).default("OTHER"),
  description: z.string().optional(),
  notes: z.string().optional()
});

const employeeSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.string().optional(),
  salaryType: z.string().optional()
});

export async function recordSalaryPayment(
  _previousState: SalaryActionState,
  formData: FormData
): Promise<SalaryActionState> {
  try {
    const input = salaryPaymentSchema.parse(Object.fromEntries(formData));
    const prisma = getPrisma();
    const employee = await prisma.employee.findUnique({ where: { id: input.employeeId } });

    if (!employee) {
      return { ok: false, message: "Employee not found." };
    }

    const category = await prisma.category.upsert({
      where: { slug: "salary" },
      update: { name: "Salary", type: "EXPENSE" },
      create: { slug: "salary", name: "Salary", type: "EXPENSE" }
    });

    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        status: "COMPLETED",
        cashFlowDirection: "OUTFLOW",
        categoryId: category.id,
        amount: input.amount,
        description: input.description || `Salary paid to ${employee.name}`,
        transactionDate: new Date(input.transactionDate),
        paymentMethod: input.paymentMethod,
        employeeId: employee.id,
        source: "SALARY_MODULE",
        isSystemGenerated: false,
        notes: input.notes || null
      }
    });

    revalidateSalaryRoutes();
    return { ok: true, message: "Salary payment recorded." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to record salary payment."
    };
  }
}

export async function createEmployee(
  _previousState: SalaryActionState,
  formData: FormData
): Promise<SalaryActionState> {
  try {
    const input = employeeSchema.parse(Object.fromEntries(formData));
    const prisma = getPrisma();

    await prisma.employee.create({
      data: {
        name: input.name.trim(),
        phone: input.phone || null,
        role: input.role || null,
        salaryType: input.salaryType || null
      }
    });

    revalidateSalaryRoutes();
    return { ok: true, message: "Employee added." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to add employee."
    };
  }
}

function revalidateSalaryRoutes() {
  for (const path of ["/dashboard", "/transactions", "/expense", "/salary"]) {
    revalidatePath(path);
  }
}
