import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { Cat } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM cats WHERE id = ${Number(id)}` as Cat[];
  const cat = rows[0];
  if (!cat) notFound();

  return (
    <article className="card">
      {cat.photo_url
        ? <img className="cat-photo" src={cat.photo_url} alt={cat.name} />
        : <div className="placeholder">🐱</div>}
      <h1>{cat.name}</h1>
      <h2>{cat.job_title}</h2>
      <p>Email: {cat.email}</p>
      <p>Salary: €{Number(cat.salary).toFixed(2)}</p>
      <p>Birth date: {String(cat.birth_date).slice(0, 10)}</p>
      <p>Lives remaining: {cat.lives_remaining}</p>
      <p>Remote worker: {cat.remote_worker ? "Yes" : "No"}</p>
      <div className="actions">
        <Link className="button" href={`/cats/${cat.id}/edit`}>Edit</Link>
        <Link className="button secondary" href="/">Back</Link>
      </div>
    </article>
  );
}
