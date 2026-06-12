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
    const { proclama_id, texto, autor, monto } = body;

    if (!proclama_id || !texto || !autor || !monto) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum < 1) {
      return NextResponse.json({ error: "El monto mínimo es $1" }, { status: 400 });
    }

    if (typeof texto !== "string" || texto.length > 280) {
      return NextResponse.json({ error: "Máximo 280 caracteres" }, { status: 400 });
    }

    // Verify proclama exists and is published
    const { data: proclama } = await supabase
      .from("proclamas")
      .select("id, texto")
      .eq("id", proclama_id)
      .eq("publicada", true)
      .single();

    if (!proclama) {
      return NextResponse.json({ error: "Proclama no encontrada" }, { status: 404 });
    }

    // Insert respuesta (unpublished until payment confirmed)
    const { data: respuesta, error: dbError } = await supabase
      .from("respuestas")
      .insert({
        proclama_id,
        texto: texto.trim(),
        autor: String(autor).trim().slice(0, 80),
        monto: montoNum,
        publicada: false,
      })
      .select()
      .single();

    if (dbError || !respuesta) {
      console.error("Respuesta insert error:", dbError);
      return NextResponse.json({ error: "Error al guardar la respuesta" }, { status: 500 });
    }

    const preview = proclama.texto.length > 60
      ? proclama.texto.slice(0, 57) + "…"
      : proclama.texto;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Respuesta proclamada",
              description: `Respondiendo a: "${preview}"`,
            },
            unit_amount: Math.round(montoNum * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/p/${proclama_id}?respuesta=ok`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/p/${proclama_id}`,
      metadata: {
        tipo: "respuesta",
        respuesta_id: respuesta.id,
        proclama_id,
      },
    });

    await supabase
      .from("respuestas")
      .update({ stripe_session_id: session.id })
      .eq("id", respuesta.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Respuesta checkout error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
