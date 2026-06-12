import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Falta la firma de Stripe" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Firma de webhook inválida" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tipo = session.metadata?.tipo;
    const proclamaId = session.metadata?.proclama_id;

    if (!proclamaId) {
      console.error("No proclama_id in session metadata:", session.id);
      return NextResponse.json(
        { error: "No se encontró proclama_id" },
        { status: 400 }
      );
    }

    if (tipo === "apoyo") {
      // Increment apoyos count and add to monto_total
      const montoCentavos = parseInt(
        session.metadata?.monto_centavos ?? "0",
        10
      );
      const montoDolares = montoCentavos / 100;

      // Fetch current values first
      const { data: current } = await supabase
        .from("proclamas")
        .select("apoyos, monto_total")
        .eq("id", proclamaId)
        .single();

      const newApoyos = (current?.apoyos ?? 0) + 1;
      const newMontoTotal = (current?.monto_total ?? 0) + montoDolares;

      const { error } = await supabase
        .from("proclamas")
        .update({ apoyos: newApoyos, monto_total: newMontoTotal })
        .eq("id", proclamaId);

      if (error) {
        console.error("Error actualizando apoyos:", error);
        return NextResponse.json(
          { error: "Error al actualizar apoyos" },
          { status: 500 }
        );
      }

      console.log(
        `Apoyo registrado para proclama ${proclamaId}: +$${montoDolares}`
      );
    } else {
      // tipo === 'proclama' or undefined — publish the proclama
      const { error } = await supabase
        .from("proclamas")
        .update({ publicada: true })
        .eq("id", proclamaId);

      if (error) {
        console.error("Error actualizando proclama:", error);
        return NextResponse.json(
          { error: "Error al publicar la proclama" },
          { status: 500 }
        );
      }

      console.log(`Proclama ${proclamaId} publicada correctamente`);
    }
  }

  return NextResponse.json({ received: true });
}
