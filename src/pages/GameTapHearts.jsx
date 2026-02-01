import React, { useState, useEffect } from "react";

export default function GameTapHearts({ onWin }) {
  const target = 8;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= target) onWin();
  }, [count, onWin]);

  return (
    <div className="card">
      <h2>Mini-game 1: Tap the hearts</h2>
      <p>
        Click <b>{target}</b> hearts to continue. ({count}/{target})
      </p>
      <button className="btn yes" onClick={() => setCount((c) => c + 1)}>
        💗 Tap
      </button>
    </div>
  );
}
