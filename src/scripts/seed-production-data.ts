import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");
  
  // 1. Clean transactions and debts
  const txCount = await prisma.transaction.deleteMany({});
  console.log(`Deleted ${txCount.count} transactions.`);
  
  const debtCount = await prisma.debt.deleteMany({});
  console.log(`Deleted ${debtCount.count} debts.`);

  console.log("Database cleaned. Seeding production data...");

  // 2. Seed capital category (no initial transaction seeded)
  await prisma.category.upsert({
    where: { slug: "capital" },
    update: { name: "Capital Investment", type: "CAPITAL" },
    create: { slug: "capital", name: "Capital Investment", type: "CAPITAL" }
  });

  // 3. Seed Debt records
  const debtsToSeed = [
    // Borrowed money (Payable)
    { personName: "Hafkath", direction: "PAYABLE" as const, amount: 10000 },
    
    // Lent money (Receivables)
    { personName: "Shinu", direction: "RECEIVABLE" as const, amount: 2000 },
    { personName: "Pala", direction: "RECEIVABLE" as const, amount: 1226 },
    { personName: "Ashmil", direction: "RECEIVABLE" as const, amount: 4058 },
    { personName: "Adheel", direction: "RECEIVABLE" as const, amount: 1000 },
    { personName: "Cp", direction: "RECEIVABLE" as const, amount: 1475 }
  ];

  for (const d of debtsToSeed) {
    await prisma.debt.create({
      data: {
        personName: d.personName,
        direction: d.direction,
        amount: d.amount,
        paidAmount: 0,
        remainingAmount: d.amount,
        status: "OPEN",
        notes: d.direction === "PAYABLE" ? "Borrowed money (need to pay back)" : "Lent money (need to get back)"
      }
    });
    console.log(`Seeded ${d.direction} debt for ${d.personName} of ₹${d.amount}.`);
  }

  console.log("Production seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
