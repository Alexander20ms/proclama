import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { proclama_id, monto } = body;

    if (!proclama_id || !monto) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum < 1) {
      return NextResponse.json(
        { error: "El monto mínimo es $1" },
        { status: 400 }
      );
    }

    // Verify proclama exists and is published
    const { data: proclama } = await supabase
      .from("proclamas")
      .select("id, texto, autor")
      .eq("id", proclama_id)
      .eq("publicada", true)
      .single();

    if (!proclama) {
      return NextResponse.json(
        { error: "Proclama no encontrada" },
        { status: 404 }
      );
    }

    const montoEnCentavos = Math.round(montoNum * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Apoyo a: "${proclama.texto.slice(0, 60)}${proclama.texto.length > 60 ? "…" : ""}"`,
              description: `Por ${proclama.autor}`,
            },
            unit_amount: montoEnCentavos,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/p/${proclama_id}?apoyo=ok`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/p/${proclama_id}`,
      metadata: {
        tipo: "apoyo",
        proclama_id: proclama_id,
        monto_centavos: String(montoEnCentavos),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Apoyo checkout error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
