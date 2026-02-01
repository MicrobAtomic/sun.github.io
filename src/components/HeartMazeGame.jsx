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

function findChar(grid, ch) {
  for (let r = 0; r < grid.length; r += 1) {
    const c = grid[r].indexOf(ch);
    if (c !== -1) return { r, c };
  }
  return null;
}

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
  const [collected, setCollected] = useState(false);
  const [dir, setDir] = useState("down");
  const [step, setStep] = useState(0);
  const [moving, setMoving] = useState(false);
  const [selectedSprite, setSelectedSprite] = useState(null);
  const [previewFrame, setPreviewFrame] = useState(0);
  const audioRef = useRef(null);
  const stepRef = useRef([]);

  useEffect(() => {
    if (selectedSprite) return;
    const id = setInterval(() => {
      setPreviewFrame((f) => (f + 1) % 4);
    }, 120);
    return () => clearInterval(id);
  }, [selectedSprite]);

  useEffect(() => {
    if (!moving) return;
    const id = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 120);
    return () => clearInterval(id);
  }, [moving]);

  useEffect(() => {
    if (collected) onWin();
  }, [collected, onWin]);

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
    if (!selectedSprite) return;
    function handleKey(e) {
      if (collected) return;
      const key = e.key.toLowerCase();
      let dr = 0;
      let dc = 0;
      if (key === "arrowup" || key === "w") {
        dr = -1;
        setDir("up");
      }
      if (key === "arrowdown" || key === "s") {
        dr = 1;
        setDir("down");
      }
      if (key === "arrowleft" || key === "a") {
        dc = -1;
        setDir("left");
      }
      if (key === "arrowright" || key === "d") {
        dc = 1;
        setDir("right");
      }
      if (!dr && !dc) return;

      e.preventDefault();
      setMoving(true);

      setPlayer((p) => {
        const nr = p.r + dr;
        const nc = p.c + dc;
        if (grid[nr]?.[nc] === "#") return p;
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
        const next = { r: nr, c: nc };
        if (nr === heart.r && nc === heart.c) {
          setCollected(true);
        }
        setStep((s) => (s + 1) % 4);
        return next;
      });
    }

    function handleKeyUp() {
      setMoving(false);
    }

    window.addEventListener("keydown", handleKey, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [grid, heart, collected]);

  if (!selectedSprite) {
    const previewDefault = defaultSprites.right[previewFrame];
    const previewAlt = altSprites.right[previewFrame];
    return (
      <div className="card hero mazeCard">
        <h2>Choisis ton personnage</h2>
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
            const isPlayer = player.r === r && player.c === c;
            const isHeart = heart.r === r && heart.c === c && !collected;

            const frame = step;
            const spriteSrc = activeSprites[dir][frame];

            return (
              <div key={`${r}-${c}`} className="tile">
                <div className="ground" />
                {isWall && <div className="wall" />}
                {isPlayer && (
                  <img
                    className={`playerSprite ${selectedSprite === "alt" ? "playerSpriteAlt" : ""}`}
                    src={spriteSrc}
                    alt="player"
                  />
                )}
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
      </div>

      {!collected && <p className="small"></p>}
    </div>
  );
}
