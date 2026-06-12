import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-5">🔍</p>
      <h1 className="text-3xl font-extrabold text-foreground mb-3">
        Proclama no encontrada
      </h1>
      <p className="text-muted mb-8 max-w-sm">
        Esta proclama no existe o no ha sido publicada.
      </p>
      <Link
        href="/"
        className="bg-accent text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 transition-colors"
      >
        Ver el muro →
      </Link>
    </div>
  );
}
