import { useEffect, useMemo, useRef, useState } from "react";
import mazeSound from "../sounds/maze_sound.m4a";
import grassTurn from "../sounds/grass-turn-394496.mp3";
import tile000 from "../assets/sprite/tile000.png";
import tile001 from "../assets/sprite/tile001.png";
import tile002 from "../assets/sprite/tile002.png";
import tile003 from "../assets/sprite/tile003.png";
import tile004 from "../assets/sprite/tile004.png";
import tile005 from "../assets/sprite/tile005.png";
import tile006 from "../assets/sprite/tile006.png";
import tile007 from "../assets/sprite/tile007.png";
import tile008 from "../assets/sprite/tile008.png";
import tile009 from "../assets/sprite/tile009.png";
import tile010 from "../assets/sprite/tile010.png";
import tile011 from "../assets/sprite/tile011.png";
import tile012 from "../assets/sprite/tile012.png";
import tile013 from "../assets/sprite/tile013.png";
import tile014 from "../assets/sprite/tile014.png";
import tile015 from "../assets/sprite/tile015.png";
import pokeballHeart from "../assets/pokeball-with-heart.png";
import altEast0 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_000.png";
import altEast1 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_001.png";
import altEast2 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_002.png";
import altEast3 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/east/frame_003.png";
import altWest0 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/west/frame_000.png";
import altWest1 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/west/frame_001.png";
import altWest2 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/west/frame_002.png";
import altWest3 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/west/frame_003.png";
import altSouth0 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/south/frame_000.png";
import altSouth1 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/south/frame_001.png";
import altSouth2 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/south/frame_002.png";
import altSouth3 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/south/frame_003.png";
import altNorth0 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/north/frame_000.png";
import altNorth1 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/north/frame_001.png";
import altNorth2 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/north/frame_002.png";
import altNorth3 from "../assets/caractere_pokemon_feminin_rousse_avec_des_lunettes/animations/running-4-frames/north/frame_003.png";

const TILE = 36;
const GAP = 2;
const PADDING = 8;
const MOVE_MS = 240;
const MOVE_FRAMES = 3;
const INPUT_BUFFER_MS = 200;

const MAZE = [
  "###############",
  "#..#......#...#",
  "#..#..##..#.#.#",
  "#..#..#...#.#.#",
  "#..#.##.###.#.#",
  "#.....#.#.#...#",
  "#######.#.###.#",
  "#...#...#.....#",
  "#.###.#####.###",
  "#.....#...#...#",
  "#.#####.#.#.#.#",
  "#.....#.#.#.#.#",
  "#..#..#.......#",
  "#..#......###.#",
  "###############",
];

export default function HeartMazeGame({ onWin }) {
  const grid = useMemo(() => MAZE.map((row) => row.split("")), []);

  const defaultSprites = useMemo(
    () => ({
      down: [tile000, tile001, tile002, tile003],
      left: [tile004, tile005, tile006, tile007],
      right: [tile008, tile009, tile010, tile011],
      up: [tile012, tile013, tile014, tile015],
    }),
    []
  );

  const altSprites = useMemo(
    () => ({
      down: [altSouth0, altSouth1, altSouth2, altSouth3],
      left: [altWest0, altWest1, altWest2, altWest3],
      right: [altEast0, altEast1, altEast2, altEast3],
      up: [altNorth0, altNorth1, altNorth2, altNorth3],
    }),
    []
  );

  const start = { r: 1, c: 1 };
  const heart = { r: 13, c: 13 };

  const [player, setPlayer] = useState(start);
  const [displayPos, setDisplayPos] = useState(start);
  const [collected, setCollected] = useState(false);
  const [dir, setDir] = useState("down");
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [selectedSprite, setSelectedSprite] = useState(null);
  const [previewFrame, setPreviewFrame] = useState(0);
  const audioRef = useRef(null);
  const stepRef = useRef([]);
  const moveRafRef = useRef(0);
  const keyDownRef = useRef(false);
  const desiredDirRef = useRef({ dr: 0, dc: 0, dir: "down" });
  const lastInputRef = useRef({ dr: 0, dc: 0, dir: "down", time: 0 });
  const keysDownRef = useRef(new Set());
  const playerRef = useRef(start);

  useEffect(() => {
    if (selectedSprite) return;
    const id = setInterval(() => {
      setPreviewFrame((f) => (f + 1) % 4);
    }, 120);
    return () => clearInterval(id);
  }, [selectedSprite]);

  useEffect(() => {
    if (collected) onWin();
  }, [collected, onWin]);

  useEffect(() => {
    playerRef.current = player;
    if (!animating) setDisplayPos(player);
  }, [player, animating]);

  useEffect(() => {
    const audio = new Audio(mazeSound);
    audioRef.current = audio;
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const pool = Array.from({ length: 4 }).map(() => {
      const a = new Audio(grassTurn);
      a.volume = 0.5;
      return a;
    });
    stepRef.current = pool;
    return () => {
      pool.forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(moveRafRef.current);
  }, []);


  useEffect(() => {
    if (!selectedSprite) return;

    function attemptMove(dr, dc, nextDir) {
      if (collected) return;
      if (animating) return;
      const current = playerRef.current;
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (grid[nr]?.[nc] === "#") {
        desiredDirRef.current = { dr: 0, dc: 0, dir: nextDir };
        lastInputRef.current = { dr: 0, dc: 0, dir: nextDir, time: performance.now() };
        return;
      }

      setDir(nextDir);

      const pool = stepRef.current;
      if (pool.length) {
        const pick = pool.find((a) => a.paused) || pool[0];
        pick.currentTime = 0;
        pick.playbackRate = 1.2;
        pick.play().catch(() => {});
        setTimeout(() => {
          pick.pause();
          pick.currentTime = 0;
        }, 650);
      }

      const from = { r: current.r, c: current.c };
      const to = { r: nr, c: nc };
      setAnimating(true);
      const startTime = performance.now();

      function animate(now) {
        const t = Math.min(1, (now - startTime) / MOVE_MS);
        const r = from.r + (to.r - from.r) * t;
        const c = from.c + (to.c - from.c) * t;
        setDisplayPos({ r, c });
        const frame = Math.min(MOVE_FRAMES - 1, Math.floor(t * MOVE_FRAMES));
        setStep(frame);
        if (t < 1) {
          moveRafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayPos(to);
          playerRef.current = to;
          setPlayer(to);
          setAnimating(false);
          setStep(0);
          if (to.r === heart.r && to.c === heart.c) {
            setCollected(true);
          }
          const { dr: nd, dc: nc2, dir: ndir } = desiredDirRef.current;
          const now = performance.now();
          const shouldBufferMove =
            (nd || nc2) &&
            (keyDownRef.current || now - lastInputRef.current.time < INPUT_BUFFER_MS);
          if (shouldBufferMove) {
            attemptMove(nd, nc2, ndir);
          }
        }
      }

      moveRafRef.current = requestAnimationFrame(animate);
    }

    function handleKey(e) {
      const key = e.key.toLowerCase();
      let dr = 0;
      let dc = 0;
      let nextDir = dir;
      if (key === "arrowup" || key === "w") {
        dr = -1;
        nextDir = "up";
      }
      if (key === "arrowdown" || key === "s") {
        dr = 1;
        nextDir = "down";
      }
      if (key === "arrowleft" || key === "a") {
        dc = -1;
        nextDir = "left";
      }
      if (key === "arrowright" || key === "d") {
        dc = 1;
        nextDir = "right";
      }
      if (!dr && !dc) return;
      e.preventDefault();
      keysDownRef.current.add(key);
      keyDownRef.current = keysDownRef.current.size > 0;
      desiredDirRef.current = { dr, dc, dir: nextDir };
      lastInputRef.current = { dr, dc, dir: nextDir, time: performance.now() };
      attemptMove(dr, dc, nextDir);
    }

    function handleKeyUp(e) {
      const key = e.key.toLowerCase();
      if (
        key === "arrowup" ||
        key === "w" ||
        key === "arrowdown" ||
        key === "s" ||
        key === "arrowleft" ||
        key === "a" ||
        key === "arrowright" ||
        key === "d"
      ) {
        keysDownRef.current.delete(key);
        keyDownRef.current = keysDownRef.current.size > 0;
      }
    }

    window.addEventListener("keydown", handleKey, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [grid, heart, collected, animating, player, selectedSprite, dir]);

  if (!selectedSprite) {
    const previewDefault = defaultSprites.right[previewFrame];
    const previewAlt = altSprites.right[previewFrame];
    return (
      <div className="card hero mazeCard">
        <h2>Choisis ton personnage</h2>
        <p className="small">Si tu veux être ma valentine il va falloir capturer mon cœur...</p>
        <div className="runnerRow">
          <button className="runnerCard" onClick={() => setSelectedSprite("default")}>
            <img className="runner" src={previewDefault} alt="runner default" />
            <span className="small">Classique</span>
          </button>
          <button className="runnerCard" onClick={() => setSelectedSprite("alt")}>
            <img className="runner runnerAlt" src={previewAlt} alt="runner alt" />
            <span className="small">C'est toi ?</span>
          </button>
        </div>
      </div>
    );
  }

  const activeSprites = selectedSprite === "alt" ? altSprites : defaultSprites;
  const frame = step;
  const spriteSrc = activeSprites[dir][frame];

  return (
    <div className="card hero mazeCard">
      <h2>Heart Pokeball Maze 💖</h2>
      <div
        className="maze"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, ${TILE}px)`,
          gridTemplateRows: `repeat(${grid.length}, ${TILE}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isWall = cell === "#";
            const isHeart = heart.r === r && heart.c === c && !collected;

            return (
              <div key={`${r}-${c}`} className="tile">
                <div className="ground" />
                {isWall && <div className="wall" />}
                {isHeart && (
                  <img
                    className="heartSprite"
                    src={pokeballHeart}
                    alt="pokeball heart"
                  />
                )}
              </div>
            );
          })
        )}
        <div
          className="mazePlayer"
          style={{
            left: `${PADDING + displayPos.c * (TILE + GAP)}px`,
            top: `${PADDING + displayPos.r * (TILE + GAP)}px`,
          }}
        >
          <img
            className={selectedSprite === "alt" ? "playerSprite playerSpriteAlt" : "playerSprite"}
            src={spriteSrc}
            alt="player"
          />
        </div>
      </div>
    </div>
  );
}
