import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Database seed script for initial data population.
 * Run with: npm run db:seed
 *
 * This file is used to populate the database with initial or test data.
 * Organize seeding by schema:
 * - Seed "app" schema models first (new application data)
 * - Seed "public" schema models for staging/legacy data
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
    // Add your app schema seeding logic here
    // Example:
    // await prisma.appointment.createMany({
    //   data: [
    //     { title: "Example 1", date: new Date() },
    //     { title: "Example 2", date: new Date() },
    //   ],
    //   skipDuplicates: true,
    // });

    // ============================================
    // Seed public schema (staging) models
    // ============================================
    console.log("📦 Seeding public schema...");
    // Add your public schema seeding logic here
    // Example:
    // await prisma.legacyAppointment.createMany({
    //   data: [
    //     { title: "Legacy 1", date: new Date() },
    //     { title: "Legacy 2", date: new Date() },
    //   ],
    //   skipDuplicates: true,
    // });

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
