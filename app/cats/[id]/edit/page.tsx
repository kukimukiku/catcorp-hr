import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { Cat } from "@/lib/types";
import CatForm from "@/components/CatForm";

export const dynamic = "force-dynamic";

export default async function EditCatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM cats WHERE id = ${Number(id)}` as Cat[];
  const cat = rows[0];
  if (!cat) notFound();

  return <>
    <h1>✏️ Edit {cat.name}</h1>
    <CatForm cat={cat} />
  </>;
}
