import { createClient } from "@supabase/supabase-js";
import ExitoClient from "@/components/ExitoClient";

async function getProclamaBySession(sessionId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("proclamas")
    .select("id, texto, autor")
    .eq("stripe_session_id", sessionId)
    .single();
  return data as { id: string; texto: string; autor: string } | null;
}

export default async function ExitoPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const proclama = searchParams.session_id
    ? await getProclamaBySession(searchParams.session_id)
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://proclama.app";

  return <ExitoClient proclama={proclama} siteUrl={siteUrl} />;
}
