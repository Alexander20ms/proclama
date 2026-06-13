import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3–30 characters: letters, numbers, underscores" },
        { status: 400 }
      );
    }

    // Check username uniqueness
    const { data: existing } = await supabase
      .from("perfiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Create auth user (auto-confirm so user can log in immediately)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      const msg = authError?.message ?? "Error creating account";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Create profile
    const { error: profileError } = await supabase.from("perfiles").insert({
      id: authData.user.id,
      username,
      color: "#3B82F6",
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Error creating profile" }, { status: 500 });
    }

    // Create wallet with 40 welcome nebulas
    await supabase.from("billeteras").insert({
      user_id: authData.user.id,
      nebulosas: 40,
    });

    await supabase.from("transacciones").insert({
      user_id: authData.user.id,
      tipo: "bienvenida",
      nebulosas: 40,
      descripcion: "Welcome nebulas 🌌",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Registro error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
