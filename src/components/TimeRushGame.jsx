import { useEffect, useRef, useState } from "react";

const TARGET = 10;
const DURATION_MS = 12000;
const SPAWN_MS = 420;
const LIFE_MS = 950;

export default function TimeRushGame({ onWin }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION_MS);
  const [targets, setTargets] = useState([]);
  const [running, setRunning] = useState(true);
  const idRef = useRef(0);
  const spawnRef = useRef(null);

  useEffect(() => {
    if (!running) return;

    const start = Date.now();
    const tickId = setInterval(() => {
      const now = Date.now();
      const t = Math.max(0, DURATION_MS - (now - start));
      setTimeLeft(t);
      setTargets((list) => list.filter((x) => x.expiresAt > now));
      if (t === 0) {
        setRunning(false);
      }
    }, 100);

    return () => clearInterval(tickId);
  }, [running]);

  useEffect(() => {
    if (!running) return;

    spawnRef.current = setInterval(() => {
      const id = idRef.current++;
      const now = Date.now();
      setTargets((list) => [
        ...list,
        {
          id,
          x: Math.random() * 96 + 2,
          y: Math.random() * 86 + 6,
          expiresAt: now + LIFE_MS,
        },
      ]);
    }, SPAWN_MS);

    return () => clearInterval(spawnRef.current);
  }, [running]);

  useEffect(() => {
    if (score >= TARGET) {
      setRunning(false);
      setTargets([]);
      onWin();
    }
  }, [score, onWin]);

  function collect(id) {
    setTargets((list) => list.filter((x) => x.id !== id));
    setScore((s) => s + 1);
  }

  function retry() {
    setScore(0);
    setTargets([]);
    setTimeLeft(DURATION_MS);
    setRunning(true);
  }

  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <div className="rushScreen">
      <div className="rushArea">
        {targets.map((t) => (
          <button
            key={t.id}
            className="rushTarget"
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            onClick={() => collect(t.id)}
            aria-label="target"
          >
            ✨
          </button>
        ))}
      </div>

      <div className="card hero rushOverlay">
        <h2>Mode chrono ⚡</h2>
        <p className="sub">Attrape {TARGET} étoiles avant la fin !</p>
        <p className="small">Temps restant : {seconds}s — {score}/{TARGET}</p>
        {!running && score < TARGET && (
          <button className="btn yes" onClick={retry}>
            Rejouer
          </button>
        )}
      </div>
    </div>
  );
}
