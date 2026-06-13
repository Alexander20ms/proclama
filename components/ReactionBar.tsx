"use client";

import { useState, useEffect } from "react";

const EMOJIS = ["🔥", "❤️", "😱", "🤯"] as const;
type Emoji = (typeof EMOJIS)[number];

type Props = {
  proclamaId: string;
  initialReacciones: Record<string, number>;
};

export default function ReactionBar({ proclamaId, initialReacciones }: Props) {
  const [reacciones, setReacciones] = useState<Record<string, number>>(
    initialReacciones || {}
  );
  const [mias, setMias] = useState<string[]>([]);
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(`rxn_${proclamaId}`) ?? "[]"
    ) as string[];
    setMias(saved);
  }, [proclamaId]);

  async function handleReact(emoji: Emoji) {
    if (mias.includes(emoji)) return;

    setReacciones((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    const nuevasMias = [...mias, emoji];
    setMias(nuevasMias);
    localStorage.setItem(`rxn_${proclamaId}`, JSON.stringify(nuevasMias));

    setAnimating(emoji);
    setTimeout(() => setAnimating(null), 300);

    fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proclama_id: proclamaId, tipo: emoji }),
    });
  }

  return (
    <div className="flex items-center gap-1 flex-wrap mt-3 pt-3 border-t border-line">
      {EMOJIS.map((emoji) => {
        const count = reacciones[emoji] || 0;
        const reacted = mias.includes(emoji);
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            title={reacted ? "Ya reaccionaste" : "Reaccionar"}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-all select-none
              ${
                reacted
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-line text-muted hover:bg-hover hover:text-foreground border border-transparent"
              }
              ${animating === emoji ? "animate-pop" : ""}
            `}
          >
            <span
              className={
                animating === emoji
                  ? "scale-125 inline-block"
                  : "inline-block"
              }
            >
              {emoji}
            </span>
            {count > 0 && (
              <span className="text-xs font-semibold leading-none">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
