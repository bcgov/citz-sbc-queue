"use server"

import type { Counter } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function getCounterById(id: string): Promise<Counter | null> {
  const counter = await prisma.counter.findUnique({
    where: { id },
  })

  return counter
}
