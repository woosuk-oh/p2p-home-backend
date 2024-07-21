import type { Config } from "drizzle-kit";

export default {
  schema: "src/db/schema.ts",
  out: "./mysql/migrations",
  driver: "mysql2",
  dbCredentials: {
    // workaround because Bun.env.DB does not work for drizzle-kit, currently throwing ReferenceError: Bun is not defined
    host: process.env.DB_HOST || "sqlite/realworld.sqlite",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "p2pHome",
  },
} satisfies Config;
