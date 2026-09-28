"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  async function fireCat() {
    if (!confirm("Fire this cat? HR has confirmed there is no severance tuna.")) return;
    const response = await fetch(`/api/cats/${id}`, { method: "DELETE" });
    if (!response.ok) {
      alert("Could not fire the cat.");
      return;
    }
    router.refresh();
  }

  return <button className="danger" onClick={fireCat}>Fire</button>;
}
