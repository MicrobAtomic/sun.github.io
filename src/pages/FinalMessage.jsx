import React, { useState } from "react";

export default function FinalMessage({ onRestart }) {
  const [text, setText] = useState("");
  const phrase = "I choose you 💘";

  return (
    <div className="card">
      <h2>Final: Type the magic phrase</h2>
      <p>Type exactly: <b>{phrase}</b></p>
      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here…"
        autoFocus
      />
      <p className="small">Tip: copy carefully 😇</p>
      {text.trim() === phrase && (
        <div className="row">
          <h1>YAAAY!!! 💖</h1>
          <p className="sub">You said yes. Mission accomplished.</p>
          <button className="btn ghost" onClick={onRestart}>Restart</button>
        </div>
      )}
    </div>
  );
}
