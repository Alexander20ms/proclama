// Script: inserta respuestas variadas en la tabla respuestas
// Ejecutar: node scripts/add-respuestas.js

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ggisqsixmqwszndctpzr.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaXNxc2l4bXF3c3puZGN0cHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxMjEyMiwiZXhwIjoyMDk2Nzg4MTIyfQ.FjJMktXP6YGJ_swtqo1qVZoRIgoAf_yfK8WSR9Ih8Nc";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const AUTHORS = [
  "marcos_villa", "sofia_reyes", "john_tech", "ana_guzman", "crypto_pablo",
  "laura_thinks", "pedro_truth", "maria_sports", "alex_global", "nina_speak",
  "tom_believes", "claudia_v", "kevin_facts", "emma_voice", "luis_opinion",
];

const RESPUESTAS_GENERICAS = [
  "100% de acuerdo con esto.",
  "No podría haberlo dicho mejor.",
  "Esto es exactamente lo que pienso.",
  "Interesante perspectiva, aunque no estoy del todo convencido.",
  "¿Alguien más está viendo esto? Porque es brillante.",
  "Llevaba tiempo pensando algo similar.",
  "Discrepo, pero respeto la valentía de publicarlo.",
  "Esto merece más visibilidad.",
  "Simple y directo. Me gusta.",
  "¿Por qué nadie habla de esto más seguido?",
  "Completamente de acuerdo. El mundo necesita escuchar esto.",
  "Polémico, pero no necesariamente incorrecto.",
  "Necesitaba leer esto hoy.",
  "Hay mucha verdad en estas palabras.",
  "Me hace pensar. Gracias por compartirlo.",
  "Exactamente lo que siento pero no sabía cómo expresar.",
  "Esto va a generar debate y está bien.",
  "Ojalá más gente se atreviera a decir esto.",
  "Definitivamente algo que vale la pena reflexionar.",
  "Ahí está la verdad que nadie quiere admitir.",
  "Firmado. Sin dudas.",
  "Esto es lo que diferencia una opinión de una proclama.",
  "El valor de decirlo públicamente tiene su peso.",
  "¿Cuándo fue la última vez que alguien dijo algo así sin filtros?",
  "Palabras que van a durar más que cualquier tweet.",
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function randomDateAfter(dateStr) {
  const base = new Date(dateStr).getTime();
  const maxOffset = 7 * 24 * 60 * 60 * 1000; // max 7 days later
  const offset = rand(60_000, maxOffset); // at least 1 minute later
  return new Date(base + offset).toISOString();
}

async function main() {
  console.log("Fetching all proclamas...");
  const { data: proclamas, error } = await supabase
    .from("proclamas")
    .select("id, texto, created_at")
    .eq("publicada", true);

  if (error) {
    console.error("Error fetching proclamas:", error.message);
    process.exit(1);
  }

  console.log(`Found ${proclamas.length} proclamas. Inserting replies...`);

  // Delete existing seed replies (stripe_session_id is null = seeded)
  const { error: deleteErr } = await supabase
    .from("respuestas")
    .delete()
    .is("stripe_session_id", null);

  if (deleteErr && deleteErr.code !== "42P01") {
    console.log("Note: could not delete old seed replies:", deleteErr.message);
  }

  let totalInserted = 0;
  for (const p of proclamas) {
    const numReplies = rand(1, 8);
    const usedAuthors = new Set();
    const toInsert = [];

    for (let i = 0; i < numReplies; i++) {
      let author;
      // Pick a unique author per proclama if possible
      do {
        author = pick(AUTHORS);
      } while (usedAuthors.size < AUTHORS.length && usedAuthors.has(author));
      usedAuthors.add(author);

      const texto = pick(RESPUESTAS_GENERICAS);
      const monto = rand(2, 50);
      const created_at = randomDateAfter(p.created_at);

      toInsert.push({
        proclama_id: p.id,
        texto,
        autor: author,
        monto,
        created_at,
        publicada: true,
        stripe_session_id: null,
      });
    }

    const { error: insertErr } = await supabase
      .from("respuestas")
      .insert(toInsert);

    if (insertErr) {
      console.error(`Error inserting replies for ${p.id}:`, insertErr.message);
    } else {
      totalInserted += toInsert.length;
    }
  }

  console.log(`Done! Inserted ${totalInserted} replies across ${proclamas.length} proclamas.`);
}

main();
