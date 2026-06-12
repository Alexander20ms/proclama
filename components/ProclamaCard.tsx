type Proclama = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  categoria: string;
  created_at: string;
};

const categoryStyles: Record<string, string> = {
  General: "bg-gray-100 text-gray-700",
  Humor: "bg-yellow-100 text-yellow-700",
  Ciencia: "bg-blue-100 text-blue-700",
  Opinión: "bg-orange-100 text-orange-700",
  Deportes: "bg-green-100 text-green-700",
  Entretenimiento: "bg-pink-100 text-pink-700",
};

export default function ProclamaCard({ proclama }: { proclama: Proclama }) {
  const monto = (proclama.monto / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  const fecha = new Date(proclama.created_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const catStyle =
    categoryStyles[proclama.categoria] ?? categoryStyles["General"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <p className="text-xl font-medium text-gray-900 leading-relaxed mb-5">
        &ldquo;{proclama.texto}&rdquo;
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-gray-500 text-sm font-medium">
          — {proclama.autor}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catStyle}`}
          >
            {proclama.categoria}
          </span>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {monto}
          </span>
          <span className="text-gray-400 text-xs">{fecha}</span>
        </div>
      </div>
    </div>
  );
}
