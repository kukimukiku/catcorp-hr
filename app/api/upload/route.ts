
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1"
});

const bucket = process.env.S3_BUCKET_NAME || "catcorp-hr-photos";

const allowed: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No file supplied." },
        { status: 400 }
      );
    }

    const extension = allowed[file.type];

    if (!extension) {
      return Response.json(
        { error: "Only JPEG, PNG and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "Image must be 4 MB or smaller." },
        { status: 400 }
      );
    }

    const key = `cat-photos/${randomUUID()}.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type
      })
    );

    return Response.json({
      url: `/api/photos/${key}`
    });

  } catch (error) {
    console.error("S3 upload failed:", error);

    return Response.json(
      { error: "Photo upload failed." },
      { status: 500 }
    );
  }
}
