import { drizzle } from "drizzle-orm/mysql2";
import config from "../../drizzle.config";
import { logger } from "../common/logger";
import * as schema from "./schema";
import mysql from "mysql2/promise";

export const connection = await mysql.createConnection({
  host: config.dbCredentials.host,
  port: config.dbCredentials.port,
  user: config.dbCredentials.user,
  password: config.dbCredentials.password,
  database: config.dbCredentials.database,
  multipleStatements: true,
  charset: "utf8mb4",
});

export const db = drizzle(connection, {
  mode: "default",
  schema: schema as any,
  logger,
});
// export const closeDb = () => sqlite.close();
// export const rawDb = sqlite;
