import { useEffect, useMemo, useRef, useState } from "react";
import heartBomb from "../assets/heart_bomb.gif";
import swordsman from "../assets/swordsman.gif";
import demonsCrest from "../sounds/Demon's Crest OST_ Metropolis of Ruin.mp3";

const CHAIN_DURATION_MS = 12000;
const MAX_CHAINS = 8;
const CHESTS = 3;
const GUARD_HITS = 20;
const GUARD_DURATION_MS = 3000;
const REGEN_MS = 1600;
const REGEN_AMOUNT = 1;

const TOOLS = [
  { key: "hammer", label: "🔨", power: 2, durability: 6 },
  { key: "bolt", label: "🔧", power: 1, durability: 9 },
  { key: "laser", label: "✨", power: 3, durability: 4 },
];

export default function BreakChainsGame({ onWin }) {
  const [phase, setPhase] = useState("chests");
  const [opened, setOpened] = useState(0);
  const [guardHits, setGuardHits] = useState(0);
  const [guardLeft, setGuardLeft] = useState(GUARD_DURATION_MS);
  const [showScreamer, setShowScreamer] = useState(false);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(CHAIN_DURATION_MS);
  const [links, setLinks] = useState(MAX_CHAINS);
  const [running, setRunning] = useState(true);
  const [selectedKey, setSelectedKey] = useState(TOOLS[1].key);
  const [combo, setCombo] = useState(0);
  const [lastHit, setLastHit] = useState(0);
  const [qte, setQte] = useState(0);
  const [qteDir, setQteDir] = useState(1);
  const toolRef = useRef(
    TOOLS.reduce((acc, t) => {
      acc[t.key] = { dur: t.durability, cooldownUntil: 0 };
      return acc;
    }, {})
  );

  useEffect(() => {
    const audio = new Audio(demonsCrest);
    audio.loop = true;
    audio.volume = 0.45;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const selected = TOOLS.find((t) => t.key === selectedKey);

  useEffect(() => {
    if (phase !== "guard") return;
    setShowScreamer(true);
    const id = setTimeout(() => setShowScreamer(false), 450);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "guard") return;
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.max(0, GUARD_DURATION_MS - (Date.now() - start));
      setGuardLeft(t);
      if (t === 0 && guardHits < GUARD_HITS) {
        setRunning(false);
        setPhase("fail");
      }
    }, 60);
    return () => clearInterval(id);
  }, [phase, guardHits]);

  useEffect(() => {
    if (phase !== "chains" || !running) return;
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.max(0, CHAIN_DURATION_MS - (Date.now() - start));
      setTimeLeft(t);
      if (t === 0) {
        setRunning(false);
        setPhase("fail");
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, running]);

  useEffect(() => {
    if (phase !== "chains" || !running) return;
    const id = setInterval(() => {
      setLinks((l) => Math.min(MAX_CHAINS, l + REGEN_AMOUNT));
    }, REGEN_MS);
    return () => clearInterval(id);
  }, [phase, running]);

  useEffect(() => {
    if (phase !== "chains") return;
    const id = setInterval(() => {
      setQte((v) => {
        let nv = v + 4 * qteDir;
        if (nv >= 100) {
          nv = 100;
          setQteDir(-1);
        } else if (nv <= 0) {
          nv = 0;
          setQteDir(1);
        }
        return nv;
      });
    }, 50);
    return () => clearInterval(id);
  }, [phase, qteDir]);

  useEffect(() => {
    if (links <= 0) {
      setRunning(false);
      onWin();
    }
  }, [links, onWin]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const tools = toolRef.current;
      Object.keys(tools).forEach((k) => {
        if (tools[k].dur <= 0 && tools[k].cooldownUntil <= now) {
          const base = TOOLS.find((t) => t.key === k)?.durability ?? 5;
          tools[k].dur = base;
        }
      });
    }, 150);
    return () => clearInterval(id);
  }, []);

  function openChest() {
    if (phase !== "chests") return;
    setOpened((o) => {
      const next = o + 1;
      if (next >= CHESTS) setPhase("guard");
      return next;
    });
  }

  function hitGuard() {
    if (phase !== "guard") return;
    setHits((h) => h + 1);
    setGuardHits((h) => {
      const next = h + 1;
      if (next >= GUARD_HITS) setPhase("chains");
      return next;
    });
  }

  function hitChain() {
    if (phase !== "chains" || !running) return;
    const tool = toolRef.current[selected.key];
    const now = Date.now();
    if (tool.dur <= 0) return;

    const isCrit = qte >= 45 && qte <= 55;
    const withinCombo = now - lastHit < 700;
    const newCombo = withinCombo ? combo + 1 : 1;
    setCombo(newCombo);
    setLastHit(now);

    const comboMul = 1 + Math.min(newCombo - 1, 5) * 0.15;
    const critMul = isCrit ? 2 : 1;
    const dmg = Math.max(1, Math.round(selected.power * comboMul * critMul));

    tool.dur -= 1;
    if (tool.dur <= 0) {
      tool.cooldownUntil = now + 1800;
    }

    setLinks((l) => Math.max(0, l - dmg));
  }

  function retry() {
    setPhase("chests");
    setOpened(0);
    setGuardHits(0);
    setGuardLeft(GUARD_DURATION_MS);
    setLinks(MAX_CHAINS);
    setTimeLeft(CHAIN_DURATION_MS);
    setRunning(true);
    setCombo(0);
    setLastHit(0);
    toolRef.current = TOOLS.reduce((acc, t) => {
      acc[t.key] = { dur: t.durability, cooldownUntil: 0 };
      return acc;
    }, {});
  }

  const seconds = Math.ceil(timeLeft / 1000);
  const guardSeconds = Math.ceil(guardLeft / 1000);
  const guardProgress = Math.min(guardHits / GUARD_HITS, 1);
  const guardHealthPct = Math.max(0, Math.round(100 * (1 - guardProgress ** 2)));

  const chainView = useMemo(() => "⛓️".repeat(Math.max(0, links)), [links]);

  return (
    <div className="card hero chainCard">
      <h2>Libère le cœur 💗</h2>

      {phase === "chests" && (
        <>
          <p className="sub">Ouvre les 3 coffres pour trouver le cœur.</p>
          <div className="chestRow">
            {Array.from({ length: CHESTS }).map((_, i) => (
              <button
                key={i}
                className={`btn ghost chest ${i < opened ? "opened" : ""}`}
                onClick={openChest}
              >
                {i < opened ? "🧰" : "📦"}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "guard" && (
        <>
          <p className="sub">Un garde surgit ! Clique vite pour le repousser.</p>
          <div className="timerBig">⏱️ {guardSeconds}s</div>
          <div className="guardArea">
            <button
              className="guardHitbox"
              onClick={hitGuard}
              style={{ "--hit-scale": 1 + Math.pow(Math.min(hits, 20) / 20, 3) * 0.2 }}
            >
              <img className="guardSprite" src={swordsman} alt="guard" />
            </button>
            <div className="guardBar">
              <div className="guardBarFill" style={{ width: `${guardHealthPct}%` }} />
            </div>
          </div>
          {showScreamer && <div className="screamer">BOU !</div>}
        </>
      )}

      {phase === "chains" && (
        <>
          <p className="sub">Casse les chaînes avant la fin du chrono !</p>
          <div className="timerBig">⏱️ {seconds}s</div>

          <div className="qteBar">
            <div className="qteSweet" />
            <div className="qteNeedle" style={{ left: `${qte}%` }} />
          </div>

          <div className="chainArea">
            <div className="chainHeart" onClick={hitChain} role="button" tabIndex={0}>
              <img className="heartBomb" src={heartBomb} alt="heart bomb" />
              <span className="chains">{chainView}</span>
            </div>
          </div>

          <div className="toolRow">
            {TOOLS.map((t) => {
              const tool = toolRef.current[t.key];
              const disabled = tool.dur <= 0;
              return (
                <button
                  key={t.key}
                  className={`btn ghost toolBtn ${selected.key === t.key ? "active" : ""} ${disabled ? "disabled" : ""}`}
                  onClick={() => setSelectedKey(t.key)}
                  disabled={disabled}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <p className="small">Outil: {selected.label} — Puissance: {selected.power}</p>
          <p className="small">Combo: x{combo} — Chaînes: {links}</p>
        </>
      )}

      {phase === "fail" && (
        <>
          <p className="sub">Raté... Essaie encore !</p>
          <button className="btn yes" onClick={retry}>Réessayer</button>
        </>
      )}
    </div>
  );
}
