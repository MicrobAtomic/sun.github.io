export default function NoButton({
  noRef,
  state,
  labels,
  onMove,
  onClick,
}) {
  return (
    <button
      ref={noRef}
      className="btn no floatingNo"
      style={{
        transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotate}deg)`,
      }}
      onMouseEnter={onMove}
      onMouseMove={onMove}
      onPointerEnter={onMove}
      onPointerDown={onMove}
      onClick={onClick}
    >
      {labels[state.labelIndex]}
    </button>
  );
}
