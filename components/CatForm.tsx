"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Cat } from "@/lib/types";

export default function CatForm({ cat }: { cat?: Cat }) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [birthDate, setBirthDate] = useState(
    cat ? String(cat.birth_date).slice(0, 10) : ""
  );

  // check if date valid
  function isValidDate(value: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return false;
    }

    // birth date cannot be in the future.
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return date <= today;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setError("");

    try {
      const form = new FormData(event.currentTarget);

      if (!isValidDate(birthDate)) {
        throw new Error(
          "Please enter a valid birth date in YYYY-MM-DD format."
        );
      }

      let photoUrl = cat?.photo_url ?? null;

      const photo = form.get("photo") as File;

      if (photo && photo.size > 0) {
        const upload = new FormData();
        upload.append("file", photo);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: upload
        });

        const uploadJson = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadJson.error || "Photo upload failed."
          );
        }

        photoUrl = uploadJson.url;
      }

      const payload = {
        name: String(form.get("name") || ""),
        jobTitle: String(form.get("jobTitle") || ""),
        email: String(form.get("email") || ""),
        salary: Number(form.get("salary")),
        birthDate: birthDate,
        remoteWorker: form.get("remoteWorker") === "on",
        livesRemaining: Number(form.get("livesRemaining")),
        photoUrl
      };

      const response = await fetch(
        cat ? `/api/cats/${cat.id}` : "/api/cats",
        {
          method: cat ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const json = await response.json();

      if (!response.ok) {
        const details =
          json.details
            ?.map((x: { message: string }) => x.message)
            .join(" ") || "";

        throw new Error(
          `${json.error || "Save failed."} ${details}`.trim()
        );
      }

      router.push("/");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unexpected error."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* NAME */}
      <label>
        Name (required)
        <input
          name="name"
          defaultValue={cat?.name}
          minLength={2}
          maxLength={100}
          required
        />
      </label>

      {/* JOB TITLE */}
      <label>
        Job title (required)
        <input
          name="jobTitle"
          defaultValue={cat?.job_title}
          required
        />
      </label>

      {/* EMAIL */}
      <label>
        Email (required)
        <input
          name="email"
          type="email"
          defaultValue={cat?.email}
          required
        />
      </label>

      {/* SALARY */}
      <label>
        Salary (€) (required)
        <input
          name="salary"
          type="number"
          step="0.01"
          min="0"
          defaultValue={cat?.salary}
          required
        />
      </label>

      {/* BIRTH DATE */}
      <label>
        Birth date (required)
        <input
          name="birthDate"
          type="text"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChange={(event) =>
            setBirthDate(event.target.value)
          }
          pattern="\d{4}-\d{2}-\d{2}"
          title="Enter the date as YYYY-MM-DD, for example 2018-05-24"
          required
        />

        <small>
          Format: YYYY-MM-DD (for example 2018-05-24)
        </small>
      </label>

      {/* LIVES */}
      <label>
        Lives remaining (0–9) (required)
        <input
          name="livesRemaining"
          type="number"
          min="0"
          max="9"
          step="1"
          defaultValue={cat?.lives_remaining ?? 9}
          required
        />
      </label>

      {/* REMOTE WORKER */}
      <label className="checkbox">
        <input
          name="remoteWorker"
          type="checkbox"
          defaultChecked={cat?.remote_worker}
        />
        Remote worker
      </label>

      {/* PHOTO */}
      <label>
        Employee photo (JPEG/PNG/WebP, max 4 MB)
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
      </label>

      {/* BUTTONS */}
      <div className="actions">
        <button
          type="submit"
          disabled={busy}
        >
          {busy
            ? "Saving..."
            : cat
              ? "Save Changes"
              : "Hire Cat"}
        </button>

        <button
          className="secondary"
          type="button"
          onClick={() => router.push("/")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}