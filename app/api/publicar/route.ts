import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const headersList = headers();
  const auth = headersList.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.slice(7);

  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { texto, nebulosas, categoria } = await request.json();
  const amount = Number(nebulosas);

  if (!texto || typeof texto !== "string" || texto.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }
  if (texto.length > 500) {
    return NextResponse.json({ error: "Max 500 characters" }, { status: 400 });
  }
  if (!amount || amount < 2) {
    return NextResponse.json({ error: "Minimum 2 nebulas" }, { status: 400 });
  }

  // Get profile
  const { data: profile } = await supabaseAdmin
    .from("perfiles")
    .select("username, animal")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Check balance
  const { data: wallet } = await supabaseAdmin
    .from("billeteras")
    .select("nebulosas")
    .eq("user_id", user.id)
    .single();

  if (!wallet || Number(wallet.nebulosas) < amount) {
    return NextResponse.json({ error: "Insufficient nebulas" }, { status: 400 });
  }

  // Deduct nebulas
  await supabaseAdmin
    .from("billeteras")
    .update({ nebulosas: Number(wallet.nebulosas) - amount })
    .eq("user_id", user.id);

  // Insert proclama (published immediately)
  const { data: proclama, error: dbError } = await supabaseAdmin
    .from("proclamas")
    .insert({
      texto: texto.trim(),
      autor: profile.username,
      autor_animal: profile.animal ?? null,
      monto: Math.round(amount * 25), // store as cents equivalent for backward compat
      nebulosas: amount,
      categoria: String(categoria ?? "General"),
      publicada: true,
      user_id: user.id,
    })
    .select()
    .single();

  if (dbError || !proclama) {
    // Refund on failure
    await supabaseAdmin
      .from("billeteras")
      .update({ nebulosas: Number(wallet.nebulosas) })
      .eq("user_id", user.id);
    return NextResponse.json({ error: "Error saving proclama" }, { status: 500 });
  }

  await supabaseAdmin.from("transacciones").insert({
    user_id: user.id,
    tipo: "proclama",
    nebulosas: -amount,
    descripcion: `Proclama published`,
    referencia_id: proclama.id,
  });

  return NextResponse.json({ ok: true, proclama_id: proclama.id });
}
