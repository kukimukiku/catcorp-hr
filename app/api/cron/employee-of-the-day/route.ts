import { sql } from "@/lib/db";

export async function GET(request: Request) {
  if (process.env.CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const existing = await sql`
    SELECT e.selected_date, c.id, c.name
    FROM employee_of_day e
    JOIN cats c ON c.id = e.cat_id
    WHERE e.selected_date = CURRENT_DATE
  `;
  if (existing[0]) {
    return Response.json({ message: "Already selected today.", employee: existing[0] });
  }

  const cats = await sql`
    SELECT id, name
    FROM cats
    WHERE active = TRUE
    ORDER BY RANDOM()
    LIMIT 1
  `;
  if (!cats[0]) {
    return Response.json({ message: "No active cats available." });
  }

  const cat = cats[0] as { id: number; name: string };
  await sql`
    INSERT INTO employee_of_day (cat_id, selected_date)
    VALUES (${cat.id}, CURRENT_DATE)
    ON CONFLICT (selected_date) DO NOTHING
  `;

  return Response.json({
    message: "Employee of the day selected.",
    employee: cat
  });
}
