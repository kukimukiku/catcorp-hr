
import {
  GetObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1"
});

const bucket = process.env.S3_BUCKET_NAME || "catcorp-hr-photos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: parts } = await params;
  const key = parts.join("/");

  if (!/^cat-photos\/[a-f0-9-]+\.(jpg|png|webp)$/.test(key)) {
    return new Response("Invalid photo", { status: 400 });
  }

  try {
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );

    if (!object.Body) {
      return new Response("Photo not found", { status: 404 });
    }

    const bytes = await object.Body.transformToByteArray();

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": object.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error("S3 photo retrieval failed:", error);

    return new Response(
      "Photo unavailable",
      { status: 404 }
    );
  }
}
