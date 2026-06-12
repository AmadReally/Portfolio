"use client";

import { useEffect, useState } from "react";

const CHARSET = "@#S%?*+;:,. ";
const COLS = 30;
const ROWS = 18;

function lum(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export default function AsciiAvatar({ src, alt = "avatar", fallbackSize = 72 }) {
  const [grid, setGrid]   = useState(null);  // computed grid (null=loading, false=fail)
  const [mode, setMode]   = useState("ascii"); // "ascii" | "photo"
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!src) { setGrid(false); return; }
    setGrid(null);
    setMode("ascii");
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = COLS; canvas.height = ROWS;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, COLS, ROWS);
        const { data } = ctx.getImageData(0, 0, COLS, ROWS);
        const rows = [];
        for (let y = 0; y < ROWS; y++) {
          const row = [];
          for (let x = 0; x < COLS; x++) {
            const i = (y * COLS + x) * 4;
            const [r, g, b, a] = [data[i], data[i+1], data[i+2], data[i+3]];
            if (a < 30) { row.push({ ch: " ", r: 0, g: 0, b: 0 }); continue; }
            const idx = Math.floor(lum(r, g, b) * (CHARSET.length - 1));
            row.push({ ch: CHARSET[idx], r, g, b });
          }
          rows.push(row);
        }
        setGrid(rows);
      } catch { setGrid(false); }
    };
    img.onerror = () => setGrid(false);
    img.src = src;
  }, [src]);

  const toggle = () => setMode((m) => (m === "ascii" ? "photo" : "ascii"));

  /* failed or no src → regular image */
  if (grid === false) {
    return (
      <img
        src={src} alt={alt} className="avatar-img"
        width={fallbackSize} height={fallbackSize}
        title="ASCII conversion unavailable"
      />
    );
  }

  /* loading */
  if (!grid) {
    return (
      <div style={{
        width: fallbackSize, height: fallbackSize,
        borderRadius: "50%", border: "2px solid var(--bg-base)",
        background: "rgba(167,201,87,0.06)",
        position: "relative", zIndex: 1,
        animation: "shimmer 1.5s infinite",
      }} />
    );
  }

  /* photo mode */
  if (mode === "photo") {
    return (
      <img
        src={src} alt={alt} className="avatar-img"
        width={fallbackSize} height={fallbackSize}
        onClick={toggle} style={{ cursor: "pointer" }}
        title="Click for ASCII view"
      />
    );
  }

  /* ASCII mode */
  return (
    <div
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Click for photo view"
      style={{
        position: "relative", zIndex: 1,
        width: fallbackSize, height: fallbackSize,
        borderRadius: "50%", overflow: "hidden",
        cursor: "pointer", background: "#0a0a0a",
        border: "2px solid var(--bg-base)",
        transition: "box-shadow 0.2s",
        boxShadow: hovered ? "0 0 14px var(--terminal-green)" : "none",
      }}
    >
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "4px", lineHeight: "4px",
        display: "block", whiteSpace: "pre",
        userSelect: "none",
        transform: "translateX(-1px)",
      }}>
        {grid.map((row, y) => (
          <div key={y} style={{ display: "flex" }}>
            {row.map((cell, x) => (
              <span key={x} style={{ color: `rgb(${cell.r},${cell.g},${cell.b})` }}>
                {cell.ch}
              </span>
            ))}
          </div>
        ))}
      </div>

      {hovered && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "6px", fontFamily: "'JetBrains Mono', monospace",
          color: "var(--terminal-green)", letterSpacing: 0.5,
          fontWeight: 700,
        }}>
          PHOTO
        </div>
      )}
    </div>
  );
}
