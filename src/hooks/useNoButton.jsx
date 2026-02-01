import { useState } from "react";

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function rand(min, max) {
  return Math.random() * (max - min) + min;
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

  function move({ page, btn, intensity = 1 }) {
    if (!page || !btn) return;

    const p = page.getBoundingClientRect();
    const b = btn.getBoundingClientRect();

    const pad = 16;
    const minX = pad;
    const minY = pad;
    const maxX = p.width - b.width - pad;
    const maxY = p.height - b.height - pad;

    if (maxX <= minX || maxY <= minY) return;

    let best = { x: rand(minX, maxX), y: rand(minY, maxY) };
    let bestScore = -Infinity;

    for (let i = 0; i < 25; i++) {
      const x = rand(minX, maxX);
      const y = rand(minY, maxY);

      const dist = Math.hypot(x - state.lastX, y - state.lastY);
      const edge = Math.min(x - minX, maxX - x, y - minY, maxY - y);

      const score = dist - (edge < 40 ? 200 : 0);

      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }

    setState((s) => ({
      ...s,
      x: best.x,
      y: best.y,
      lastX: best.x,
      lastY: best.y,
      rotate: s.rotate + rand(-20, 20) * intensity,
      labelIndex: (s.labelIndex + 1) % 10,
    }));
  }

  function placeNearYes({ page, yes, btn }) {
    if (!page || !yes || !btn) return;

    const p = page.getBoundingClientRect();
    const y = yes.getBoundingClientRect();
    const n = btn.getBoundingClientRect();

    if (!n.width) return;

    const gap = 14;
    const x = clamp(y.left - p.left + y.width + gap, 16, p.width - n.width - 16);
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
  }

  return { state, move, placeNearYes };
}
