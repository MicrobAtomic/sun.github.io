import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import pokeballHeart from "../assets/pokeball-with-heart.png";
import heartMini from "../assets/heart_mini.gif";
import clickSfx from "../sounds/click-234708.mp3";
const pokeWiggle = new URL("../sounds/sound_effect_pokemon.mp3", import.meta.url).href;

const SWEEP_MIN = -1;
const SWEEP_MAX = 1;
const SWEEP_SPEED = 0.007;
const THROW_X_SCALE = 180;
const THROW_Y_BASE = -134;
const THROW_Y_SWEEP = 22;
const HEART_LOCK = { x: 70, y: -134 };
const HIT_TOLERANCE_PX = 32;
const HIT_TRAVEL_MS = 900;
const MESSAGE_DELAY_MS = 3200;

export default function CaptureHeartGame({ onWin }) {
  const [sweep, setSweep] = useState(SWEEP_MIN);
  const [dir, setDir] = useState(1);
  const [thrown, setThrown] = useState(false);
  const [success, setSuccess] = useState(false);
  const [throwOffset, setThrowOffset] = useState({ x: 0, y: 0 });
  const [shakeOn, setShakeOn] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [captureDone, setCaptureDone] = useState(false);
  const [wiggleArmed, setWiggleArmed] = useState(false);
  const rafRef = useRef(0);
  const audioCtxRef = useRef(null);
  const buffersRef = useRef({ wiggle: null, click: null });
  const wiggleSourceRef = useRef(null);

  const targetSweep = useMemo(() => HEART_LOCK.x / THROW_X_SCALE, []);

  const arcPath = useMemo(() => {
    const baseX = 150;
    const baseY = 160;
    const tipY = 20;
    const side = sweep;

    const tipX = baseX + side * 90;
    const controlX = baseX + side * 130;
    const controlY = 85 - Math.abs(side) * 8;

    return `M${baseX} ${baseY} Q ${controlX} ${controlY} ${tipX} ${tipY}`;
  }, [sweep]);

  useEffect(() => {
    function tick() {
      setSweep((v) => {
        let next = v + SWEEP_SPEED * dir;
        if (next >= SWEEP_MAX) {
          next = SWEEP_MAX;
          setDir(-1);
        } else if (next <= SWEEP_MIN) {
          next = SWEEP_MIN;
          setDir(1);
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dir]);

  useEffect(() => {
    let cancelled = false;
    async function setupAudio() {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const [wiggleBuf, clickBuf] = await Promise.all([
        fetch(pokeWiggle).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)),
        fetch(clickSfx).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)),
      ]);
      if (!cancelled) {
        buffersRef.current = { wiggle: wiggleBuf, click: clickBuf };
      }
    }

    setupAudio().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleThrow = useCallback(() => {
    if (thrown || success) return;
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    setThrown(true);
    const throwX = sweep * THROW_X_SCALE;
    const throwY = THROW_Y_BASE - Math.abs(sweep - targetSweep) * THROW_Y_SWEEP;
    setThrowOffset({ x: throwX, y: throwY });
    const dx = Math.abs(throwX - HEART_LOCK.x);
    const dy = Math.abs(throwY - HEART_LOCK.y);
    const diff = Math.abs(sweep - targetSweep);
    if (dx <= HIT_TOLERANCE_PX && dy <= HIT_TOLERANCE_PX && diff <= 0.6) {
      setThrowOffset(HEART_LOCK);
      setWiggleArmed(true);
      setTimeout(() => {
        setSuccess(true);
      }, HIT_TRAVEL_MS);
    } else {
      setTimeout(() => setThrown(false), 500);
    }
  }, [sweep, targetSweep, thrown, success, onWin]);

  useEffect(() => {
    function onKey(e) {
      if (e.key.toLowerCase() === " " || e.key.toLowerCase() === "enter") {
        e.preventDefault();
        handleThrow();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleThrow]);

  useEffect(() => {
    if (!success || !wiggleArmed) return;
    const ctx = audioCtxRef.current;
    const buffers = buffersRef.current;

    function playBuffer(name, gainValue = 1) {
      if (!ctx || !buffers[name]) return null;
      const src = ctx.createBufferSource();
      src.buffer = buffers[name];
      const gain = ctx.createGain();
      gain.gain.value = gainValue;
      src.connect(gain).connect(ctx.destination);
      src.start(0);
      return src;
    }

    function startWiggle() {
      if (wiggleSourceRef.current) {
        try {
          wiggleSourceRef.current.stop();
        } catch {}
      }
      wiggleSourceRef.current = playBuffer("wiggle", 1.4);
    }

    function stopWiggle() {
      if (wiggleSourceRef.current) {
        try {
          wiggleSourceRef.current.stop();
        } catch {}
        wiggleSourceRef.current = null;
      }
    }
    setShakeOn(false);
    setShowStars(false);
    setCaptureDone(false);
    let cycle = 0;
    let t1;
    let t2;
    let t3;

    function runCycle() {
      if (cycle >= 3) {
        stopWiggle();
        setShowStars(true);
        playBuffer("click", 1.6);
        setCaptureDone(true);
        t3 = setTimeout(() => setShowStars(false), 700);
        return;
      }
      setShakeOn(true);
      startWiggle();
      t1 = setTimeout(() => {
        setShakeOn(false);
        stopWiggle();
        t2 = setTimeout(() => {
          cycle += 1;
          runCycle();
        }, 2000);
      }, 1500);
    }

    runCycle();
    return () => {
      stopWiggle();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [success]);

  useEffect(() => {
    return () => {
      if (wiggleSourceRef.current) {
        try {
          wiggleSourceRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="card hero captureCard">
      <h2>Capture le cœur 💘</h2>
      <p className="sub">Aligne l’arc gris avec le cœur puis appuie pour lancer.</p>

      <div className="captureArena">
        <div className="captureOrigin">
          <img
            className={`captureBall ${thrown ? "throw" : ""} ${success ? "success" : ""} ${shakeOn ? "shakeOn" : ""}`}
            src={pokeballHeart}
            alt="pokeball"
            style={
              thrown
                ? {
                    "--throw-x": `${throwOffset.x}px`,
                    "--throw-y": `${throwOffset.y}px`,
                  }
                : undefined
            }
          />
        </div>

        {!success && (
          <div className="captureTarget">
            <img className="captureHeart" src={heartMini} alt="coeur" />
          </div>
        )}

        {showStars && (
          <div className="captureStars" aria-hidden>
            <span className="captureStar s1">✨</span>
            <span className="captureStar s2">✨</span>
            <span className="captureStar s3">✨</span>
          </div>
        )}

        {!success && (
          <svg className="captureArc" viewBox="0 0 300 180">
            <path d={arcPath} />
          </svg>
        )}
      </div>

      {!success ? (
        <button className="btn yes" onClick={handleThrow} disabled={thrown}>
          Lancer
        </button>
      ) : captureDone ? (
        <>
          <p className="sub">Tu as réussi à capturer mon cœur… tu n’as plus le choix que de dire oui 💖</p>
          <button className="btn yes" onClick={onWin}>
            OUI 💖
          </button>
        </>
      ) : null}
    </div>
  );
}
