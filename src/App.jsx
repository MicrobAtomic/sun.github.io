import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import NoButton from "./components/NoButton";
import { useNoButton } from "./hooks/useNoButton";

export default function App() {
  const pageRef = useRef(null);
  const yesRef = useRef(null);
  const noRef = useRef(null);

  const [mode, setMode] = useState("ask");

  const labels = useMemo(
    () => [
      "No",
      "Are you sure?",
      "Nope",
      "Try again 😼",
      "Not today",
      "You can’t catch me",
      "Nice try 😄",
      "Still no",
      "…no",
      "Never 😈",
    ],
    []
  );

  const { state, move, placeNearYes } = useNoButton();

  useEffect(() => {
    if (mode !== "ask") return;

    let r1, r2;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        placeNearYes({
          page: pageRef.current,
          yes: yesRef.current,
          btn: noRef.current,
        });
      });
    });

    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [mode, placeNearYes]);

  return (
    <div className="page" ref={pageRef}>
      {mode === "ask" && (
        <>
          <NoButton
            noRef={noRef}
            state={state}
            labels={labels}
            onMove={(e) =>
              move({
                page: pageRef.current,
                btn: noRef.current,
                event: e,
                intensity: 1,
              })
            }
            onClick={(e) => {
              e.preventDefault();
              move({
                page: pageRef.current,
                btn: noRef.current,
                event: e,
                intensity: 1.6,
              });
            }}
          />
          <div className="card hero">
            <h1>Will you be my valentine?</h1>
            <p className="sub">
              Choose wisely. One of these buttons is… complicated 😇
            </p>

            <div className="row">
              <button ref={yesRef} className="btn yes" onClick={() => setMode("done")}>
                Yes 💘
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "done" && (
        <div className="card hero">
          <h1>YAAAY!!! 💖</h1>
          <p className="sub">You said yes. Mission accomplished.</p>
          <button className="btn yes" onClick={() => setMode("ask")}>
            Restart 💞
          </button>
        </div>
      )}
    </div>
  );
}


