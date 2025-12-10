import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Database seed script for initial data population.
 * Run with: npm run db:seed
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // ============================================
    // Seed app schema models
    // ============================================
    console.log("📦 Seeding app schema...");

    // Seed locations
    console.log("📍 Seeding locations...");
    const locations = [
      {
        id: "001",
        name: "Downtown Service Centre",
        timezone: "America/Vancouver",
        streetAddress: "123 Government St, Victoria, BC V8W 1R7",
        mailAddress: "PO Box 1234, Victoria, BC V8W 2A1",
        phoneNumber: "250-555-0100",
        latitude: 48.4284,
        longitude: -123.3656,
      },
      {
        id: "002",
        name: "North Branch Office",
        timezone: "America/Vancouver",
        streetAddress: "456 Maple Ave, Nanaimo, BC V9R 5G8",
        mailAddress: "PO Box 5678, Nanaimo, BC V9R 6H1",
        phoneNumber: "250-555-0200",
        latitude: 49.1659,
        longitude: -123.9401,
      },
      {
        id: "003",
        name: "Victoria Regional Office",
        timezone: "America/Vancouver",
        streetAddress: "789 Douglas St, Victoria, BC V8W 2B1",
        mailAddress: "PO Box 9000, Victoria, BC V8W 9A1",
        phoneNumber: "250-555-0300",
        latitude: 48.4284,
        longitude: -123.3656,
      },
      {
        id: "999",
        name: "Test Office",
        timezone: "America/Vancouver",
        streetAddress: "1 Test Lane, Testville, BC T0T 0T0",
        mailAddress: "",
        phoneNumber: "250-555-0999",
        latitude: 49.0,
        longitude: -123.0,
      },
      {
        id: "004",
        name: "Eastside Community Office",
        timezone: "America/Vancouver",
        streetAddress: "321 Oak St, Courtenay, BC V9N 2B3",
        mailAddress: "PO Box 4321, Courtenay, BC V9N 3D4",
        phoneNumber: "250-555-0400",
        latitude: 49.6846,
        longitude: -124.981,
      },
    ];

    await prisma.location.createMany({
      data: locations,
      skipDuplicates: true,
    });
    console.log(`✅ Seeded ${locations.length} locations`);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
