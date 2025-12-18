import { prisma } from "@/utils/db/prisma"

export async function deleteLocation(id: string): Promise<boolean> {
  const existing = await prisma.location.findUnique({
    where: { id },
  })
  if (!existing || existing.deletedAt) return false

  await prisma.location.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  return true
}
