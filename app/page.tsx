import Link from "next/link";
import { sql } from "@/lib/db";
import { Cat } from "@/lib/types";
import DeleteButton from "@/components/DeleteButton";
import EmployeeOfTheDay from "@/components/EmployeeOfTheDay";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Get all currently active cat employees.
  const cats = await sql`
    SELECT *
    FROM cats
    WHERE active = TRUE
    ORDER BY id DESC
  ` as Cat[];

  return (
    <>
      {/* =====================================================
          EMPLOYEE OF THE DAY
          
          The component:
          - loads today's selected employee
          - displays the employee
          - allows manual selection for demonstration
          
          The automatic Vercel Cron still works separately.
         ===================================================== */}
      <section className="hero">
        <EmployeeOfTheDay />
      </section>

      {/* =====================================================
          EMPLOYEE DIRECTORY HEADER
         ===================================================== */}
      <div className="toolbar">
        <div>
          <h1>Cat Employees</h1>

          <div className="muted">
            {cats.length} currently employed feline(s)
          </div>
        </div>

        <Link
          className="button"
          href="/cats/new"
        >
          + Hire New Cat
        </Link>
      </div>

      {/* =====================================================
          EMPLOYEE LIST
         ===================================================== */}
      <div className="grid">
        {cats.map((cat) => (
          <article
            className="card"
            key={cat.id}
          >
            {/* Employee photo */}
            {cat.photo_url ? (
              <img
                className="cat-photo"
                src={cat.photo_url}
                alt={cat.name}
              />
            ) : (
              <div className="placeholder">
                🐱
              </div>
            )}

            {/* Employee information */}
            <h2>{cat.name}</h2>

            <strong>
              {cat.job_title}
            </strong>

            <p>
              €{Number(cat.salary).toFixed(2)}
            </p>

            <p>
              Lives remaining:{" "}
              {cat.lives_remaining}
            </p>

            <p>
              Remote:{" "}
              {cat.remote_worker
                ? "Yes"
                : "No"}
            </p>

            {/* CRUD actions */}
            <div className="actions">
              <Link
                className="button secondary"
                href={`/cats/${cat.id}`}
              >
                View
              </Link>

              <Link
                className="button secondary"
                href={`/cats/${cat.id}/edit`}
              >
                Edit
              </Link>

              <DeleteButton id={cat.id} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}