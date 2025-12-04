import "dotenv/config";

import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
      // Use a dummy database URL if none is provided, so CI environments don't fail.
      url: env('DATABASE_URL') ?? "postgresql://dummy:dummy@localhost:5432/dummy",
  }
});
