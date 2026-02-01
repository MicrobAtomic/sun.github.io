import React, { useRef } from "react";

export default function ValentineAsk({ onYes, onNoApproach, onNoClick, noState, noLabels, noBtnRef }) {
  const pageRef = useRef(null);
  return (
    <div className="card hero" ref={pageRef}>
      <h1>Will you be my valentine?</h1>
      <p className="sub">
        Choose wisely. One of these buttons is… complicated 😇
      </p>
      <div className="row">
        <button className="btn yes" onClick={onYes}>
          Yes 💘
        </button>
        <button
          ref={noBtnRef}
          className="btn no"
          style={{
            left: noState.x,
            top: noState.y,
            transform: `scale(${noState.scale}) rotate(${noState.rotate}deg)`
          }}
          onMouseEnter={onNoApproach}
          onFocus={onNoApproach}
          onPointerEnter={onNoApproach}
          onClick={onNoClick}
        >
          {noLabels[noState.labelIndex]}
          {noState.tiny ? " 🐭" : ""}
        </button>
      </div>
      <p className="small tip">
        Tip: try to approach “No” slowly… it doesn’t like that.
      </p>
    </div>
  );
}
