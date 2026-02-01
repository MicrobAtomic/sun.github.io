import { useEffect, useRef, useState } from "react";
import adventureBegins from "../sounds/Adventure Begins  (16-Bit Arcade No Copyright Music).mp3";
import popupShow from "../sounds/popup-show-384945.mp3";

const TARGET = 10;
const SPAWN_MS = 450;
const LIFE_MS = 1200;

export default function CatchHeartsGame({ onWin }) {
  const [hearts, setHearts] = useState([]);
  const [score, setScore] = useState(0);
  const idRef = useRef(0);
  const intervalRef = useRef(null);
  const popRef = useRef([]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const id = idRef.current++;
      setHearts((h) => [
        ...h,
        {
          id,
          x: Math.random() * 96 + 2,
          y: Math.random() * 86 + 6,
        },
      ]);
      setTimeout(() => {
        setHearts((h) => h.filter((x) => x.id !== id));
      }, LIFE_MS);
    }, SPAWN_MS);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = new Audio(adventureBegins);
    audio.loop = true;
    audio.volume = 0.20;
    audio.currentTime = 50;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const pool = Array.from({ length: 4 }).map(() => {
      const a = new Audio(popupShow);
      a.volume = 0.6;
      return a;
    });
    popRef.current = pool;
    return () => {
      pool.forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    if (score >= TARGET) {
      clearInterval(intervalRef.current);
      onWin();
    }
  }, [score, onWin]);

  function collect(id) {
    const pool = popRef.current;
    if (pool.length) {
      const pick = pool.find((a) => a.paused) || pool[0];
      pick.currentTime = 0;
      pick.play().catch(() => {});
    }
    setHearts((h) => h.filter((x) => x.id !== id));
    setScore((s) => s + 1);
  }

  return (
    <div className="catchScreen">
      <div className="catchArea">
        {hearts.map((h) => (
          <button
            key={h.id}
            className="fallingHeart"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            onClick={() => collect(h.id)}
            aria-label="heart"
          >
            💗
          </button>
        ))}
      </div>
      <div className="card hero catchOverlay">
        <h2>Attrape les cœurs 💗</h2>
        <p className="sub">Clique sur {TARGET} cœurs pour continuer.</p>
        <p className="small">{score}/{TARGET} attrapés</p>
      </div>
    </div>
  );
}
