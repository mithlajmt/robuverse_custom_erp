import XLSX from "xlsx";
import { getPrisma } from "../src/lib/prisma";
import { excelSourcePath } from "../src/lib/constants";
import {
  normalizeCashFlowRow,
  normalizeDebtRows,
  normalizeOwnerCapitalRow,
  normalizeSalaryRow,
  type NormalizedTransaction
} from "../src/lib/excel-normalizer";
import { slugify } from "../src/lib/utils";

type SheetRow = Record<string, unknown>;

async function main() {
  const workbookPath = process.argv[2] || excelSourcePath;
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const prisma = getPrisma();

  const cashRows = rows(workbook, "Cash_Flow");
  const salaryRows = rows(workbook, "Salary_Register");
  const debtRows = rows(workbook, "Debt_Register");
  const ownerRows = rows(workbook, "Owner_Capital");

  const normalized: NormalizedTransaction[] = [
    ...cashRows.flatMap((row) => {
      const transaction = normalizeCashFlowRow({
        date: asDate(row.Date),
        category: String(row.Category ?? ""),
        description: String(row.Description ?? ""),
        projectCode: row.Project_ID ? String(row.Project_ID) : null,
        inflow: asNumber(row.Inflow),
        outflow: asNumber(row.Outflow)
      });
      return transaction ? [transaction] : [];
    })
  ];

  const debtImport = normalizeDebtRows(
    debtRows.map((row) => ({
      date: asDate(row.Date),
      person: row.Person ? String(row.Person) : null,
      givenToCompany: asNumber(row.Given_To_Company),
      paidBack: asNumber(row.Paid_Back)
    }))
  );

  await prisma.transaction.deleteMany({ where: { source: "EXCEL_IMPORT" } });

  const salaryEmployeeNames = new Set<string>();

  for (const row of salaryRows) {
    const salary = normalizeSalaryRow({
      date: asDate(row.Date),
      employee: row.Employee ? String(row.Employee) : null,
      salaryAmount: asNumber(row.Salary_Amount),
      status: row.Status ? String(row.Status) : null,
      projectCode: row.Project_ID ? String(row.Project_ID) : null,
      description: row.Description ? String(row.Description) : null
    });

    if (salary?.employeeName) {
      salaryEmployeeNames.add(salary.employeeName);
      await prisma.employee.upsert({
        where: { id: employeeKey(salary.employeeName) },
        update: { name: salary.employeeName },
        create: { id: employeeKey(salary.employeeName), name: salary.employeeName }
      });
    }
  }

  for (const row of ownerRows) {
    for (const capital of normalizeOwnerCapitalRow({
      date: asDate(row.Date),
      owner: row.Owner ? String(row.Owner) : null,
      invested: asNumber(row.Invested),
      withdrawn: asNumber(row.Withdrawn)
    })) {
      await prisma.category.upsert({
        where: { slug: capital.categorySlug },
        update: { name: capital.categoryName, type: capital.type },
        create: { slug: capital.categorySlug, name: capital.categoryName, type: capital.type }
      });
    }
  }

  for (const debt of debtImport.debts) {
    await prisma.debt.upsert({
      where: { id: debtKey(debt.personName) },
      update: debt,
      create: { id: debtKey(debt.personName), ...debt }
    });
  }

  for (const transaction of normalized) {
    const salaryEmployeeName = inferSalaryEmployee(transaction.description, salaryEmployeeNames);
    if (salaryEmployeeName) {
      transaction.categorySlug = "salary";
      transaction.categoryName = "Salary";
      transaction.employeeName = salaryEmployeeName;
    }

    const category = await prisma.category.upsert({
      where: { slug: transaction.categorySlug },
      update: { name: transaction.categoryName, type: transaction.type },
      create: {
        slug: transaction.categorySlug,
        name: transaction.categoryName,
        type: transaction.type
      }
    });

    const project = transaction.projectCode
      ? await prisma.project.upsert({
          where: { code: transaction.projectCode },
          update: {},
          create: { code: transaction.projectCode, name: transaction.projectCode }
        })
      : null;

    const employee = transaction.employeeName
      ? await prisma.employee.upsert({
          where: { id: employeeKey(transaction.employeeName) },
          update: { name: transaction.employeeName },
          create: { id: employeeKey(transaction.employeeName), name: transaction.employeeName }
        })
      : null;

    const debt = transaction.debtPersonName ? await prisma.debt.findUnique({ where: { id: debtKey(transaction.debtPersonName) } }) : null;

    await prisma.transaction.create({
      data: {
        type: transaction.type,
        status: transaction.status,
        cashFlowDirection: transaction.cashFlowDirection,
        categoryId: category.id,
        amount: transaction.amount,
        description: transaction.description,
        transactionDate: transaction.transactionDate,
        paymentMethod: transaction.paymentMethod,
        projectId: project?.id,
        employeeId: employee?.id,
        debtId: debt?.id,
        source: transaction.source,
        isSystemGenerated: transaction.isSystemGenerated,
        notes: transaction.notes
      }
    });
  }

  console.log(`Imported ${normalized.length} cash-flow transactions from ${workbookPath}`);
}

function rows(workbook: XLSX.WorkBook, sheetName: string): SheetRow[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<SheetRow>(sheet, { defval: null });
}

function asDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  return new Date(String(value));
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function debtKey(personName: string) {
  return `debt-${slugify(personName)}`;
}

function employeeKey(employeeName: string) {
  return `employee-${slugify(employeeName)}`;
}

function inferSalaryEmployee(description: string, employeeNames: Set<string>) {
  const normalizedDescription = description.trim().toLowerCase();
  if (!normalizedDescription.includes("salary")) return null;

  for (const employeeName of employeeNames) {
    if (normalizedDescription.includes(employeeName.trim().toLowerCase())) {
      return employeeName;
    }
  }

  return null;
}

main()
  .then(async () => {
    await getPrisma().$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await getPrisma().$disconnect();
    process.exit(1);
  });
