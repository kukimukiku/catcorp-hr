"use client";

import { useEffect, useState } from "react";

type EmployeeOfTheDay = {
  selection_id: number;
  selected_date: string;

  id: number;
  name: string;
  job_title: string;
  email: string;
  salary: number;
  birth_date: string;
  remote_worker: boolean;
  lives_remaining: number;
  photo_url: string | null;
};

export default function EmployeeOfTheDay() {
  const [employee, setEmployee] =
    useState<EmployeeOfTheDay | null>(null);

  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState("");

  async function loadEmployee() {
    try {
      setError("");

      const response = await fetch(
        "/api/employee-of-the-day",
        {
          cache: "no-store"
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.error ||
            "Could not load Employee of the Day."
        );
      }

      setEmployee(json);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not load Employee of the Day."
      );
    } finally {
      setLoading(false);
    }
  }

  async function selectEmployee() {
    try {
      setSelecting(true);
      setError("");

      const response = await fetch(
        "/api/employee-of-the-day",
        {
          method: "POST"
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json.error ||
            "Could not select Employee of the Day."
        );
      }

      setEmployee(json);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not select Employee of the Day."
      );
    } finally {
      setSelecting(false);
    }
  }

  useEffect(() => {
    loadEmployee();
  }, []);

  if (loading) {
    return (
      <section className="employee-of-day">
        <h2>Employee of the Day</h2>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="employee-of-day">
      <h2>Employee of the Day</h2>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {employee ? (
        <div className="employee-of-day-content">

          {employee.photo_url ? (
            <img
              src={employee.photo_url}
              alt={employee.name}
              className="employee-of-day-photo"
            />
          ) : (
            <div className="employee-of-day-placeholder">
              🐱
            </div>
          )}

          <div>
            <h3>{employee.name}</h3>

            <p>
              {employee.job_title}
            </p>

            <p>
              <strong>Lives remaining:</strong>{" "}
              {employee.lives_remaining}
            </p>

            <p>
              <strong>Remote:</strong>{" "}
              {employee.remote_worker
                ? "Yes"
                : "No"}
            </p>

            <small>
              Selected for{" "}
              {String(
                employee.selected_date
              ).slice(0, 10)}
            </small>
          </div>
        </div>
      ) : (
        <p>
          No Employee of the Day has been
          selected yet.
        </p>
      )}

      <button
        type="button"
        onClick={selectEmployee}
        disabled={selecting}
      >
        {selecting
          ? "Selecting..."
          : "Pick Employee of the Day"}
      </button>

      <p className="demo-note">
        Demo button — the Employee of the Day is
        normally selected automatically by the
        scheduled background job.
      </p>
    </section>
  );
}