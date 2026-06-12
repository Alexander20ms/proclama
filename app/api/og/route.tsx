import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: proclama } = await supabase
    .from("proclamas")
    .select("texto, autor, monto, categoria")
    .eq("id", id)
    .eq("publicada", true)
    .single();

  const texto = proclama?.texto ?? "Proclama";
  const autor = proclama?.autor ?? "";
  const monto = proclama?.monto
    ? "$" +
      (proclama.monto / 100).toLocaleString("en-US", {
        minimumFractionDigits: 0,
      })
    : "";
  const categoria = proclama?.categoria ?? "";

  const textoTruncado =
    texto.length > 140 ? texto.slice(0, 137) + "…" : texto;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{ color: "#FFFFFF", fontSize: "28px", fontWeight: 900 }}
          >
            Proclama
          </span>
          <span style={{ color: "#3B82F6", fontSize: "28px", fontWeight: 900 }}>
            .
          </span>
        </div>

        {/* Middle: quote */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <p
            style={{
              color: "#FFFFFF",
              fontSize: textoTruncado.length > 80 ? "36px" : "44px",
              fontWeight: 600,
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            &ldquo;{textoTruncado}&rdquo;
          </p>
          {autor && (
            <p
              style={{
                color: "#A0A0A0",
                fontSize: "22px",
                fontWeight: 500,
                margin: 0,
              }}
            >
              — {autor}
            </p>
          )}
        </div>

        {/* Bottom: meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {categoria && (
            <span
              style={{
                background: "#1E1E1E",
                color: "#A0A0A0",
                borderRadius: "100px",
                padding: "6px 16px",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {categoria}
            </span>
          )}
          {monto && (
            <span
              style={{
                background: "rgba(59,130,246,0.15)",
                color: "#3B82F6",
                borderRadius: "100px",
                padding: "6px 16px",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {monto}
            </span>
          )}
          <span style={{ color: "#A0A0A0", fontSize: "14px", marginLeft: "auto" }}>
            proclama.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
