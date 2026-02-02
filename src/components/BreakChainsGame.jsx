import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import heartBomb from "../assets/heart_bomb.gif";
import swordsman from "../assets/swordsman.gif";
import chestGif from "../assets/chest.gif";
import chestFrame00 from "../assets/frame_00_delay-0.5s.gif";
import chestFrame25 from "../assets/frame_25_delay-0.5s.gif";
import heartMini from "../assets/heart_mini.gif";
import swordHit1 from "../sounds/rpg-sword-attack-combo19-388939.mp3";
import swordHit2 from "../sounds/rpg-sword-attack-combo-22-388940.mp3";
import swordHit3 from "../sounds/rpg-sword-attack-combo-24-388941.mp3";
import dragonHeartbeat from "../sounds/dragon-heartbeat-1-232449.mp3";
import heroSkillAttack from "../sounds/hero-skill-attack-reveal-3-384974.mp3";
import woodenTrunk from "../sounds/wooden-trunk-latch-2-183945.mp3";
import metalChain1 from "../sounds/metal-chain-01-64045-[AudioTrimmer.com].mp3";
import metalChain2 from "../sounds/metal-chain-01-64045-[AudioTrimmer.com] (1).mp3";
import lockDoor from "../sounds/locking-the-door-45443-[AudioTrimmer.com].mp3";

const CHAIN_DURATION_MS = 20000;
const MAX_CHAINS = 16;
const CHESTS = 3;
const GUARD_HITS = 20;
const GUARD_DURATION_MS = 5000;
const REGEN_MS = 1500;
const REGEN_AMOUNT = 1;
const LOCK_INTERVAL_MS = 5000;
const LOCK_JITTER_MS = 0;
const LOCK_DURATION_MS = 8000;

const TOOLS = [
  { key: "hammer", label: "🔨", power: 1, durability: 6 },
  { key: "bolt", label: "🔧", power: 1, durability: 9 },
  { key: "laser", label: "✨", power: 2, durability: 4 },
];

export default function BreakChainsGame({ onWin }) {
  const [phase, setPhase] = useState("chests");
  const [openedCount, setOpenedCount] = useState(0);
  const [openedSet, setOpenedSet] = useState(Array(CHESTS).fill(false));
  const [showRay, setShowRay] = useState(false);
  const [rayIndex, setRayIndex] = useState(null);
  const [heartBurstIndex, setHeartBurstIndex] = useState(null);
  const [chestLocked, setChestLocked] = useState(false);
  const [forcedLockUsed, setForcedLockUsed] = useState(false);
  const chestLockRef = useRef(null);
  const [chestAnimIndex, setChestAnimIndex] = useState(null);
  const [chestAnimKey, setChestAnimKey] = useState(0);
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
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  const [lockActive, setLockActive] = useState(false);
  const [chestFrame00Static, setChestFrame00Static] = useState(null);
  const [chestFrame25Static, setChestFrame25Static] = useState(null);
  const chestAnimTimeoutRef = useRef(null);
  const [keyActive, setKeyActive] = useState(false);
  const [lockCanUnlock, setLockCanUnlock] = useState(false);
  const [keyPos, setKeyPos] = useState({ x: 50, y: 50 });
  const lockTimerRef = useRef(null);
  const lockNextRef = useRef(null);
  const swordHitsRef = useRef([]);
  const dragonHeartRef = useRef(null);
  const chestOpenRef = useRef(null);
  const chainHitRef = useRef([]);
  const lockDoorRef = useRef(null);
  const guardDeadlineRef = useRef(0);
  const toolRef = useRef(
    TOOLS.reduce((acc, t) => {
      acc[t.key] = { dur: t.durability, cooldownUntil: 0 };
      return acc;
    }, {})
  );

  useEffect(() => {
    function makeStatic(src, setter) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        setter(canvas.toDataURL("image/png"));
      };
    }

    makeStatic(chestFrame00, setChestFrame00Static);
    makeStatic(chestFrame25, setChestFrame25Static);
  }, []);
  useEffect(() => {
    const hits = [new Audio(swordHit1), new Audio(swordHit2), new Audio(swordHit3)];
    hits.forEach((a) => {
      a.volume = 0.55;
    });
    swordHitsRef.current = hits;
    return () => {
      hits.forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    const a = new Audio(woodenTrunk);
    a.volume = 0.3;
    chestOpenRef.current = a;
    return () => {
      a.pause();
      a.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const sources = [metalChain1, metalChain2, metalChain1, metalChain2];
    const pool = sources.map((src) => {
      const a = new Audio(src);
      a.volume = 0.5;
      return a;
    });
    chainHitRef.current = pool;
    return () => {
      pool.forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    const a = new Audio(lockDoor);
    a.volume = 0.5;
    lockDoorRef.current = a;
    return () => {
      a.pause();
      a.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (!dragonHeartRef.current) {
      const a = new Audio(dragonHeartbeat);
      a.loop = true;
      a.volume = 0.55;
      dragonHeartRef.current = a;
    }
    const audio = dragonHeartRef.current;
    if (phase === "chests" && heartBurstIndex !== null) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [phase, heartBurstIndex]);

  const selected = TOOLS.find((t) => t.key === selectedKey);

  useEffect(() => {
    if (phase !== "guard") return;
    setShowScreamer(true);
    const sfx = new Audio(heroSkillAttack);
    sfx.volume = 0.6;
    sfx.play().catch(() => {});
    const id = setTimeout(() => setShowScreamer(false), 450);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "guard") return;
    guardDeadlineRef.current = Date.now() + GUARD_DURATION_MS;
    setGuardLeft(GUARD_DURATION_MS);
    const id = setInterval(() => {
      const t = Math.max(0, guardDeadlineRef.current - Date.now());
      setGuardLeft(t);
      if (t === 0 && guardHits < GUARD_HITS) {
        setRunning(false);
        setPhase("fail");
      }
    }, 60);
    return () => clearInterval(id);
  }, [phase]);

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

  const randomKeyPos = useCallback(() => {
    // Zone sûre : évite le centre (coeur/chaînes)
    const zones = [
      { xMin: 3, xMax: 18, yMin: 18, yMax: 82 },
      { xMin: 82, xMax: 97, yMin: 18, yMax: 82 },
      { xMin: 18, xMax: 82, yMin: 3, yMax: 14 },
      { xMin: 18, xMax: 82, yMin: 86, yMax: 97 },
    ];
    const z = zones[Math.floor(Math.random() * zones.length)];
    return {
      x: Math.random() * (z.xMax - z.xMin) + z.xMin,
      y: Math.random() * (z.yMax - z.yMin) + z.yMin,
    };
  }, []);

  const nextLockDelay = useCallback(
    () => LOCK_INTERVAL_MS + Math.floor(Math.random() * LOCK_JITTER_MS),
    []
  );

  const spawnLock = useCallback(() => {
    setLockActive(true);
    setKeyActive(true);
    setLockCanUnlock(false);
    setKeyPos(randomKeyPos());
    setLockTimeLeft(LOCK_DURATION_MS);

    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      setLockActive(false);
      setKeyActive(false);
      setLockCanUnlock(false);
      setLockTimeLeft(0);
      if (lockNextRef.current) clearTimeout(lockNextRef.current);
      lockNextRef.current = setTimeout(() => spawnLock(), nextLockDelay());
    }, LOCK_DURATION_MS);
  }, [randomKeyPos, nextLockDelay]);

  useEffect(() => {
    if (phase !== "chains" || !running) return;
    if (!lockNextRef.current) {
      lockNextRef.current = setTimeout(() => spawnLock(), nextLockDelay());
    }
    return () => {
      if (lockNextRef.current) clearTimeout(lockNextRef.current);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      setLockActive(false);
      setKeyActive(false);
      setLockCanUnlock(false);
      setLockTimeLeft(0);
    };
  }, [phase, running, spawnLock, nextLockDelay]);

  useEffect(() => {
    if (phase !== "chains" || !running) return;
    if (!lockActive) return;
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.max(0, LOCK_DURATION_MS - (Date.now() - start));
      setLockTimeLeft(t);
      if (t === 0) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [phase, running, lockActive]);

  useEffect(() => {
    if (phase !== "chains" || !running) return;
    if (links === 5 && !lockActive && !keyActive && !forcedLockUsed) {
      setForcedLockUsed(true);
      if (lockNextRef.current) clearTimeout(lockNextRef.current);
      spawnLock();
    }
  }, [links, phase, running, lockActive, keyActive, forcedLockUsed, spawnLock]);

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

  function openChest(index) {
    if (phase !== "chests" || showRay) return;
    if (chestLocked) return;
    if (openedSet[index]) return;
    if (chestOpenRef.current) {
      chestOpenRef.current.currentTime = 0;
      chestOpenRef.current.play().catch(() => {});
    }
    setChestAnimIndex(index);
    setChestAnimKey((k) => k + 1);
    setChestLocked(true);
    if (chestLockRef.current) clearTimeout(chestLockRef.current);
    chestLockRef.current = setTimeout(() => setChestLocked(false), 1500);
    if (chestAnimTimeoutRef.current) clearTimeout(chestAnimTimeoutRef.current);
    chestAnimTimeoutRef.current = setTimeout(() => setChestAnimIndex(null), 2000);
    setOpenedSet((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setOpenedCount((o) => {
      const next = o + 1;
      if (next >= CHESTS) {
        setRayIndex(index);
        setShowRay(true);
        setTimeout(() => setHeartBurstIndex(index), 1500);
        setTimeout(() => {
          setShowRay(false);
          setRayIndex(null);
          setHeartBurstIndex(null);
          setPhase("guard");
        }, 6000);
      }
      return next;
    });
  }

  function hitGuard() {
    if (phase !== "guard") return;
    const pool = swordHitsRef.current;
    if (pool.length) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) {
        pick.pause();
        pick.currentTime = 0;
        pick.play().catch(() => {});
      }
    }
    setHits((h) => h + 1);
    guardDeadlineRef.current += 500;
    setGuardHits((h) => {
      const next = h + 1;
      if (next >= GUARD_HITS) setPhase("chains");
      return next;
    });
  }

  function hitChain() {
    if (phase !== "chains" || !running) return;
    if (lockActive) return;
    const pool = chainHitRef.current;
    if (pool.length) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) {
        pick.currentTime = 0;
        pick.play().catch(() => {});
      }
    }
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
    setOpenedCount(0);
    setOpenedSet(Array(CHESTS).fill(false));
    setShowRay(false);
    setRayIndex(null);
    setHeartBurstIndex(null);
    setChestLocked(false);
    setForcedLockUsed(false);
    setChestAnimIndex(null);
    if (chestAnimTimeoutRef.current) clearTimeout(chestAnimTimeoutRef.current);
    if (chestLockRef.current) clearTimeout(chestLockRef.current);
    setGuardHits(0);
    setGuardLeft(GUARD_DURATION_MS);
    setLinks(MAX_CHAINS);
    setTimeLeft(CHAIN_DURATION_MS);
    setRunning(true);
    setCombo(0);
    setLastHit(0);
    setLockActive(false);
    setKeyActive(false);
    setLockCanUnlock(false);
    toolRef.current = TOOLS.reduce((acc, t) => {
      acc[t.key] = { dur: t.durability, cooldownUntil: 0 };
      return acc;
    }, {});
  }

  const seconds = Math.floor(timeLeft / 1000);
  const millis = Math.floor((timeLeft % 1000) / 10);
  const guardSeconds = Math.floor(guardLeft / 1000);
  const guardMillis = Math.floor((guardLeft % 1000) / 10);
  const guardProgress = Math.min(guardHits / GUARD_HITS, 1);
  const guardHealthPct = Math.max(0, Math.round(100 * (1 - guardProgress ** 2)));

  const chainView = useMemo(() => "⛓️".repeat(Math.max(0, links)), [links]);

  return (
    <div className="card hero chainCard">
      <h2>Libère le cœur 💗</h2>

      {phase === "chests" && (
        <>
          <div className="chestRow">
            {Array.from({ length: CHESTS }).map((_, i) => (
              <button
                key={i}
                className={`btn ghost chest chestBtn ${openedSet[i] ? "opened" : ""}`}
                onClick={() => openChest(i)}
                disabled={openedSet[i] || showRay || chestLocked}
              >
                <img
                  key={i === chestAnimIndex ? `anim-${chestAnimKey}` : `still-${i}-${openedCount}`}
                  className={`chestImg ${openedSet[i] ? "active" : ""}`}
                  src={
                    i === chestAnimIndex
                      ? chestGif
                      : openedSet[i]
                      ? chestFrame25Static || chestFrame25
                      : chestFrame00Static || chestFrame00
                  }
                  alt="coffre"
                />
                {showRay && rayIndex === i && <div className="chestRay" aria-hidden />}
                {heartBurstIndex === i && (
                  <img className="chestHeartBurst" src={heartMini} alt="coeur" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "guard" && (
        <>
          <p className="sub">Un garde surgit ! Clique vite pour le repousser.</p>
          <div className="timerBig">⏱️ {guardSeconds}.{String(guardMillis).padStart(2, "0")}s</div>
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
          <div className="timerBig">⏱️ {seconds}.{String(millis).padStart(2, "0")}s</div>

          <div className="qteBar">
            <div className="qteSweet" />
            <div className="qteNeedle" style={{ left: `${qte}%` }} />
          </div>

          <div className="chainArea">
            <div className="chainHeart" onClick={hitChain} role="button" tabIndex={0}>
              <img className="heartBomb" src={heartBomb} alt="heart bomb" />
              {lockActive && (
                <button
                  className="lockOverlay"
                  onClick={() => {
                    if (!lockCanUnlock) return;
                    if (lockDoorRef.current) {
                      lockDoorRef.current.currentTime = 0;
                      lockDoorRef.current.play().catch(() => {});
                    }
                    setLockActive(false);
                    setLockCanUnlock(false);
                    setLockTimeLeft(0);
                    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
                    if (lockNextRef.current) clearTimeout(lockNextRef.current);
                    lockNextRef.current = setTimeout(() => {
                      if (phase === "chains" && running) spawnLock();
                    }, nextLockDelay());
                  }}
                >
                  🔒
                </button>
              )}
              <span className="chains">{chainView}</span>
            </div>
            {keyActive && (
              <button
                className="keyItem"
                style={{ left: `${keyPos.x}vw`, top: `${keyPos.y}vh` }}
                onClick={() => {
                  setKeyActive(false);
                  setLockCanUnlock(true);
                }}
              >
                🗝️
              </button>
            )}
          </div>
          {lockActive && (
            <p className="small">Cadenas: {Math.floor(lockTimeLeft / 1000)}.{String(Math.floor((lockTimeLeft % 1000) / 10)).padStart(2, "0")}s</p>
          )}

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
