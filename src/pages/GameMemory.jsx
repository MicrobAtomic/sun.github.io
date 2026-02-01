import React, { useMemo, useState, useEffect } from "react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameMemory({ onWin }) {
  const all = useMemo(() => ["💘", "🌹", "🍫", "💌", "🐻", "✨", "🎀", "💞"], []);
  const [choices, setChoices] = useState(() => shuffle(all).slice(0, 4));
  const [shown, setShown] = useState(true);
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setShown(false), 1300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (picked.length === 4) {
      const ok = picked.join("") === choices.join("");
      if (ok) onWin();
      else {
        setPicked([]);
        setChoices(shuffle(all).slice(0, 4));
        setShown(true);
        const t = setTimeout(() => setShown(false), 1300);
        return () => clearTimeout(t);
      }
    }
  }, [picked, choices, all, onWin]);

  return (
    <div className="card">
      <h2>Mini-game 2: Memory</h2>
      <p>Memorize the sequence, then click the emojis in the same order.</p>
      <div className="seq">
        {shown ? (
          choices.map((e, i) => (
            <span key={i} className="emoji big">{e}</span>
          ))
        ) : (
          <span className="hint">Sequence hidden 👀</span>
        )}
      </div>
      <div className="grid">
        {all.map((e) => (
          <button
            key={e}
            className="btn tile"
            onClick={() => setPicked((p) => (p.length < 4 ? [...p, e] : p))}
          >
            {e}
          </button>
        ))}
      </div>
      <p className="small">
        Your input: <span className="emoji">{picked.length ? picked.join(" ") : "—"}</span>
      </p>
      <button className="btn ghost" onClick={() => window.location.reload()}>
        Reset everything
      </button>
    </div>
  );
}
