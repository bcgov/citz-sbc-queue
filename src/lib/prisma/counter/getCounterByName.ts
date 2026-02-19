"use server"

import type { Counter } from "@/generated/prisma/client"
import { prisma } from "@/utils/db/prisma"

export async function getCounterByName(counterName: string): Promise<Counter | null> {
  const counter = await prisma.counter.findFirst({
    where: { name: counterName },
  })

  return counter
}
