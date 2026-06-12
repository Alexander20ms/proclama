import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ggisqsixmqwszndctpzr.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaXNxc2l4bXF3c3puZGN0cHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxMjEyMiwiZXhwIjoyMDk2Nzg4MTIyfQ.FjJMktXP6YGJ_swtqo1qVZoRIgoAf_yfK8WSR9Ih8Nc";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const proclamas = [
  { texto: "Yo sí creo que México va a llegar a cuartos de final en este Mundial 2026 y quien diga lo contrario no tiene fe.", autor: "FutboleroMX", monto: 3, categoria: "Deportes" },
  { texto: "Yo sí creo que el VAR ha arruinado la emoción del fútbol más de lo que lo ha mejorado.", autor: "AntiVAR", monto: 2, categoria: "Deportes" },
  { texto: "Yo sí creo que este Mundial 2026 será el más visto de la historia y nadie podrá negarlo en 4 años.", autor: "FifaWatch", monto: 1, categoria: "Deportes" },
  { texto: "Yo sí creo que Lionel Messi es el mejor jugador de todos los tiempos y ese debate ya debería estar cerrado.", autor: "LaAlbiceleste", monto: 5, categoria: "Deportes" },
  { texto: "Yo sí creo que el ataque de EEUU a posiciones iraníes esta semana nos está acercando peligrosamente a una guerra mundial.", autor: "GeoPoliTico", monto: 5, categoria: "Política" },
  { texto: "Yo sí creo que las sanciones de EEUU a Cuba no han funcionado en 60 años y nunca van a funcionar.", autor: "IslaLibre", monto: 2, categoria: "Política" },
  { texto: "Yo sí creo que Trump tomará decisiones que cerrarán el Estrecho de Ormuz y el mundo lo lamentará.", autor: "OilWatcher", monto: 3, categoria: "Política" },
  { texto: "Yo sí creo que la inteligencia artificial va a reemplazar el 40% de los trabajos antes del 2030 y nadie está preparado para eso.", autor: "FuturoDigital", monto: 4, categoria: "Tecnología" },
  { texto: "Yo sí creo que los videos falsos de IA en el Mundial 2026 van a crear la primera crisis de desinformación deportiva masiva de la historia.", autor: "TechAlert", monto: 3, categoria: "Tecnología" },
  { texto: "Yo sí creo que usar tu cara en trends de IA sin leer los términos y condiciones es el error más costoso que puedes cometer hoy.", autor: "PrivacyFirst", monto: 2, categoria: "Tecnología" },
  { texto: "Yo sí creo que el brote de ébola en Congo es una amenaza que el mundo está ignorando peligrosamente.", autor: "SaludGlobal", monto: 3, categoria: "Ciencia" },
  { texto: "Yo sí creo que el cambio climático ya no es una amenaza futura, es el presente que vivimos hoy y seguimos sin actuar.", autor: "PlanetaUrgente", monto: 5, categoria: "Ciencia" },
  { texto: "Yo sí creo que en los próximos 10 años vamos a encontrar señales de vida fuera de la Tierra.", autor: "CosmosBeliever", monto: 2, categoria: "Ciencia" },
  { texto: "Yo sí creo que el trabajo remoto es más productivo que la oficina y quien diga lo contrario nunca lo ha probado de verdad.", autor: "NomadaDigital", monto: 3, categoria: "Opinión" },
  { texto: "Yo sí creo que las redes sociales están destruyendo la salud mental de toda una generación y los gobiernos deberían regularlas ya.", autor: "MenteClara", monto: 4, categoria: "Opinión" },
  { texto: "Yo sí creo que quien no habla al menos dos idiomas en 2026 está en desventaja real frente al mundo.", autor: "BilingualMind", monto: 1, categoria: "Opinión" },
  { texto: "Yo sí creo que el dinero en efectivo desaparecerá completamente antes del 2035.", autor: "CashlessWorld", monto: 2, categoria: "Opinión" },
  { texto: "Yo sí creo que la ceremonia de inauguración del Mundial 2026 con Shakira y Belinda fue el mejor show de apertura en la historia de los mundiales.", autor: "ShowMundial", monto: 3, categoria: "Entretenimiento" },
  { texto: "Yo sí creo que el streaming mató al cine y que las salas de cine desaparecerán en menos de 15 años.", autor: "NetflixNation", monto: 2, categoria: "Entretenimiento" },
  { texto: "Yo sí creo que la música latina domina el mundo desde hace 10 años y no hay ninguna cultura musical que le haga competencia real hoy.", autor: "LatinoSound", monto: 4, categoria: "Entretenimiento" },
  { texto: "Yo sí creo que la humanidad no aprendió nada de las guerras del siglo XX y está repitiendo exactamente los mismos errores.", autor: "HistoriaSinFin", monto: 5, categoria: "Filosofía" },
  { texto: "Yo sí creo que ser feliz con poco es la forma de vida más inteligente que existe y el consumismo nos ha lavado el cerebro.", autor: "MinimaVida", monto: 2, categoria: "Filosofía" },
  { texto: "Yo sí creo que dentro de 50 años la gente mirará atrás y no podrá creer que alguna vez usamos el petróleo como fuente de energía principal.", autor: "FuturoVerde", monto: 3, categoria: "Filosofía" },
  { texto: "Yo sí creo que Bitcoin llegará a $500,000 antes del 2030 y quien no tenga aunque sea una fracción lo lamentará.", autor: "CryptoMaxi", monto: 5, categoria: "Dinero" },
  { texto: "Yo sí creo que la brecha entre ricos y pobres se va a duplicar en los próximos 20 años si seguimos con el sistema económico actual.", autor: "EconomíaReal", monto: 4, categoria: "Dinero" },
];

async function main() {
  // Fetch all categories
  const { data: cats, error: catErr } = await supabase
    .from("categorias")
    .select("id, nombre_es");

  if (catErr) {
    console.error("Error fetching categorias:", catErr);
    process.exit(1);
  }

  console.log("Categorías encontradas:", cats.map(c => c.nombre_es).join(", "));

  // Build lookup: nombre_es -> id
  const catMap = {};
  for (const c of cats) {
    catMap[c.nombre_es] = c.id;
  }

  // Build rows
  const rows = proclamas.map((p) => {
    const catId = catMap[p.categoria];
    if (!catId) {
      console.warn(`  ⚠ Categoría no encontrada: "${p.categoria}" — se usará el nombre como texto`);
    }
    return {
      texto: p.texto,
      autor: p.autor,
      monto: p.monto * 100, // to cents
      categoria: p.categoria,
      publicada: true,
      stripe_session_id: null,
      apoyos: 0,
      monto_total: 0,
      reacciones: {},
    };
  });

  // Insert in one batch
  const { data, error } = await supabase
    .from("proclamas")
    .insert(rows)
    .select("id, autor, categoria");

  if (error) {
    console.error("Error inserting:", error);
    process.exit(1);
  }

  console.log(`\n✅ ${data.length} proclamas insertadas:`);
  data.forEach((p, i) => console.log(`  ${i + 1}. [${p.categoria}] ${p.autor} → ${p.id}`));
}

main();
