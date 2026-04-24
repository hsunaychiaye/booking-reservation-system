import { PrismaClient, TableType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = [
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `A${i + 1}`,
      type: TableType.VVIP,
      basePrice: 500_000,
      capacity: 5,
    })),
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `B${i + 1}`,
      type: TableType.VIP,
      basePrice: 400_000,
      capacity: 5,
    })),
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { id: table.id },
      update: {
        type: table.type,
        basePrice: table.basePrice,
        capacity: table.capacity,
      },
      create: table,
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
