"use client";

import { useEffect } from "react";
import "./hexpile.css";

declare global {
  interface Window {
    __hexpileTeardown?: () => void;
  }
}

/**
 * Hexpile — an independent interaction study, kept as the plain DOM/canvas
 * program it was written as. React renders the shell and never re-renders it;
 * everything inside `#pile` and on `#fx` is built imperatively by hexpile.js,
 * which is loaded from /public on mount and torn down again on unmount so a
 * Strict Mode remount starts clean instead of stacking a second animation loop.
 */
export default function Hexpile({ className }: { className?: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/design-study/taste/hexpile.js";
    script.async = false;
    document.body.appendChild(script);

    return () => {
      window.__hexpileTeardown?.();
      script.remove();
    };
  }, []);

  return (
    <main className={className}>
      <svg className="defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="hexRound" clipPathUnits="objectBoundingBox">
            <path id="hexRoundPath" d="" />
          </clipPath>
        </defs>
      </svg>

      <section className="stage" id="stage" data-armed="0" data-live="0">
        <canvas id="fx" aria-hidden="true" />
        <p className="corner mono">
          <span className="arrow">&#8594;</span> Leave it or love it
        </p>

        <div className="instruct">
          <h1>
            Drag a tile
            <br />
            <em>To build your taste profile</em>
          </h1>
        </div>

        <div className="arena" id="arena">
          <p className="edge edge--pass" id="edgePass">
            Hmm, not for me <sup id="countPass">00</sup>
          </p>
          <p className="edge edge--love" id="edgeLove">
            Love it <sup id="countLove">00</sup>
          </p>

          <div
            className="pile"
            id="pile"
            tabIndex={0}
            role="group"
            aria-label="Thirteen tiles. Sort six. Left and right arrow keys sort, up and down change tile, backspace undoes."
          />

          <div className="summary" id="summary" hidden>
            <div className="card" role="img" aria-label="Taste ID card placeholder">
              <span className="card__slot" />
              <div className="card__head">
                <span>Taste ID</span>
                <span>Personal profile</span>
              </div>
              <div className="card__rule" />
              <p className="card__msg">you guys already do the taste card phenomenally :)</p>
              <div className="card__foot">
                <span id="cardStat">06 sorted</span>
                <span className="card__dot">Taste verified</span>
              </div>
            </div>
            <button className="ctl mono" id="again">
              Sort again
            </button>
          </div>
        </div>

        <div className="footer">
          <p className="progress mono">
            <b id="progressNow">0</b> / 6
          </p>
        </div>

        <p className="vh" aria-live="polite" id="live" />
      </section>

      <section className="notes" id="notes">
        <div className="notes__wrap">
          <h2>Design decisions</h2>
          <ol>
            <li>
              <span>01</span>
              <p>Vertical card stacking makes the swipe interaction immediately more intuitive.</p>
            </li>
            <li>
              <span>02</span>
              <p>
                Right = like and left = dislike uses familiar interaction patterns from existing
                social platforms.
              </p>
            </li>
            <li>
              <span>03</span>
              <p>
                A visible completion target at the bottom sets expectations for how long the
                interaction will take.
              </p>
            </li>
            <li>
              <span>04</span>
              <p>
                Motion during drag-and-drop gives immediate feedback and makes the categorization
                behavior clearer.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
