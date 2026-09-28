import { sql } from "@/lib/db";
import { catSchema } from "@/lib/validation";

function validId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
// GET one cat by id
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = validId(raw);
  if (!id) return Response.json({ error: "Invalid id." }, { status: 400 });

  const rows = await sql`SELECT * FROM cats WHERE id = ${id}`;
  if (!rows[0]) return Response.json({ error: "Cat not found." }, { status: 404 });
  return Response.json(rows[0]);
}

// update a cat
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = validId(raw);
  if (!id) return Response.json({ error: "Invalid id." }, { status: 400 });

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
      UPDATE cats SET
        name = ${c.name},
        job_title = ${c.jobTitle},
        email = ${c.email},
        salary = ${c.salary},
        birth_date = ${c.birthDate},
        remote_worker = ${c.remoteWorker},
        lives_remaining = ${c.livesRemaining},
        photo_url = ${c.photoUrl ?? null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) return Response.json({ error: "Cat not found." }, { status: 404 });
    return Response.json(rows[0]);
  } catch (e: any) {
    if (e?.code === "23505") {
      return Response.json({ error: "That email is already used by another cat." }, { status: 409 });
    }
    return Response.json({ error: "Could not update cat." }, { status: 500 });
  }
}

// delete/fire a cat
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = validId(raw);
  if (!id) return Response.json({ error: "Invalid id." }, { status: 400 });

  const rows = await sql`
    UPDATE cats SET active = FALSE, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;
  if (!rows[0]) return Response.json({ error: "Cat not found." }, { status: 404 });
  return Response.json({ deleted: true, id });
}
