import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Mini-games ----------

function GameTapHearts({ onWin }) {
  const target = 8;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= target) onWin();
  }, [count, onWin]);

  return (
    <div className="card">
      <h2>Mini-game 1: Tap the hearts</h2>
      <p>
        Click <b>{target}</b> hearts to continue. ({count}/{target})
      </p>
      <button className="btn yes" onClick={() => setCount((c) => c + 1)}>
        💗 Tap
      </button>
    </div>
  );
}

function GameMemory({ onWin }) {
  const all = useMemo(() => ["💘", "🌹", "🍫", "💌", "🐻", "✨", "🎀", "💞"], []);
  const [choices, setChoices] = useState(() => shuffle(all).slice(0, 4));
  const [shown, setShown] = useState(true);
  const [picked, setPicked] = useState([]);

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
            <span key={i} className="emoji big">
              {e}
            </span>
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

function GameFinal({ onWin }) {
  const [text, setText] = useState("");
  const phrase = "I choose you 💘";

  useEffect(() => {
    if (text.trim() === phrase) onWin();
  }, [text, phrase, onWin]);

  return (
    <div className="card">
      <h2>Final: Type the magic phrase</h2>
      <p>
        Type exactly: <b>{phrase}</b>
      </p>
      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here…"
        autoFocus
      />
      <p className="small">Tip: copy carefully 😇</p>
    </div>
  );
}

// ---------- Main App ----------

export default function App() {
  const pageRef = useRef(null);
  const noBtnRef = useRef(null);
  const yesBtnRef = useRef(null);

  const [mode, setMode] = useState("ask"); // ask | games | done
  const [gameStep, setGameStep] = useState(0);

  // No button state is in PAGE coordinates
  const [noState, setNoState] = useState({
    x: 40,
    y: 40,
    lastX: 40,
    lastY: 40,
    scale: 1,
    rotate: 0,
    labelIndex: 0,
  });

  const noLabels = useMemo(
    () => ["No", "Are you sure?", "Nope", "Try again 😼", "Not today", "No (escaping)", "You can’t catch me", "Nice try 😄", "Still no", "…no"],
    []
  );

  const games = useMemo(
    () => [
      { key: "tap", component: GameTapHearts },
      { key: "mem", component: GameMemory },
      { key: "final", component: GameFinal },
    ],
    []
  );

  function startGames() {
    setMode("games");
    setGameStep(0);
  }

  function nextGame() {
    setGameStep((s) => {
      const ns = s + 1;
      if (ns >= games.length) {
        setMode("done");
        return s;
      }
      return ns;
    });
  }

  function moveNoButton(intensity = 1) {
    const page = pageRef.current;
    const btn = noBtnRef.current;
    if (!page || !btn) return;

    const p = page.getBoundingClientRect();
    const b = btn.getBoundingClientRect();

    const pad = 12;

    const style = window.getComputedStyle(page);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padTop = parseFloat(style.paddingTop) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;

    const minX = padLeft + pad;
    const minY = padTop + pad;

    const maxX = Math.max(minX, p.width - b.width - padRight - pad);
    const maxY = Math.max(minY, p.height - b.height - padBottom - pad);

    if (maxX <= minX || maxY <= minY) return;

    const lastX = noState.lastX ?? 0;
    const lastY = noState.lastY ?? 0;

    const minDist = Math.min(320, Math.max(140, p.width * 0.28));

    let best = { x: rand(minX, maxX), y: rand(minY, maxY) };
    let bestScore = -Infinity;

    for (let i = 0; i < 28; i++) {
      const x = rand(minX, maxX);
      const y = rand(minY, maxY);

      const dist = Math.hypot(x - lastX, y - lastY);

      const edge = Math.min(x - minX, maxX - x, y - minY, maxY - y);
      const edgePenalty = edge < 36 ? 180 : 0;

      const repeatPenalty = dist < minDist ? 700 : 0;

      const score = dist - edgePenalty - repeatPenalty;

      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }

    // ✅ C'EST ÇA QUI MANQUAIT
    setNoState((s) => ({
      ...s,
      x: best.x,
      y: best.y,
      lastX: best.x,
      lastY: best.y,
      scale: 1,
      rotate: s.rotate + rand(-18, 18) * intensity,
      labelIndex: (s.labelIndex + 1) % noLabels.length,
    }));
  }


  function placeNoNearYes() {
    const page = pageRef.current;
    const noBtn = noBtnRef.current;
    const yesBtn = yesBtnRef.current;
    if (!page || !noBtn || !yesBtn) return;

    const pageRect = page.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    if (noRect.width === 0 || noRect.height === 0) return;

    const gap = 14;

    const x = (yesRect.left - pageRect.left) + yesRect.width + gap;
    const y = (yesRect.top - pageRect.top);

    const pad = 12;
    const maxX = pageRect.width - noRect.width - pad;
    const maxY = pageRect.height - noRect.height - pad;

    const safeX = clamp(x, pad, maxX);
    const safeY = clamp(y, pad, maxY);

    setNoState((s) => ({
      ...s,
      x: safeX,
      y: safeY,
      lastX: safeX,
      lastY: safeY,
      scale: 1,
      rotate: 0,
      labelIndex: 0,
    }));
  }


  function onNoApproach() {
    moveNoButton(1);
  }

  function onNoClick(e) {
    e.preventDefault();
    moveNoButton(1.7);
  }

  // When ask screen appears, put No somewhere sensible
  useEffect(() => {
    if (mode !== "ask") return;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        placeNoNearYes();
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [mode]);



  return (
    <div className="page" ref={pageRef}>
      <div className="bgHearts" aria-hidden="true" />

      {/* NO is positioned relative to PAGE, not inside the row */}
      {mode === "ask" && (
        <button
          ref={noBtnRef}
          className="btn no floatingNo"
          style={{
            transform: `translate(${noState.x}px, ${noState.y}px) scale(${noState.scale}) rotate(${noState.rotate}deg)`,
          }}
          onMouseEnter={onNoApproach}
          onMouseMove={onNoApproach}
          onPointerEnter={onNoApproach}
          onFocus={onNoApproach}
          onPointerDown={onNoApproach} // helps on mobile
          onClick={onNoClick}
        >
          {noLabels[noState.labelIndex]}
        </button>
      )}

      {mode === "ask" && (
        <div className="card hero">
          <h1>Will you be my valentine?</h1>
          <p className="sub">Choose wisely. One of these buttons is… complicated 😇</p>

          <div className="row">
            <button ref={yesBtnRef} className="btn yes" onClick={startGames}>
              Yes 💘
            </button>
          </div>

          <p className="small tip">Tip: try to approach “No” slowly… it doesn’t like that.</p>
        </div>
      )}

      {mode === "games" && (
        <div className="wrap">
          {(() => {
            const Cmp = games[gameStep].component;
            return <Cmp onWin={nextGame} />;
          })()}
          <p className="small">
            Progress: {gameStep + 1}/{games.length}
          </p>
        </div>
      )}

      {mode === "done" && (
        <div className="card hero">
          <h1>YAAAY!!! 💖</h1>
          <p className="sub">You said yes. Mission accomplished.</p>
          <div className="row">
            <button className="btn yes" onClick={() => setMode("ask")}>
              Restart 💞
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
