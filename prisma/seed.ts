import { prisma } from "@/utils/db/prisma"


/**
 * Seed information to populate the counter table with initial data.
 */
async function seedCounters() {
  try {
    console.log("📦 Seeding app counters...")

    const counters = [
      {name: "Reception"},
      {name: "Quick Transaction"},
      {name: "Counter"},
      {name: "Ptax"},
      {name: "Cheque P/U"},
      {name: "ICBC Test"},
      {name: "Training"},
    ]

    await prisma.counter.createMany({
      data: counters,
      skipDuplicates: true,
    })
    console.log(`✅ Seeded ${counters.length} counters`)

  } catch (error) {
    console.error("❌ Seeding counters failed:", error)
}
}

/**
 * Seed information to populate the location table with initial data.
 */
async function seedLocations() {
  try {
    console.log("📦 Seeding app locations...")

    const locations = [
      {
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
        legacyOfficeNumber: 701,
        name: "Citz_IMB_Victoria",
        timezone: "America/Vancouver",
        streetAddress: "4000 Seymour Place, Victoria BC V8X 5J2",
        mailAddress: "PO Box 9000, Victoria, BC V8W 9A1",
        phoneNumber: "250-555-0300",
        latitude: 48.458359,
        longitude: -123.377106,
      },
    ]

    await prisma.location.createMany({
      data: locations,
      skipDuplicates: true,
    })
    console.log(`✅ Seeded ${locations.length} locations`)

  } catch (error) {
    console.error("❌ Seeding locations failed:", error)
}}

/**
 * Database seed script for initial data population.
 * Run with: npm run db:seed
 */
async function main() {
  console.log("🌱 Starting database seeding...")

  await seedLocations()
  await seedCounters()

  console.log("✅ Database seeding completed successfully!")
  await prisma.$disconnect()

}

main()
