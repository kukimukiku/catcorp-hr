import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await sql`
      SELECT
        e.id AS selection_id,
        e.selected_date,
        c.id,
        c.name,
        c.job_title,
        c.email,
        c.salary,
        c.birth_date,
        c.remote_worker,
        c.lives_remaining,
        c.photo_url
      FROM employee_of_day e
      JOIN cats c ON c.id = e.cat_id
      WHERE e.selected_date = CURRENT_DATE
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json(null);
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("EMPLOYEE OF DAY GET ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load Employee of the Day."
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const cats = await sql`
      SELECT id
      FROM cats
      WHERE active = TRUE
      ORDER BY RANDOM()
      LIMIT 1
    `;

    if (cats.length === 0) {
      return Response.json(
        {
          error: "There are no active employees."
        },
        { status: 400 }
      );
    }

    const catId = cats[0].id;
    await sql`
      INSERT INTO employee_of_day (
        cat_id,
        selected_date
      )
      VALUES (
        ${catId},
        CURRENT_DATE
      )
      ON CONFLICT (selected_date)
      DO UPDATE SET
        cat_id = EXCLUDED.cat_id
    `;

    const result = await sql`
      SELECT
        e.id AS selection_id,
        e.selected_date,
        c.id,
        c.name,
        c.job_title,
        c.email,
        c.salary,
        c.birth_date,
        c.remote_worker,
        c.lives_remaining,
        c.photo_url
      FROM employee_of_day e
      JOIN cats c ON c.id = e.cat_id
      WHERE e.selected_date = CURRENT_DATE
      LIMIT 1
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("EMPLOYEE OF DAY POST ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not select Employee of the Day."
      },
      { status: 500 }
    );
  }
}