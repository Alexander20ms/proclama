// Script: actualiza reacciones de todas las proclamas según su tier
// Ejecutar: node scripts/update-reactions.js

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ggisqsixmqwszndctpzr.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaXNxc2l4bXF3c3puZGN0cHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxMjEyMiwiZXhwIjoyMDk2Nzg4MTIyfQ.FjJMktXP6YGJ_swtqo1qVZoRIgoAf_yfK8WSR9Ih8Nc";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTierLevel(nebulosas) {
  if (nebulosas >= 4_000_000) return 7;
  if (nebulosas >= 399_996)   return 6;
  if (nebulosas >= 3_996)     return 5;
  if (nebulosas >= 396)       return 4;
  if (nebulosas >= 116)       return 3;
  if (nebulosas >= 36)        return 2;
  if (nebulosas >= 16)        return 1;
  return 0;
}

function generateReacciones(level) {
  switch (level) {
    case 6:
    case 7:
      return {
        "🔥": rand(500, 2000),
        "❤️": rand(300, 1500),
        "😱": rand(200, 1000),
        "🤯": rand(100, 800),
      };
    case 5:
      return {
        "🔥": rand(500, 2000),
        "❤️": rand(300, 1500),
        "😱": rand(200, 1000),
        "🤯": rand(100, 800),
      };
    case 4:
      return {
        "🔥": rand(100, 500),
        "❤️": rand(80, 400),
        "😱": rand(50, 300),
        "🤯": rand(30, 200),
      };
    case 3:
      return {
        "🔥": rand(30, 150),
        "❤️": rand(20, 100),
        "😱": rand(10, 80),
        "🤯": rand(5, 50),
      };
    case 2:
      return {
        "🔥": rand(10, 60),
        "❤️": rand(5, 40),
        "😱": rand(3, 30),
        "🤯": rand(2, 20),
      };
    case 1:
      return {
        "🔥": rand(3, 20),
        "❤️": rand(2, 15),
        "😱": rand(1, 10),
        "🤯": rand(1, 8),
      };
    default:
      return {
        "🔥": rand(0, 8),
        "❤️": rand(0, 6),
        "😱": rand(0, 4),
        "🤯": rand(0, 3),
      };
  }
}

async function main() {
  console.log("Fetching all proclamas...");
  const { data: proclamas, error } = await supabase
    .from("proclamas")
    .select("id, nebulosas, monto")
    .eq("publicada", true);

  if (error) {
    console.error("Error fetching proclamas:", error.message);
    process.exit(1);
  }

  console.log(`Found ${proclamas.length} proclamas. Updating reactions...`);

  let updated = 0;
  for (const p of proclamas) {
    const nebulosas = p.nebulosas && Number(p.nebulosas) > 0
      ? Number(p.nebulosas)
      : p.monto && p.monto > 0
        ? Math.round(p.monto / 25)
        : 0;

    const level = getTierLevel(nebulosas);
    const reacciones = generateReacciones(level);

    const { error: updateErr } = await supabase
      .from("proclamas")
      .update({ reacciones })
      .eq("id", p.id);

    if (updateErr) {
      console.error(`Error updating ${p.id}:`, updateErr.message);
    } else {
      updated++;
      if (updated % 10 === 0) console.log(`  Updated ${updated}/${proclamas.length}...`);
    }
  }

  console.log(`Done! Updated ${updated}/${proclamas.length} proclamas.`);
}

main();
