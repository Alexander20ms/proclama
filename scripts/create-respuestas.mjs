// Uses Supabase Management API to execute DDL
// Requires SUPABASE_ACCESS_TOKEN environment variable
// Or falls back to trying direct REST

const PROJECT_REF = "ggisqsixmqwszndctpzr";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaXNxc2l4bXF3c3puZGN0cHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxMjEyMiwiZXhwIjoyMDk2Nzg4MTIyfQ.FjJMktXP6YGJ_swtqo1qVZoRIgoAf_yfK8WSR9Ih8Nc";

const SQL = `
CREATE TABLE IF NOT EXISTS respuestas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proclama_id uuid REFERENCES proclamas(id) ON DELETE CASCADE,
  texto text NOT NULL CHECK (char_length(texto) <= 280),
  autor text NOT NULL,
  monto numeric(10,2) NOT NULL CHECK (monto >= 1),
  stripe_session_id text UNIQUE,
  publicada boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'respuestas' AND policyname = 'Ver respuestas publicadas'
  ) THEN
    CREATE POLICY "Ver respuestas publicadas" ON respuestas FOR SELECT USING (publicada = true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'respuestas' AND policyname = 'Sistema inserta respuestas'
  ) THEN
    CREATE POLICY "Sistema inserta respuestas" ON respuestas FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'respuestas' AND policyname = 'Sistema actualiza respuestas'
  ) THEN
    CREATE POLICY "Sistema actualiza respuestas" ON respuestas FOR UPDATE USING (true);
  END IF;
END$$;
`;

async function tryManagementAPI(accessToken) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Management API error ${res.status}: ${text}`);
  }
  return await res.json();
}

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (accessToken) {
    console.log("Usando Management API con access token…");
    try {
      const result = await tryManagementAPI(accessToken);
      console.log("✅ Tabla respuestas creada correctamente");
      console.log(result);
      return;
    } catch (e) {
      console.error("Error con Management API:", e.message);
    }
  } else {
    console.log("❌ No se encontró SUPABASE_ACCESS_TOKEN");
    console.log("");
    console.log("Por favor, ejecuta este SQL en el SQL Editor de Supabase:");
    console.log("https://supabase.com/dashboard/project/" + PROJECT_REF + "/editor");
    console.log("");
    console.log("═".repeat(60));
    console.log(SQL);
    console.log("═".repeat(60));
  }
}

main().catch(console.error);
