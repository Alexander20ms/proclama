import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UserProfileClient from "@/components/UserProfileClient";
import type { Proclama } from "@/components/ProclamaCard";

type Profile = {
  id: string;
  username: string;
  color: string;
  created_at: string;
};

async function getData(username: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from("perfiles")
    .select("id, username, color, created_at")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: proclamas } = await supabase
    .from("proclamas")
    .select(
      "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total, user_id"
    )
    .eq("user_id", profile.id)
    .eq("publicada", true)
    .order("created_at", { ascending: false });

  return { profile: profile as Profile, proclamas: (proclamas as Proclama[]) ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  return {
    title: `@${username} — Proclama`,
    description: `Public proclamations by @${username}`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = decodeURIComponent(params.username);
  const data = await getData(username);
  if (!data) notFound();

  const { profile, proclamas } = data;
  const totalGastado = proclamas.reduce((s, p) => s + p.monto, 0) / 100;
  const totalReacciones = proclamas.reduce((s, p) => {
    const r = p.reacciones ?? {};
    return s + Object.values(r).reduce((a, b) => a + b, 0);
  }, 0);

  return (
    <UserProfileClient
      profile={profile}
      proclamas={proclamas}
      totalGastado={totalGastado}
      totalReacciones={totalReacciones}
    />
  );
}
