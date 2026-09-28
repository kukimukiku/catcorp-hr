import Link from "next/link";
import { sql } from "@/lib/db";
import { Cat, EmployeeOfDay } from "@/lib/types";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cats = await sql`SELECT * FROM cats WHERE active = TRUE ORDER BY id DESC` as Cat[];
  const winners = await sql`
    SELECT e.selected_date, c.id, c.name, c.job_title, c.photo_url
    FROM employee_of_day e
    JOIN cats c ON c.id = e.cat_id
    ORDER BY e.selected_date DESC
    LIMIT 1
  ` as EmployeeOfDay[];
  const winner = winners[0];

  return (
    <>
      {winner && (
        <section className="hero">
          <h2>Employee of the Day</h2>
          <strong>{winner.name}</strong> — {winner.job_title}
          <div className="muted">Selected on {String(winner.selected_date).slice(0, 10)}</div>
        </section>
      )}

      <div className="toolbar">
        <div>
          <h1>Cat Employees</h1>
          <div className="muted">{cats.length} currently employed feline(s)</div>
        </div>
        <Link className="button" href="/cats/new">+ Hire New Cat</Link>
      </div>

      <div className="grid">
        {cats.map((cat) => (
          <article className="card" key={cat.id}>
            {cat.photo_url
              ? <img className="cat-photo" src={cat.photo_url} alt={cat.name} />
              : <div className="placeholder"></div>}
            <h2>{cat.name}</h2>
            <strong>{cat.job_title}</strong>
            <p>€{Number(cat.salary).toFixed(2)}</p>
            <p>Lives remaining: {cat.lives_remaining}</p>
            <p>Remote: {cat.remote_worker ? "Yes" : "No"}</p>
            <div className="actions">
              <Link className="button secondary" href={`/cats/${cat.id}`}>View</Link>
              <Link className="button secondary" href={`/cats/${cat.id}/edit`}>Edit</Link>
              <DeleteButton id={cat.id} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
