import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const PACKAGES = [
  { id: "p5", amount_usd: 5, nebulosas: 20, label: "$5 — 20 🌌" },
  { id: "p10", amount_usd: 10, nebulosas: 40, label: "$10 — 40 🌌" },
  { id: "p20", amount_usd: 20, nebulosas: 60, label: "$20 — 60 🌌 (+50% bonus)" },
  { id: "p50", amount_usd: 50, nebulosas: 175, label: "$50 — 175 🌌 (+75% bonus)" },
  { id: "p100", amount_usd: 100, nebulosas: 500, label: "$100 — 500 🌌 (+25% bonus)" },
  { id: "p200", amount_usd: 200, nebulosas: 800, label: "$200 — 800 🌌" },
];

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

  const { package_id } = await request.json();
  const pkg = PACKAGES.find((p) => p.id === package_id);
  if (!pkg) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${pkg.nebulosas} 🌌 Nebulas`,
            description: pkg.label,
          },
          unit_amount: pkg.amount_usd * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/billetera?recarga=ok`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/billetera`,
    metadata: {
      tipo: "recarga",
      user_id: user.id,
      nebulosas_a_acreditar: String(pkg.nebulosas),
    },
  });

  return NextResponse.json({ url: session.url });
}
