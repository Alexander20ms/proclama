import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ggisqsixmqwszndctpzr.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaXNxc2l4bXF3c3puZGN0cHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxMjEyMiwiZXhwIjoyMDk2Nzg4MTIyfQ.FjJMktXP6YGJ_swtqo1qVZoRIgoAf_yfK8WSR9Ih8Nc";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const USERNAMES = [
  "marcos_villa","sofia_reyes","john_tech","futbol_mx","crypto_pablo",
  "ana_guzman","roberto_k","the_real_mike","laura_thinks","pablo_filosofo",
  "maria_sports","david_crypto","elena_arte","carlos_mx","lisa_nyc",
  "pedro_truth","julia_minds","alex_global","sara_biz","miguel_pro",
  "kevin_facts","diana_world","luis_opinion","emma_voice","jorge_libre",
  "nina_speak","tom_believes","isabel_mx","ryan_global","claudia_v",
  "fernando_says","kate_world","andres_mx","mia_truth","victor_says",
  "helen_pro","oscar_libre","zoe_facts","samuel_mx","aria_world"
];

// 100 texts covering all requested topics
const TEXTOS = [
  // Política mundial (15)
  "El conflicto entre Rusia y Ucrania terminará con un acuerdo de paz antes de que acabe 2027, y nadie lo verá venir.",
  "La hegemonía del dólar como moneda de reserva mundial acabará antes de 2035 y China lo sabe.",
  "Trump está llevando a EEUU hacia el aislacionismo más peligroso desde los años 30 del siglo pasado.",
  "La OTAN es la alianza militar más costosa e ineficiente de la historia moderna y nadie lo quiere admitir.",
  "El colapso del gobierno en Venezuela llegará este año y el mundo tendrá que actuar.",
  "La política de sanciones de EEUU no ha funcionado en 60 años contra ningún país y nunca funcionará.",
  "La próxima gran guerra será por el agua, no por el petróleo, y ya empezó en el Sahel.",
  "El populismo de derecha en Europa va a ganar las próximas elecciones del Parlamento Europeo con mayoría.",
  "North Korea will have nuclear-capable drones before any treaty is ever signed.",
  "The UN Security Council is irrelevant — it hasn't prevented a single major conflict in 30 years.",
  "Mexico's cartel problem will never be solved until the US addresses its own drug demand.",
  "Taiwan will be reunified with China within this decade whether the West accepts it or not.",
  "The era of nation-states is ending — corporations now wield more power than most governments.",
  "La democracia no está en crisis, está muerta en al menos 40 países que se llaman democracias.",
  "El próximo gran escándalo político vendrá de dentro de la Unión Europea, no de afuera.",

  // Deportes - Mundial 2026 (15)
  "México va a llegar a cuartos de final en el Mundial 2026 y lo vamos a celebrar como si fuera la Copa.",
  "Argentina tiene el mejor equipo del mundo post-Messi y nadie le está dando el crédito que merece.",
  "Brasil merece volver a ser campeón del mundo y el 2026 es el año, estoy seguro al 100%.",
  "El VAR ha arruinado más partidos de los que ha salvado — hay que eliminarlo ya.",
  "Messi jugará su último partido oficial en el Mundial 2026 y todo el mundo llorará.",
  "España tiene el mejor mediocampo del torneo y ganará la copa sin necesitar un delantero estrella.",
  "Los EEUU sorprenderá a todos en casa y llegará a semifinales en el Mundial 2026.",
  "Francia tiene el mejor ataque individual del torneo pero su defensa los va a traicionar.",
  "El gol más polémico de la historia del fútbol se marcará en el Mundial 2026 en Azteca.",
  "Nigeria llegará más lejos que cualquier otra selección africana en este Mundial 2026.",
  "Alemania no pasará de cuartos de final — su generación dorada ya pasó.",
  "The World Cup 2026 will break every viewership record in sports history.",
  "Ronaldo's legacy ends here — he won't make it past the group stage in 2026.",
  "The best player in the tournament nobody knows yet is playing for Morocco.",
  "Women's soccer will surpass men's in global viewership by 2030, and 2026 starts that trend.",

  // IA y tecnología (15)
  "La inteligencia artificial va a reemplazar el 50% de los trabajos de oficina antes del 2030.",
  "ChatGPT ya es más útil que la mayoría de los especialistas que cobran $500 la hora.",
  "The AI bubble will burst by 2028 and it will be worse than the dot-com crash.",
  "Elon Musk's xAI will surpass OpenAI in the next 18 months — the race is real.",
  "Los autos autónomos serán legales en toda la UE antes de que termine esta década.",
  "La regulación de la IA en Europa va a matar la innovación tecnológica del continente.",
  "AGI llegará antes de 2030 y ningún gobierno está preparado para las consecuencias.",
  "Apple está a punto de lanzar el producto que va a redefinir la computación personal otra vez.",
  "El metaverso ya murió — Meta gastó 50 mil millones de dólares en el mayor fracaso tecnológico de la historia.",
  "Quantum computing will make today's encryption obsolete within 5 years.",
  "TikTok is the most powerful propaganda tool ever built and nobody treats it as such.",
  "The next unicorn startup will come from Africa, not Silicon Valley.",
  "Los deepfakes políticos van a cambiar el resultado de al menos 3 elecciones nacionales este año.",
  "Social media algorithms are actively making society less intelligent and more tribal.",
  "Web3 was the biggest scam in tech history and the people who sold it know it.",

  // Amor y relaciones (10)
  "Las relaciones a distancia son la prueba más real del amor verdadero — si sobreviven eso, sobreviven todo.",
  "Casarse antes de los 28 años es un error que la mayoría de la gente paga el resto de su vida.",
  "El amor romántico tal como lo concebimos es una invención del siglo XIX que nos hace más daño que bien.",
  "Las personas que no saben estar solas nunca pueden tener relaciones sanas con nadie.",
  "Tinder ha creado la generación de adultos más incapaz de comprometerse de la historia humana.",
  "Marriage is the most underrated life decision — people rush it or avoid it for the wrong reasons.",
  "Jealousy in relationships is not love — it's insecurity dressed up as care.",
  "Long-distance relationships are harder than anyone admits and easier than people think.",
  "The best relationships start as friendships — everything else is just attraction fading.",
  "Love is a choice you make every day, not a feeling that either exists or doesn't.",

  // Filosofía de vida (10)
  "La felicidad no se busca, se construye con decisiones pequeñas que la mayoría ignora.",
  "El éxito sin propósito es la forma más elegante de vacío existencial.",
  "Trabajar 80 horas a la semana no te hace exitoso, te hace esclavo de otra persona.",
  "La gente que más critica a los demás es la que más miedo tiene de mirarse a sí misma.",
  "Living a quiet life intentionally is the most radical act in the age of social media.",
  "You don't find purpose — you choose it and then build a life that proves it.",
  "The people who read most don't always know most — execution beats information every time.",
  "Discipline is freedom. Every person who ever felt truly free built it through constraints.",
  "Stoicism is the most practical philosophy ever created and most people dismiss it without reading it.",
  "Most people are unhappy because they optimise for comfort instead of meaning.",

  // Dinero y crypto (10)
  "Bitcoin llegará a un millón de dólares antes de 2030 — guarda esta proclama.",
  "Ethereum es la plataforma más subestimada en el ecosistema cripto y los institucionales ya lo saben.",
  "El sistema de pensiones actual es una estafa generacional — los millennials no verán un centavo.",
  "La inflación es el impuesto más injusto que existe porque castiga a quien menos tiene.",
  "Gold is dead as a store of value — Bitcoin replaced it and boomers just haven't accepted it yet.",
  "The next financial crisis will come from commercial real estate, not crypto.",
  "Investing in index funds is the only financially intelligent decision most people can make.",
  "Central bank digital currencies will end financial privacy as we know it within a decade.",
  "El dólar perderá su estatus de moneda de reserva en menos de 20 años y será reemplazado por una canasta.",
  "Ser rico en 2026 no requiere talento extraordinario, requiere empezar temprano e ignorar el ruido.",

  // Ciencia (10)
  "Vamos a encontrar evidencia de vida microbiana en Marte antes de 2035 y cambiará todo.",
  "El cambio climático ya es irreversible en el plazo que importa — hay que adaptarse, no negarlo.",
  "La energía nuclear es la única solución real al cambio climático que los ecologistas no quieren admitir.",
  "Los antibióticos dejarán de funcionar en 30 años si no cambiamos radicalmente cómo los usamos.",
  "Psychedelic therapy will be mainstream medicine within 15 years — the evidence is already there.",
  "CRISPR will cure most genetic diseases within a generation — we're closer than people think.",
  "El mayor riesgo para la humanidad no es la IA — es la resistencia antimicrobiana.",
  "Space colonization is not optional — Earth will not sustain 10 billion people sustainably.",
  "La próxima pandemia ya está incubando en algún lugar del planeta y no estamos más preparados que en 2019.",
  "Brain-computer interfaces will be as common as smartphones within 20 years.",

  // Entretenimiento (10)
  "La ceremonia de apertura del Mundial 2026 fue el mejor show televisivo de la última década.",
  "Netflix está en declive terminal y en 5 años será irrelevante frente a sus competidores.",
  "El K-pop es el movimiento cultural más influyente del siglo XXI y apenas está empezando.",
  "Streaming killed the album as an art form and nobody in the music industry wants to say it out loud.",
  "The MCU is creatively bankrupt and has been since Endgame — no amount of money will fix it.",
  "Los videojuegos superaron al cine como industria cultural hace 10 años y el mundo tardó en notarlo.",
  "Bad Bunny is the most important artist of his generation — globally, not just in Latin music.",
  "Reality TV has done more damage to collective intelligence than any other form of media.",
  "Podcast culture is producing more genuine intellectual conversations than academia right now.",
  "The next global pop sensation is already on TikTok with 500 followers and nobody's found them yet.",
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomReactions(tier) {
  const emojis = ["🔥", "❤️", "😱", "🤯"];
  let totalTarget;
  if (tier >= 5) totalTarget = randInt(100, 800);
  else if (tier >= 4) totalTarget = randInt(80, 200);
  else if (tier >= 3) totalTarget = randInt(20, 100);
  else if (tier >= 1) totalTarget = randInt(5, 40);
  else totalTarget = randInt(0, 15);

  if (totalTarget === 0) return {};

  const r = {};
  let rem = totalTarget;
  for (let i = 0; i < emojis.length; i++) {
    if (i === emojis.length - 1) {
      if (rem > 0) r[emojis[i]] = rem;
    } else {
      const share = Math.floor(Math.random() * rem * 0.55);
      if (share > 0) r[emojis[i]] = share;
      rem -= share;
    }
  }
  return r;
}

// Generate 100 unique timestamps between 2026-06-01 and 2026-06-13
function genTimestamps(count) {
  const used = new Set();
  const result = [];
  while (result.length < count) {
    const day = randInt(1, 13);
    const hour = randInt(6, 23);
    const min = randInt(0, 59);
    const sec = randInt(0, 59);
    const key = `${day}-${hour}-${min}-${sec}`;
    if (used.has(key)) continue;
    used.add(key);
    const d = String(day).padStart(2, "0");
    const h = String(hour).padStart(2, "0");
    const m = String(min).padStart(2, "0");
    const s = String(sec).padStart(2, "0");
    result.push(`2026-06-${d}T${h}:${m}:${s}`);
  }
  return result;
}

// Tier definitions: [count, nebMin, nebMax, tierLevel]
const TIERS = [
  { count: 40, min: 2,      max: 15,     level: 0 },
  { count: 25, min: 16,     max: 35,     level: 1 },
  { count: 15, min: 36,     max: 115,    level: 2 },
  { count: 10, min: 116,    max: 395,    level: 3 },
  { count: 7,  min: 396,    max: 3995,   level: 4 },
  { count: 2,  min: 3996,   max: 399995, level: 5 },
  { count: 1,  min: 399996, max: 600000, level: 6 },
];

async function main() {
  const { data: cats, error: catErr } = await supabase
    .from("categorias")
    .select("id, nombre_es");

  if (catErr) {
    console.error("Error fetching categorias:", catErr);
    process.exit(1);
  }

  const catIds = cats.map((c) => c.id);
  console.log(`Categorías: ${cats.map(c => c.nombre_es).join(", ")}`);

  const timestamps = genTimestamps(100);
  let tsIdx = 0;
  let textoIdx = 0;
  let userIdx = 0;

  const rows = [];

  for (const tier of TIERS) {
    for (let i = 0; i < tier.count; i++) {
      const nebulosas = randInt(tier.min, tier.max);
      const monto = nebulosas * 25; // cents
      const texto = TEXTOS[textoIdx % TEXTOS.length];
      textoIdx++;
      const autor = USERNAMES[userIdx % USERNAMES.length];
      userIdx++;
      const catId = catIds[randInt(0, catIds.length - 1)];
      const reacciones = randomReactions(tier.level);
      const created_at = timestamps[tsIdx++];

      rows.push({
        texto,
        autor,
        monto,
        nebulosas,
        categoria: catId,
        publicada: true,
        stripe_session_id: null,
        user_id: null,
        apoyos: 0,
        monto_total: 0,
        reacciones,
        created_at,
      });
    }
  }

  // Shuffle rows so tiers are interleaved
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  console.log(`\nInserting ${rows.length} proclamas...`);

  // Insert in batches of 20
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { data, error } = await supabase
      .from("proclamas")
      .insert(batch)
      .select("id, autor, nebulosas");

    if (error) {
      console.error(`Error in batch ${Math.floor(i/20) + 1}:`, error.message);
      process.exit(1);
    }
    console.log(`  Batch ${Math.floor(i/20) + 1}: ${data.length} inserted`);
  }

  console.log("\n✅ 100 proclamas insertadas correctamente");
  console.log("  Tier breakdown:");
  for (const t of TIERS) {
    console.log(`  - Level ${t.level}: ${t.count} proclamas (${t.min}–${t.max} ♦️)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
