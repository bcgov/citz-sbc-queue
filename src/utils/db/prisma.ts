import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  legacyPrisma?: PrismaClient
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema: "app" })
const legacyAdapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  { schema: "public" }
)
export const prisma = new PrismaClient({ adapter })
export const legacyPrisma = new PrismaClient({ adapter: legacyAdapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
  globalForPrisma.legacyPrisma = legacyPrisma
}
