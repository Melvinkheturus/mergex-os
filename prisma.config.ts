// Prisma 7 configuration file
// In Prisma v7, directUrl has been removed. The datasource.url is used for ALL operations.
// For Neon: use the DIRECT (non-pooler) URL here so Prisma Migrate can run DDL reliably.
// The app runtime uses DATABASE_URL (pooler) via PrismaClient constructor.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma v7: use DIRECT_URL (non-pooler) for migrate - bypasses Neon's pgBouncer
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
  },
});
