import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import NoButton from "./components/NoButton";
import HeartMazeGame from "./components/HeartMazeGame";
import CatchHeartsGame from "./components/CatchHeartsGame";
import BreakChainsGame from "./components/BreakChainsGame";
import CaptureHeartGame from "./components/CaptureHeartGame";
import { useNoButton } from "./hooks/useNoButton";
import jimmyRemix from "./sounds/Jimmy Remix 1 (High Scores) - WarioWare, Inc._ Mega Microgames! (OST).mp3";
import driftingAway from "./sounds/Drifting Away D (Instrumental) - WarioWare, Inc._ Mega Microgames! (OST).mp3";
import dribbleBoss from "./sounds/Dribble Boss 1 - WarioWare, Inc._ Mega Microgames! (OST).mp3";
import heroesRising from "./sounds/The Heros Rising  (16-Bit Arcade No Copyright Music).mp3";
import demonsCrest from "./sounds/Demon's Crest OST_ Metropolis of Ruin.mp3";
import heartMini from "./assets/heart_mini.gif";
import altEast0 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_000.png";
import altEast1 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_001.png";
import altEast2 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_002.png";
import altEast3 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_003.png";

export default function App() {
  const pageRef = useRef(null);
  const yesRef = useRef(null);
  const noRef = useRef(null);
  const chainsAudioRef = useRef(null);

  const [mode, setMode] = useState("ask");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [restartLocked, setRestartLocked] = useState(false);
  const [doneFrame, setDoneFrame] = useState(0);

  const labels = useMemo(
    () => [
      "No",
      "Are you sure?",
      "Nope",
      "Try again 😼",
      "Not today",
      "You can’t catch me",
      "Nice try 😄",
      "Still no",
      "…no",
      "Never 😈",
    ],
    []
  );

  const { state, move, placeNearYes } = useNoButton();

  useEffect(() => {
    function enable() {
      setAudioEnabled(true);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    }
    window.addEventListener("pointerdown", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    };
  }, []);

  useEffect(() => {
    function jump(e) {
      if (e.key.toLowerCase() === "p") {
        setMode("capture");
      }
    }
    window.addEventListener("keydown", jump);
    return () => window.removeEventListener("keydown", jump);
  }, []);

  function playOneShot(src, duration = 4500, volume = 0.55, loop = false) {
    if (!audioEnabled) return;
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audio.play().catch(() => {});
    const stop = () => {
      audio.pause();
      audio.currentTime = 0;
    };
    const t = loop ? null : setTimeout(stop, duration);
    return () => {
      if (t) clearTimeout(t);
      stop();
    };
  }

  useEffect(() => {
    if (mode !== "interlude" || !audioEnabled) return;
    const cleanup = playOneShot(jimmyRemix, 0, 0.8, true);
    return () => cleanup && cleanup();
  }, [mode, audioEnabled]);

  useEffect(() => {
    if (mode !== "interlude2" || !audioEnabled) return;
    const cleanup = playOneShot(dribbleBoss, 0, 0.8, true);
    return () => cleanup && cleanup();
  }, [mode, audioEnabled]);

  useEffect(() => {
    if (mode !== "ask" || !audioEnabled) return;
    const audio = new Audio(driftingAway);
    audio.loop = true;
    audio.volume = 0.55;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [mode, audioEnabled]);

  useEffect(() => {
    if (mode !== "done") return;
    if (!audioEnabled) return;
    const audio = new Audio(heroesRising);
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [mode, audioEnabled]);

  useEffect(() => {
    if (!audioEnabled) return;
    const shouldPlay = mode === "chains" || mode === "capture";
    if (!chainsAudioRef.current) {
      const audio = new Audio(demonsCrest);
      audio.loop = true;
      audio.volume = 0.45;
      audio.currentTime = 2;
      chainsAudioRef.current = audio;
    }
    const audio = chainsAudioRef.current;
    if (shouldPlay) {
      if (audio.paused) audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [mode, audioEnabled]);

  useEffect(() => {
    if (mode !== "done") return;
    setRestartLocked(true);
    const t = setTimeout(() => setRestartLocked(false), 3000);
    return () => clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (mode !== "done") return;
    const id = setInterval(() => {
      setDoneFrame((f) => (f + 1) % 4);
    }, 120);
    return () => clearInterval(id);
  }, [mode]);

  useEffect(() => {
    if (mode !== "done") return;
    const confetti = window.confetti;
    if (!confetti) return;

    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ["heart"],
      colors: ["FFC0CB", "FF69B4", "FF1493", "C71585"],
    };

    confetti({ ...defaults, particleCount: 50, scalar: 2 });
    confetti({ ...defaults, particleCount: 25, scalar: 3 });
    confetti({ ...defaults, particleCount: 10, scalar: 4 });

    const duration = 15 * 1000;
    let animationEnd = Date.now() + duration;
    let skew = 1;
    let rafId = 0;

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    (function frame() {
      const timeLeft = animationEnd - Date.now();
      const ticks = Math.max(200, 500 * (timeLeft / duration));

      skew = Math.max(0.8, skew - 0.001);

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2,
        },
        colors: ["#FFC0CB", "#FF69B4", "#FF1493", "#C71585"],
        shapes: ["heart"],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(1.2, 1.8),
        drift: randomInRange(-0.4, 0.4),
      });

      if (timeLeft > 0 && mode === "done") {
        rafId = requestAnimationFrame(frame);
      } else if (mode === "done") {
        animationEnd = Date.now() + duration;
        rafId = requestAnimationFrame(frame);
      }
    })();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "ask") return;

    let r1, r2;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        placeNearYes({
          page: pageRef.current,
          yes: yesRef.current,
          btn: noRef.current,
        });
      });
    });

    function onResize() {
      placeNearYes({
        page: pageRef.current,
        yes: yesRef.current,
        btn: noRef.current,
      });
    }

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      window.removeEventListener("resize", onResize);
    };
  }, [mode, placeNearYes]);

  return (
    <div className="page" ref={pageRef}>
      {mode === "ask" && (
        <>
          <NoButton
            noRef={noRef}
            state={state}
            labels={labels}
            onMove={(e) =>
              move({
                page: pageRef.current,
                btn: noRef.current,
                event: e,
                intensity: 1,
              })
            }
            onClick={(e) => {
              e.preventDefault();
              move({
                page: pageRef.current,
                btn: noRef.current,
                event: e,
                intensity: 1.6,
              });
            }}
          />
          <div className="card hero">
            <h1>Will you be my valentine?</h1>
            <p className="sub">
              Choose wisely. One of these buttons is… complicated 😇
            </p>

            <div className="row">
              <button ref={yesRef} className="btn yes" onClick={() => setMode("game")}>
                Yes 💘
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "game" && (
        <HeartMazeGame onWin={() => setMode("interlude")} />
      )}

      {mode === "interlude" && (
        <div className="card hero">
          <h2>Ce n’est pas encore fini... !</h2>
          <p className="sub">Un dernier défi t’attend 💘</p>
          <button
            className="btn yes"
            onClick={() => {
              setAudioEnabled(true);
              setMode("catch");
            }}
          >
            Continuer
          </button>
        </div>
      )}

      {mode === "catch" && (
        <CatchHeartsGame onWin={() => setMode("interlude2")} />
      )}

      {mode === "interlude2" && (
        <div className="card hero">
          <h2>Oh non ce n’est pas fini !</h2>
          <p className="sub">Libère le cœur avant la fin ⛓️⏱️</p>
          <button
            className="btn yes"
            onClick={() => {
              setAudioEnabled(true);
              setMode("chains");
            }}
          >
            C’est parti
          </button>
        </div>
      )}

      {mode === "chains" && (
        <BreakChainsGame onWin={() => setMode("capture")} />
      )}

      {mode === "capture" && (
        <CaptureHeartGame onWin={() => setMode("done")} />
      )}

      {mode === "done" && (
        <div className="card hero">
          <h1>YAAAY!!! 💖</h1>
          <p className="sub">You said yes. Mission accomplished.</p>
          <button
            className="btn yes"
            onClick={() => setMode("ask")}
            disabled={restartLocked}
          >
            Restart 💞
          </button>
          <div className="doneChaseRow">
            <img
              className="doneRunner"
              src={[altEast0, altEast1, altEast2, altEast3][doneFrame]}
              alt="fille rousse"
            />
            <img
              className="doneHeart"
              src={heartMini}
              alt="coeur"
            />
          </div>
        </div>
      )}
    </div>
  );
}


