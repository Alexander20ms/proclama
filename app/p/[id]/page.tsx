import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProclamaPageClient from "@/components/ProclamaPageClient";
import type { Proclama } from "@/components/ProclamaCard";
import type { Respuesta } from "@/components/RespuestaThread";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getProclama(id: string): Promise<Proclama | null> {
  const { data } = await getSupabase()
    .from("proclamas")
    .select("*")
    .eq("id", id)
    .eq("publicada", true)
    .single();
  return (data as Proclama) ?? null;
}

async function getRespuestas(proclamaId: string): Promise<Respuesta[]> {
  const { data, error } = await getSupabase()
    .from("respuestas")
    .select("*")
    .eq("proclama_id", proclamaId)
    .eq("publicada", true)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data as Respuesta[]) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const proclama = await getProclama(params.id);
  if (!proclama) return { title: "Proclama no encontrada" };

  const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://proclama.app";
  const ogImageUrl = `${siteUrl}/api/og?id=${proclama.id}`;
  const titulo = `"${proclama.texto.slice(0, 60)}${proclama.texto.length > 60 ? "…" : ""}" — ${proclama.autor}`;

  return {
    title: titulo,
    description: proclama.texto,
    openGraph: {
      title: titulo,
      description: proclama.texto,
      siteName: "Proclama",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: titulo }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: proclama.texto,
      images: [ogImageUrl],
    },
  };
}

export default async function ProclamaPage({
  params,
}: {
  params: { id: string };
}) {
  const [proclama, respuestas] = await Promise.all([
    getProclama(params.id),
    getRespuestas(params.id),
  ]);

  if (!proclama) notFound();

  return <ProclamaPageClient proclama={proclama} initialRespuestas={respuestas} />;
}
