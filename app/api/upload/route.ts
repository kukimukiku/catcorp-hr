import { put } from "@vercel/blob";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    // check file (no more than 4 MB, onlyy JPEG, PNG and WebP)
    if (!(file instanceof File)) {
      return Response.json({ error: "No file supplied." }, { status: 400 });
    }
    if (!allowed.has(file.type)) {
      return Response.json({ error: "Only JPEG, PNG and WebP images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "Image must be 4 MB or smaller." }, { status: 400 });
    }

    const blob = await put(`cat-photos/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true
    });

    return Response.json({ url: blob.url });
  } catch {
    return Response.json(
      { error: "Photo upload failed. Check that Vercel Blob is connected." },
      { status: 500 }
    );
  }
}
