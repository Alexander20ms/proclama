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
    const proclamaId = session.metadata?.proclama_id;

    if (!proclamaId) {
      console.error("No proclama_id in session metadata:", session.id);
      return NextResponse.json(
        { error: "No se encontró proclama_id" },
        { status: 400 }
      );
    }

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

  return NextResponse.json({ received: true });
}
