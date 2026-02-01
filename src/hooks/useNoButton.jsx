import { useCallback, useState } from "react";

let lastMoveTime = 0;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function canMove() {
  const now = performance.now();
  if (now - lastMoveTime < 140) return false;
  lastMoveTime = now;
  return true;
}

export function useNoButton() {
  const [state, setState] = useState({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    rotate: 0,
    labelIndex: 0,
  });

  const move = useCallback(({ page, btn, event, intensity = 1 }) => {
    if (!page || !btn) return;
    if (!canMove()) return;

    const p = page.getBoundingClientRect();
    const b = btn.getBoundingClientRect();

    const pad = 16;
    const minX = pad;
    const minY = pad;
    const maxX = p.width - b.width - pad;
    const maxY = p.height - b.height - pad;

    if (maxX <= minX || maxY <= minY) return;

    setState((s) => {
      const cx = s.x + b.width / 2;
      const cy = s.y + b.height / 2;

      const mx = event?.clientX ?? p.left + p.width / 2;
      const my = event?.clientY ?? p.top + p.height / 2;

      let dx = cx - (mx - p.left);
      let dy = cy - (my - p.top);

      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;

      const jump = 160 + Math.random() * 120;

      let nx = s.x + dx * jump;
      let ny = s.y + dy * jump;

      nx = clamp(nx, minX, maxX);
      ny = clamp(ny, minY, maxY);

      if (Math.hypot(nx - s.x, ny - s.y) < 80) {
        nx = rand(minX, maxX);
        ny = rand(minY, maxY);
      }

      return {
        ...s,
        x: nx,
        y: ny,
        lastX: nx,
        lastY: ny,
        rotate: rand(-25, 25) * intensity,
        labelIndex: (s.labelIndex + 1) % 10,
      };
    });
  }, []);

  const placeNearYes = useCallback(({ page, yes, btn }) => {
    if (!page || !yes || !btn) return;

    const p = page.getBoundingClientRect();
    const y = yes.getBoundingClientRect();
    const n = btn.getBoundingClientRect();

    if (!n.width || !n.height) return;

    const gap = 80;
    const pairWidth = y.width + gap + n.width;
    const desiredCenter = p.width / 2;
    const yesLeft = desiredCenter - pairWidth / 2;
    const x = clamp(yesLeft + y.width + gap, 16, p.width - n.width - 16);
    const yy = clamp(y.top - p.top, 16, p.height - n.height - 16);

    setState((s) => ({
      ...s,
      x,
      y: yy,
      lastX: x,
      lastY: yy,
      rotate: 0,
      labelIndex: 0,
    }));
  }, []);

  return { state, move, placeNearYes };
}
