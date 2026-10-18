
import { Pool, types } from "pg";
import { readFileSync } from "node:fs";
import path from "node:path";

// Keep PostgreSQL DATE values as YYYY-MM-DD strings
types.setTypeParser(1082, (value) => value);

let pool: Pool | undefined;

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const ca = readFileSync(
    path.join(process.cwd(), "certs", "global-bundle.pem"),
    "utf8"
  );

  pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    ssl: {
      ca,
      rejectUnauthorized: true
    }
  });

  return pool;
}

export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<any[]> {
  let query = strings[0];

  for (let i = 0; i < values.length; i++) {
    query += `$${i + 1}` + strings[i + 1];
  }

  const result = await getPool().query(query, values);
  return result.rows;
}
