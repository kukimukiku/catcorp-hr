"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Cat } from "@/lib/types";

export default function CatForm({ cat }: { cat?: Cat }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const form = new FormData(event.currentTarget);
      let photoUrl = cat?.photo_url ?? null;
      const photo = form.get("photo") as File;

      if (photo && photo.size > 0) {
        const upload = new FormData();
        upload.append("file", photo);
        const uploadResponse = await fetch("/api/upload", { method: "POST", body: upload });
        const uploadJson = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadJson.error || "Photo upload failed.");
        photoUrl = uploadJson.url;
      }

      const payload = {
        name: String(form.get("name") || ""),
        jobTitle: String(form.get("jobTitle") || ""),
        email: String(form.get("email") || ""),
        salary: Number(form.get("salary")),
        birthDate: String(form.get("birthDate") || ""),
        remoteWorker: form.get("remoteWorker") === "on",
        livesRemaining: Number(form.get("livesRemaining")),
        photoUrl
      };

      const response = await fetch(cat ? `/api/cats/${cat.id}` : "/api/cats", {
        method: cat ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();

      if (!response.ok) {
        const details = json.details?.map((x: { message: string }) => x.message).join(" ") || "";
        throw new Error(`${json.error || "Save failed."} ${details}`.trim());
      }

      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="error">{error}</div>}

      <label>Name
        <input name="name" defaultValue={cat?.name} minLength={2} maxLength={100} required />
      </label>

      <label>Job title
        <input name="jobTitle" defaultValue={cat?.job_title} required />
      </label>

      <label>Email
        <input name="email" type="email" defaultValue={cat?.email} required />
      </label>

      <label>Salary (€)
        <input name="salary" type="number" step="0.01" min="0" defaultValue={cat?.salary} required />
      </label>

      <label>Birth date
        <input name="birthDate" type="date" defaultValue={cat ? String(cat.birth_date).slice(0, 10) : ""} required />
      </label>

      <label>Lives remaining (0–9)
        <input name="livesRemaining" type="number" min="0" max="9" step="1"
          defaultValue={cat?.lives_remaining ?? 9} required />
      </label>

      <label className="checkbox">
        <input name="remoteWorker" type="checkbox" defaultChecked={cat?.remote_worker} />
        Remote worker
      </label>

      <label>Employee photo (JPEG/PNG/WebP, max 4 MB)
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>

      <div className="actions">
        <button disabled={busy}>{busy ? "Saving..." : cat ? "Save Changes" : "Hire Cat"}</button>
        <button className="secondary" type="button" onClick={() => router.push("/")}>Cancel</button>
      </div>
    </form>
  );
}
