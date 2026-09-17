import "dotenv/config";
import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories: Array<{ name: string; slug: string; type: TransactionType }> = [
  { name: "Income", slug: "income", type: "INCOME" },
  { name: "Workshop", slug: "workshop", type: "INCOME" },
  { name: "Exhibition", slug: "exhibition", type: "INCOME" },
  { name: "3D Print", slug: "3d-print", type: "INCOME" },
  { name: "Expense", slug: "expense", type: "EXPENSE" },
  { name: "Salary", slug: "salary", type: "EXPENSE" },
  { name: "Travel", slug: "travel", type: "EXPENSE" },
  { name: "Food", slug: "food", type: "EXPENSE" },
  { name: "Components", slug: "components", type: "EXPENSE" },
  { name: "Office Expense", slug: "office-expense", type: "EXPENSE" },
  { name: "Owner Investment", slug: "owner-investment", type: "CAPITAL" },
  { name: "Owner Withdrawal", slug: "owner-withdrawal", type: "CAPITAL" },
  { name: "Loan Taken", slug: "loan-taken", type: "TRANSFER" },
  { name: "Loan Repaid", slug: "loan-repaid", type: "TRANSFER" },
  { name: "Adjustment", slug: "adjustment", type: "TRANSFER" }
];

async function main() {
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  if (adminEmail) {
    await prisma.profile.upsert({
      where: { email: adminEmail },
      update: { role: "admin" },
      create: {
        id: "seed-admin",
        email: adminEmail,
        fullName: "Robuverse Admin",
        role: "admin"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
