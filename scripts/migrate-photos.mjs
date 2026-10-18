
import { Pool } from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const bucket = process.env.S3_BUCKET_NAME || "catcorp-hr-photos";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1"
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: readFileSync("certs/global-bundle.pem", "utf8"),
    rejectUnauthorized: true
  }
});

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

async function migrate() {
  const { rows } = await pool.query(
    "SELECT id, photo_url FROM cats WHERE photo_url IS NOT NULL"
  );

  let migrated = 0;

  for (const cat of rows) {
    const oldUrl = cat.photo_url;

    if (oldUrl.startsWith("/api/photos/")) continue;

    const source = new URL(oldUrl);

    if (
      source.protocol !== "https:" ||
      !source.hostname.endsWith(".public.blob.vercel-storage.com")
    ) {
      throw new Error(`Unexpected photo URL for cat ${cat.id}`);
    }

    const response = await fetch(oldUrl, {
      redirect: "error",
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Failed downloading photo for cat ${cat.id}`);
    }

    const type = (response.headers.get("content-type") || "")
      .split(";")[0].trim().toLowerCase();

    const ext = extensions[type];

    if (!ext) {
      throw new Error(`Unsupported image type for cat ${cat.id}: ${type}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());

    if (bytes.length > 4 * 1024 * 1024) {
      throw new Error(`Photo too large for cat ${cat.id}`);
    }

    const key = `cat-photos/${randomUUID()}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: type
    }));

    const newUrl = `/api/photos/${key}`;

    const updated = await pool.query(
      `UPDATE cats
       SET photo_url = $1
       WHERE id = $2 AND photo_url = $3`,
      [newUrl, cat.id, oldUrl]
    );

    if (updated.rowCount !== 1) {
      throw new Error(`Photo URL update failed for cat ${cat.id}`);
    }

    migrated++;
    console.log(`Migrated photo for cat ${cat.id}`);
  }

  console.log(`Migration complete: ${migrated} photos migrated`);
}

try {
  await migrate();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
