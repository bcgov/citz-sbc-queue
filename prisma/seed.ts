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

    const locations = [
      {
        id: "001",
        legacyOfficeNumber: 999,
        name: "Test Office",
        timezone: "America/Dawson_Creek",
        streetAddress: "1010 BC Gov, Victoria BC V8W 9C1",
        mailAddress: "1010 BC Gov, Victoria BC V8W 9C1",
        phoneNumber: "250-555-0100",
        latitude: 48.458359,
        longitude: -123.377106,
      },
      {
        id: "002",
        legacyOfficeNumber: 94,
        name: "Victoria",
        timezone: "America/Vancouver",
        streetAddress: "403-771 Vernon Ave, Victoria BC V8X 5B2",
        mailAddress: "PO Box 5678, Nanaimo, BC V9R 6H1",
        phoneNumber: "250-555-0200",
        latitude: 48.458359,
        longitude: -123.377106,
      },
      {
        id: "003",
        legacyOfficeNumber: 701,
        name: "Citz_IMB_Victoria",
        timezone: "America/Vancouver",
        streetAddress: "4000 Seymour Place, Victoria BC V8X 5J2",
        mailAddress: "PO Box 9000, Victoria, BC V8W 9A1",
        phoneNumber: "250-555-0300",
        latitude: 48.458359,
        longitude: -123.377106,
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
