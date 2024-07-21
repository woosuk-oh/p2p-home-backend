import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, connection } from "./connection";

await migrate(db, {
  migrationsFolder: "mysql/migrations",
  migrationsSchema: "src/db/schema.ts",
});
await connection.end();
