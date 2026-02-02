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
import jumpEast0 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_000.png";
import jumpEast1 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_001.png";
import jumpEast2 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_002.png";
import jumpEast3 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_003.png";
import jumpEast4 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_004.png";
import jumpEast5 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_005.png";
import jumpEast6 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_006.png";
import jumpEast7 from "./assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-jump/east/frame_007.png";
import burger1 from "./assets/burger/burger1.png";
import burger2 from "./assets/burger/burger2.png";
import burger3 from "./assets/burger/burger3.png";
import burger4 from "./assets/burger/burger4.png";

const DONE_WIDTH = 420;
const DONE_HEIGHT = 96;
const DONE_PLAYER_X = 54;
const DONE_PLAYER_Y = 18;
const DONE_PLAYER_W = 76;
const DONE_PLAYER_H = 76;
const DONE_HEART_X = 300;
const DONE_HEART_Y = 18;
const DONE_BURGER_MIN_MS = 1800;
const DONE_BURGER_MAX_MS = 3200;
const DONE_BURGER_SPEED = 140;
const DONE_JUMP_RANGE = 12;
const DONE_BURGER_MIN_GAP = 120;
const DONE_BURGER_MAX_COUNT = 2;
const DONE_BURGER_SIZE = 30;
const DONE_JUMP_COOLDOWN_MS = 420;

export default function App() {
  const pageRef = useRef(null);
  const yesRef = useRef(null);
  const noRef = useRef(null);
  const chainsAudioRef = useRef(null);

  const [mode, setMode] = useState("ask");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [restartLocked, setRestartLocked] = useState(false);
  const [doneFrame, setDoneFrame] = useState(0);
  const [doneBurgers, setDoneBurgers] = useState([]);
  const [doneJumping, setDoneJumping] = useState(false);
  const [doneJumpFrame, setDoneJumpFrame] = useState(0);
  const doneBurgersRef = useRef([]);
  const doneBurgerRafRef = useRef(0);
  const doneBurgerTimerRef = useRef(0);
  const doneJumpingRef = useRef(false);
  const doneJumpCooldownRef = useRef(0);

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
        setMode("done");
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
    doneBurgersRef.current = doneBurgers;
  }, [doneBurgers]);

  useEffect(() => {
    if (mode !== "done") {
      setDoneBurgers([]);
      setDoneJumping(false);
      setDoneJumpFrame(0);
      doneJumpingRef.current = false;
      return;
    }

    const burgerImages = [burger1, burger2, burger3, burger4];

    function scheduleNext() {
      const delay =
        DONE_BURGER_MIN_MS + Math.random() * (DONE_BURGER_MAX_MS - DONE_BURGER_MIN_MS);
      doneBurgerTimerRef.current = window.setTimeout(spawnBurger, delay);
    }

    function spawnBurger() {
      if (doneBurgersRef.current.length >= DONE_BURGER_MAX_COUNT) {
        scheduleNext();
        return;
      }
      const minX = DONE_PLAYER_X + DONE_PLAYER_W + 40;
      const maxX = DONE_HEART_X - 32;
      let startX = minX + Math.random() * Math.max(1, maxX - minX);
      const tries = 6;
      for (let i = 0; i < tries; i += 1) {
        const tooClose = doneBurgersRef.current.some(
          (b) => Math.abs(b.x - startX) < DONE_BURGER_MIN_GAP
        );
        if (!tooClose) break;
        startX = minX + Math.random() * Math.max(1, maxX - minX);
      }
      const stillClose = doneBurgersRef.current.some(
        (b) => Math.abs(b.x - startX) < DONE_BURGER_MIN_GAP
      );
      if (stillClose) {
        scheduleNext();
        return;
      }
      const startY = DONE_PLAYER_Y + 43;
      const img = burgerImages[Math.floor(Math.random() * burgerImages.length)];
      const id = `${Date.now()}-${Math.random()}`;
      setDoneBurgers((prev) => [
        ...prev,
        { id, x: startX, y: startY, img, lastTs: performance.now() },
      ]);
      scheduleNext();
    }

    function animateBurgers(now) {
      setDoneBurgers((prev) =>
        prev
          .map((b) => {
            const dt = Math.min(50, now - (b.lastTs || now));
            const nx = b.x - (DONE_BURGER_SPEED * dt) / 1000;
            return { ...b, x: nx, lastTs: now };
          })
          .filter((b) => b.x > -40)
      );

      const px = DONE_PLAYER_X + DONE_PLAYER_W * 0.5;
      const py = DONE_PLAYER_Y + DONE_PLAYER_H * 0.7;
      const closeBurger = doneBurgersRef.current.find((b) => {
        const withinLane = Math.abs(b.y - py) < 14;
        const passedPlayer = b.x < px + 12;
        const inRange = Math.abs(b.x - px) < DONE_JUMP_RANGE + DONE_BURGER_SIZE * 0.5;
        return withinLane && passedPlayer && inRange;
      });
      const nowMs = performance.now();
      if (
        closeBurger &&
        !doneJumpingRef.current &&
        nowMs - doneJumpCooldownRef.current > DONE_JUMP_COOLDOWN_MS
      ) {
        doneJumpingRef.current = true;
        doneJumpCooldownRef.current = nowMs;
        setDoneJumping(true);
        setDoneJumpFrame(0);
      }

      doneBurgerRafRef.current = requestAnimationFrame(animateBurgers);
    }

    scheduleNext();
    spawnBurger();
    doneBurgerRafRef.current = requestAnimationFrame(animateBurgers);

    return () => {
      window.clearTimeout(doneBurgerTimerRef.current);
      cancelAnimationFrame(doneBurgerRafRef.current);
    };
  }, [mode]);

  useEffect(() => {
    if (!doneJumping) return;
    const frames = 8;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      if (frame >= frames) {
        window.clearInterval(id);
        doneJumpingRef.current = false;
        setDoneJumping(false);
        setDoneJumpFrame(0);
        return;
      }
      setDoneJumpFrame(frame);
    }, 60);
    return () => window.clearInterval(id);
  }, [doneJumping]);

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
            {doneBurgers.map((b) => (
              <img
                key={b.id}
                src={b.img}
                alt="burger"
                className="doneBurger"
                style={{ left: `${b.x}px`, top: `${b.y}px` }}
              />
            ))}
            <img
              className="doneRunner"
              style={{ left: `${DONE_PLAYER_X}px`, top: `${DONE_PLAYER_Y}px` }}
              src={
                doneJumping
                  ? [
                      jumpEast0,
                      jumpEast1,
                      jumpEast2,
                      jumpEast3,
                      jumpEast4,
                      jumpEast5,
                      jumpEast6,
                      jumpEast7,
                    ][doneJumpFrame]
                  : [altEast0, altEast1, altEast2, altEast3][doneFrame]
              }
              alt="fille rousse"
            />
            <img
              className="doneHeart"
              style={{ left: `${DONE_HEART_X}px`, top: `${DONE_HEART_Y}px` }}
              src={heartMini}
              alt="coeur"
            />
          </div>
        </div>
      )}
    </div>
  );
}


