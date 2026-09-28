import { sql } from "@/lib/db";
import { catSchema } from "@/lib/validation";

export async function GET() {
  const cats = await sql`SELECT * FROM cats WHERE active = TRUE ORDER BY id DESC`;
  return Response.json(cats);
}

export async function POST(request: Request) {
  try {
    const parsed = catSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const c = parsed.data;
    const rows = await sql`
      INSERT INTO cats
        (name, job_title, email, salary, birth_date, remote_worker, lives_remaining, photo_url)
      VALUES
        (${c.name}, ${c.jobTitle}, ${c.email}, ${c.salary}, ${c.birthDate},
         ${c.remoteWorker}, ${c.livesRemaining}, ${c.photoUrl ?? null})
      RETURNING *
    `;
    return Response.json(rows[0], { status: 201 });
  } catch (e: any) {
    if (e?.code === "23505") {
      return Response.json({ error: "That email is already used by another cat." }, { status: 409 });
    }
    return Response.json({ error: "Could not create cat." }, { status: 500 });
  }
}
