import { useEffect, useMemo, useState } from "react";
import mazeSound from "../sounds/maze_sound.m4a";
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

const TILE = 36;

const MAZE = [
  "###############",
  "#..#......#...#",
  "#..#..##..#.#.#",
  "#..#..#...#.#.#",
  "#..##.#.###.#.#",
  "#.....#.#.#...#",
  "###.###.#.###.#",
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

  const sprites = useMemo(
    () => ({
      down: [tile000, tile001, tile002, tile003],
      left: [tile004, tile005, tile006, tile007],
      right: [tile008, tile009, tile010, tile011],
      up: [tile012, tile013, tile014, tile015],
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
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
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
            const spriteSrc = sprites[dir][frame];

            return (
              <div key={`${r}-${c}`} className="tile">
                <div className="ground" />
                {isWall && <div className="wall" />}
                {isPlayer && (
                  <img
                    className="playerSprite"
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
