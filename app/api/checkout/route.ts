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
    const { texto, autor, monto, categoria } = body;

    if (!texto || !autor || !monto || !categoria) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (typeof texto !== "string" || texto.length > 280) {
      return NextResponse.json(
        { error: "La proclama debe tener máximo 280 caracteres" },
        { status: 400 }
      );
    }

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum < 1) {
      return NextResponse.json(
        { error: "El monto mínimo es $1" },
        { status: 400 }
      );
    }

    const montoEnCentavos = Math.round(montoNum * 100);

    // 1. Guardar proclama en Supabase (publicada = false hasta confirmar pago)
    const { data: proclama, error: dbError } = await supabase
      .from("proclamas")
      .insert({
        texto: texto.trim(),
        autor: String(autor).trim().slice(0, 80),
        monto: montoEnCentavos,
        categoria: String(categoria),
        publicada: false,
      })
      .select()
      .single();

    if (dbError || !proclama) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Error al guardar la proclama. Intenta nuevamente." },
        { status: 500 }
      );
    }

    // 2. Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Proclama",
              description:
                texto.length > 100
                  ? texto.substring(0, 97) + "..."
                  : texto,
            },
            unit_amount: montoEnCentavos,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/nueva`,
      metadata: {
        tipo: "proclama",
        proclama_id: proclama.id,
      },
    });

    // 3. Guardar el stripe_session_id en la proclama
    await supabase
      .from("proclamas")
      .update({ stripe_session_id: session.id })
      .eq("id", proclama.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
