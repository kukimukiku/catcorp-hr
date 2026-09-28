import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/*
 * GET
 * Returns today's Employee of the Day.
 */
export async function GET() {
  try {
    const result = await sql`
      SELECT
        e.id AS selection_id,
        TO_CHAR(e.selected_date, 'YYYY-MM-DD') AS selected_date,
        c.id,
        c.name,
        c.job_title,
        c.email,
        c.salary,
        TO_CHAR(c.birth_date, 'YYYY-MM-DD') AS birth_date,
        c.remote_worker,
        c.lives_remaining,
        c.photo_url
      FROM employee_of_day e
      JOIN cats c
        ON c.id = e.cat_id
      WHERE e.selected_date = CURRENT_DATE
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json(null);
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(
      "EMPLOYEE OF DAY GET ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load Employee of the Day."
      },
      {
        status: 500
      }
    );
  }
}

/*
 * POST
 *
 * Manually selects a random active employee.
 * If an Employee of the Day already exists for today,
 * today's employee is replaced.
 */
export async function POST() {
  try {
    // --------------------------------------------------
    // 1. Select a random active cat
    // --------------------------------------------------

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
        {
          status: 400
        }
      );
    }

    const catId = Number(cats[0].id);

    // --------------------------------------------------
    // 2. Save today's Employee of the Day
    //
    // selected_date is UNIQUE.
    // If today's row already exists, replace cat_id.
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 3. Return the selected employee
    // --------------------------------------------------

    const result = await sql`
      SELECT
        e.id AS selection_id,
        TO_CHAR(e.selected_date, 'YYYY-MM-DD') AS selected_date,
        c.id,
        c.name,
        c.job_title,
        c.email,
        c.salary,
        TO_CHAR(c.birth_date, 'YYYY-MM-DD') AS birth_date,
        c.remote_worker,
        c.lives_remaining,
        c.photo_url
      FROM employee_of_day e
      JOIN cats c
        ON c.id = e.cat_id
      WHERE e.selected_date = CURRENT_DATE
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json(
        {
          error:
            "Employee was selected but could not be loaded."
        },
        {
          status: 500
        }
      );
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(
      "EMPLOYEE OF DAY POST ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not select Employee of the Day."
      },
      {
        status: 500
      }
    );
  }
}