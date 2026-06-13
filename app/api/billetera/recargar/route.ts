import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const PACKAGES = [
  { id: "p5", amount_usd: 5, nebulosas: 20, label: "$5 — 20 ♦️" },
  { id: "p10", amount_usd: 10, nebulosas: 40, label: "$10 — 40 ♦️" },
  { id: "p20", amount_usd: 20, nebulosas: 60, label: "$20 — 60 ♦️ (+50% bonus)" },
  { id: "p50", amount_usd: 50, nebulosas: 175, label: "$50 — 175 ♦️ (+75% bonus)" },
  { id: "p100", amount_usd: 100, nebulosas: 500, label: "$100 — 500 ♦️ (+25% bonus)" },
  { id: "p200", amount_usd: 200, nebulosas: 800, label: "$200 — 800 ♦️" },
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

  const body = await request.json();
  const { package_id, custom_amount_usd } = body;

  let amount_usd: number;
  let nebulosas: number;
  let productName: string;
  let productDescription: string;

  if (custom_amount_usd != null) {
    const amt = parseFloat(custom_amount_usd);
    if (!amt || amt < 1) {
      return NextResponse.json({ error: "Minimum amount is $1" }, { status: 400 });
    }
    amount_usd = Math.round(amt * 100) / 100;
    nebulosas = Math.floor(amt * 4);
    productName = `${nebulosas} ♦️ Nebulas`;
    productDescription = `Custom recharge — $${amount_usd.toFixed(2)}`;
  } else {
    const pkg = PACKAGES.find((p) => p.id === package_id);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }
    amount_usd = pkg.amount_usd;
    nebulosas = pkg.nebulosas;
    productName = `${pkg.nebulosas} ♦️ Nebulas`;
    productDescription = pkg.label;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: Math.round(amount_usd * 100),
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
      nebulosas_a_acreditar: String(nebulosas),
    },
  });

  return NextResponse.json({ url: session.url });
}
