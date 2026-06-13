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

  const { para_username, nebulosas, mensaje } = await request.json();
  const amount = Number(nebulosas);

  if (!para_username || !amount || amount < 1) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Get sender profile for username
  const { data: senderProfile } = await supabaseAdmin
    .from("perfiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!senderProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (senderProfile.username.toLowerCase() === para_username.toLowerCase()) {
    return NextResponse.json({ error: "You can't send nebulas to yourself" }, { status: 400 });
  }

  // Find recipient
  const { data: recipientProfile } = await supabaseAdmin
    .from("perfiles")
    .select("id, username")
    .ilike("username", para_username)
    .single();

  if (!recipientProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check sender balance
  const { data: senderWallet } = await supabaseAdmin
    .from("billeteras")
    .select("nebulosas")
    .eq("user_id", user.id)
    .single();

  if (!senderWallet || Number(senderWallet.nebulosas) < amount) {
    return NextResponse.json({ error: "Insufficient nebulas" }, { status: 400 });
  }

  // Ensure recipient has a wallet
  const { data: recipientWallet } = await supabaseAdmin
    .from("billeteras")
    .select("nebulosas")
    .eq("user_id", recipientProfile.id)
    .maybeSingle();

  if (!recipientWallet) {
    await supabaseAdmin.from("billeteras").insert({ user_id: recipientProfile.id, nebulosas: 0 });
  }

  // Deduct from sender
  await supabaseAdmin
    .from("billeteras")
    .update({ nebulosas: Number(senderWallet.nebulosas) - amount })
    .eq("user_id", user.id);

  // Credit to recipient
  const recipientBalance = Number(recipientWallet?.nebulosas ?? 0);
  await supabaseAdmin
    .from("billeteras")
    .update({ nebulosas: recipientBalance + amount })
    .eq("user_id", recipientProfile.id);

  const giftDesc = mensaje
    ? `Gift from @${senderProfile.username}: "${mensaje}"`
    : `Gift from @${senderProfile.username}`;
  const sentDesc = mensaje
    ? `Gift to @${recipientProfile.username}: "${mensaje}"`
    : `Gift to @${recipientProfile.username}`;

  // Create transactions
  await supabaseAdmin.from("transacciones").insert([
    {
      user_id: user.id,
      tipo: "regalo_enviado",
      nebulosas: -amount,
      descripcion: sentDesc,
    },
    {
      user_id: recipientProfile.id,
      tipo: "regalo_recibido",
      nebulosas: amount,
      descripcion: giftDesc,
    },
  ]);

  await supabaseAdmin.from("regalos").insert({
    de_user_id: user.id,
    para_username: recipientProfile.username,
    nebulosas: amount,
    mensaje: mensaje ?? null,
  });

  return NextResponse.json({ ok: true, para: recipientProfile.username });
}
