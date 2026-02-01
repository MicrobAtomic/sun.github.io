import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import ValentineAsk from "./pages/ValentineAsk";
import GameTapHearts from "./pages/GameTapHearts";
import GameMemory from "./pages/GameMemory";
import FinalMessage from "./pages/FinalMessage";

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

// ---------- Main App ----------

export default function App() {
  const pageRef = useRef(null);
  const noBtnRef = useRef(null);
  const yesBtnRef = useRef(null);

  const [mode, setMode] = useState("ask"); // ask | games | final
  const [gameStep, setGameStep] = useState(0);
  const [noState, setNoState] = useState({
    x: 150,
    y: 0,
    lastX: 150,
    lastY: 0,
    scale: 1,
    rotate: 0,
    tiny: false,
    labelIndex: 0,
  });
  const noLabels = useMemo(
    () => [
      "No",
      "Are you sure?",
      "Nope",
      "Try again 😼",
      "Not today",
      "No (escaping)",
      "You can’t catch me",
      "Nice try 😄",
      "Still no",
      "…no",
    ],
    []
  );

  function moveNoButton(intensity = 1) {
    const page = pageRef.current;
    const btn = noBtnRef.current;
    if (!page || !btn) return;
    const style = window.getComputedStyle(page);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padTop = parseFloat(style.paddingTop) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;
    const p = page.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const pad = 4;
    const minX = padLeft + pad;
    const minY = padTop + pad;
    const maxX = p.width - b.width - padRight - pad;
    const maxY = p.height - b.height - padBottom - pad;
    if (maxX <= minX || maxY <= minY) return;
    const lastX = noState.lastX ?? 0;
    const lastY = noState.lastY ?? 0;
    const minDist = Math.min(260, Math.max(120, p.width * 0.25));
    let best = { x: rand(minX, maxX), y: rand(minY, maxY) };
    let bestScore = -Infinity;
    for (let i = 0; i < 24; i++) {
      const x = rand(minX, maxX);
      const y = rand(minY, maxY);
      const dist = Math.hypot(x - lastX, y - lastY);
      const edge = Math.min(x - minX, maxX - x, y - minY, maxY - y);
      const edgePenalty = edge < 28 ? 200 : 0;
      const repeatPenalty = dist < minDist ? 800 : 0;
      const score = dist - edgePenalty - repeatPenalty;
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    setNoState((s) => {
      const nScale = s.scale;
      return {
        ...s,
        x: best.x,
        y: best.y,
        lastX: best.x,
        lastY: best.y,
        scale: nScale,
        rotate: s.rotate + rand(-20, 20) * intensity,
        labelIndex: (s.labelIndex + 1) % noLabels.length,
        tiny: nScale <= 0.9,
      };
    });
  }
  function onNoApproach() {
    moveNoButton(1);
  }
  function onNoClick(e) {
    e.preventDefault();
    moveNoButton(1.7);
  }
  function startGames() {
    setMode("games");
    setGameStep(0);
  }
  function nextGame() {
    setGameStep((s) => {
      const ns = s + 1;
      if (ns >= 2) {
        setMode("final");
        return s;
      }
      return ns;
    });
  }
  function restart() {
    setMode("ask");
    setNoState({
      x: 150,
      y: 0,
      lastX: 150,
      lastY: 0,
      scale: 1,
      rotate: 0,
      tiny: false,
      labelIndex: 0,
    });
  }

  return (
    <div className="page" ref={pageRef}>
      <div className="bgHearts" aria-hidden="true" />
      {mode === "ask" && (
        <ValentineAsk
          onYes={startGames}
          onNoApproach={onNoApproach}
          onNoClick={onNoClick}
          noState={noState}
          noLabels={noLabels}
          noBtnRef={noBtnRef}
        />
      )}
      {mode === "games" && (
        <div className="wrap">
          {gameStep === 0 && <GameTapHearts onWin={nextGame} />}
          {gameStep === 1 && <GameMemory onWin={nextGame} />}
          <p className="small">Progress: {gameStep + 1}/2</p>
        </div>
      )}
      {mode === "final" && (
        <FinalMessage onRestart={restart} />
      )}
    </div>
  );
}
