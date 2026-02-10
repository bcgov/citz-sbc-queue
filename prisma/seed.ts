import { prisma } from "@/utils/db/prisma"

/**
 * Database seed script for initial data population.
 * Run with: npm run db:seed
 */
async function main() {
  console.log("🌱 Starting database seeding...")

  try{

    // seed and return results for counter types
    const counter = await prisma.counter.create({
      data: {name: "Counter"}
    })
    const reception = await prisma.counter.create({
      data: {name: "Reception"}
    })
    const quickTransaction = await prisma.counter.create({
      data: {name: "Quick Transaction"}
    })
    const training = await prisma.counter.create({
      data: {name: "Training"}
    })

    // create location "test Office" with connection to all counters
    await prisma.location.create({
      data: {
        legacyOfficeNumber: 999,
        name: "Test Office",
        timezone: "America/Dawson_Creek",
        streetAddress: "1010 BC Gov, Victoria BC V8W 9C1",
        mailAddress: "1010 BC Gov, Victoria BC V8W 9C1",
        phoneNumber: "250-555-0100",
        latitude: 48.458359,
        longitude: -123.377106,
        counters: {
          connect: [
          { id: counter.id },
          { id: reception.id },
          { id: quickTransaction.id },
          { id: training.id }]
        }
      }
    })

    // create location "Victoria" with connection to reception and counter counter type
    await prisma.location.create({
      data: {
        legacyOfficeNumber: 94,
        name: "Victoria",
        timezone: "America/Vancouver",
        streetAddress: "403-771 Vernon Ave, Victoria BC V8X 5B2",
        mailAddress: "PO Box 5678, Nanaimo, BC V9R 6H1",
        phoneNumber: "250-555-0200",
        latitude: 48.458359,
        longitude: -123.377106,
        counters: {
          connect: [
              {id: counter.id},
              {id: reception.id},
          ]
        }
      }
    })

    // create location "Nanaimo" with no connections to counters
    await prisma.location.create({
      data: {
        legacyOfficeNumber: 701,
        name: "Nanaimo",
        timezone: "America/Vancouver",
        streetAddress: "460 Selby St, Nanaimo, BC V9R 2R7",
        mailAddress: "PO Box 9000, Victoria, BC V8W 9A1",
        phoneNumber: "250-555-0300",
        latitude: 48.458359,
        longitude: -123.377106,
      }
    })
  } catch (error) {

    console.error("❌ Seeding database failed:", error)
    process.exit(1)

  } finally {

  console.log("✅ Database seeding completed successfully!")
  await prisma.$disconnect()

  }
}

main()
