"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ══ SNAKE GAME ══ */
const SNAKE_COLS = 20;
const SNAKE_ROWS = 14;
const CELL = 18;

function SnakeGame({ onExit }) {
  const [snake, setSnake] = useState([[5, 5], [5, 4], [5, 3]]);
  const [food, setFood] = useState([10, 8]);
  const [dir, setDir] = useState([0, 1]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const dirRef = useRef([0, 1]);
  const snakeRef = useRef([[5, 5], [5, 4], [5, 3]]);
  const foodRef = useRef([10, 8]);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);

  const randomFood = (s) => {
    let pos;
    do {
      pos = [
        Math.floor(Math.random() * SNAKE_ROWS),
        Math.floor(Math.random() * SNAKE_COLS),
      ];
    } while (s.some((c) => c[0] === pos[0] && c[1] === pos[1]));
    return pos;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "p" || e.key === "P") {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        return;
      }
      const map = {
        ArrowUp: [-1, 0], ArrowDown: [1, 0],
        ArrowLeft: [0, -1], ArrowRight: [0, 1],
        w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1],
      };
      const nd = map[e.key];
      if (!nd) return;
      const cur = dirRef.current;
      if (nd[0] === -cur[0] && nd[1] === -cur[1]) return;
      dirRef.current = nd;
      setDir(nd);
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (gameOverRef.current) return;
    const interval = setInterval(() => {
      if (pausedRef.current || gameOverRef.current) return;
      const s = snakeRef.current;
      const d = dirRef.current;
      const head = [s[0][0] + d[0], s[0][1] + d[1]];

      if (
        head[0] < 0 || head[0] >= SNAKE_ROWS ||
        head[1] < 0 || head[1] >= SNAKE_COLS ||
        s.some((c) => c[0] === head[0] && c[1] === head[1])
      ) {
        gameOverRef.current = true;
        setGameOver(true);
        return;
      }

      const f = foodRef.current;
      const ate = head[0] === f[0] && head[1] === f[1];
      const newSnake = ate ? [head, ...s] : [head, ...s.slice(0, -1)];
      if (ate) {
        const nf = randomFood(newSnake);
        foodRef.current = nf;
        setFood(nf);
        setScore((sc) => sc + 10);
      }
      snakeRef.current = newSnake;
      setSnake([...newSnake]);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const restart = () => {
    const s = [[5, 5], [5, 4], [5, 3]];
    const f = [10, 8];
    snakeRef.current = s;
    foodRef.current = f;
    dirRef.current = [0, 1];
    gameOverRef.current = false;
    pausedRef.current = false;
    setSnake(s);
    setFood(f);
    setDir([0, 1]);
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  const grid = Array.from({ length: SNAKE_ROWS }, (_, r) =>
    Array.from({ length: SNAKE_COLS }, (_, c) => {
      const isHead = snake[0]?.[0] === r && snake[0]?.[1] === c;
      const isBody = !isHead && snake.some((sc, i) => i > 0 && sc[0] === r && sc[1] === c);
      const isFood = food[0] === r && food[1] === c;
      return { isHead, isBody, isFood };
    })
  );

  return (
    <div style={{ fontFamily: "var(--font-mono)", color: "#ffffff", padding: "8px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.65rem" }}>
        <span style={{ color: "var(--terminal-green)", fontWeight: 700 }}>SNAKE v1.0</span>
        <span>SCORE: <span style={{ color: "var(--highlight-yellow)", fontWeight: 700 }}>{score}</span></span>
        <button onClick={onExit} style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "2px 8px", borderRadius: 4, fontSize: "0.6rem", cursor: "pointer" }}>EXIT</button>
      </div>
      <div style={{ border: "1px solid rgba(167,201,87,0.3)", borderRadius: 4, overflow: "hidden", width: SNAKE_COLS * CELL, userSelect: "none" }}>
        {grid.map((row, r) => (
          <div key={r} style={{ display: "flex" }}>
            {row.map((cell, c) => (
              <div key={c} style={{
                width: CELL, height: CELL,
                background: cell.isHead ? "#a7c957" : cell.isBody ? "rgba(167,201,87,0.55)" : cell.isFood ? "#fb7185" : "rgba(0,0,0,0.4)",
                borderRadius: cell.isHead ? 3 : cell.isFood ? "50%" : 0,
                transition: "background 0.05s",
              }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: "0.55rem", color: "rgba(255,255,255,0.5)", display: "flex", gap: 12 }}>
        <span>WASD / Arrow Keys</span>
        <span>P = Pause</span>
        {paused && <span style={{ color: "var(--highlight-yellow)" }}>PAUSED</span>}
      </div>
      {gameOver && (
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 6 }}>GAME OVER — Score: {score}</div>
          <button onClick={restart} style={{ background: "rgba(167,201,87,0.15)", border: "1px solid rgba(167,201,87,0.4)", color: "var(--terminal-green)", padding: "4px 16px", borderRadius: 4, fontSize: "0.65rem", cursor: "pointer", marginRight: 8 }}>RETRY</button>
          <button onClick={onExit} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", padding: "4px 16px", borderRadius: 4, fontSize: "0.65rem", cursor: "pointer" }}>EXIT</button>
        </div>
      )}
    </div>
  );
}

/* ══ ROCKET GAME ══ */
const ROCKET_W = 340;
const ROCKET_H = 200;

function RocketGame({ onExit }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    player: { x: 50, y: ROCKET_H / 2, vy: 0 },
    bullets: [],
    enemies: [],
    score: 0,
    lives: 3,
    over: false,
    frame: 0,
    keys: {},
  });
  const [display, setDisplay] = useState({ score: 0, lives: 3, over: false });
  const rafRef = useRef(null);

  const spawnEnemy = () => {
    const s = stateRef.current;
    s.enemies.push({ x: ROCKET_W + 10, y: 10 + Math.random() * (ROCKET_H - 30), r: 10 });
  };

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.over) return;
    s.frame++;

    const p = s.player;
    if (s.keys["ArrowUp"] || s.keys["w"]) p.vy -= 0.4;
    if (s.keys["ArrowDown"] || s.keys["s"]) p.vy += 0.4;
    p.vy *= 0.92;
    p.y = Math.max(10, Math.min(ROCKET_H - 10, p.y + p.vy));

    if (s.frame % 20 === 0) {
      s.bullets.push({ x: p.x + 14, y: p.y, vx: 7 });
    }
    if (s.frame % 60 === 0) spawnEnemy();

    s.bullets = s.bullets.filter((b) => {
      b.x += b.vx;
      return b.x < ROCKET_W + 10;
    });
    s.enemies = s.enemies.filter((e) => {
      e.x -= 2.5;
      if (e.x < -20) { s.lives--; return false; }
      return true;
    });

    s.bullets = s.bullets.filter((b) => {
      const hit = s.enemies.findIndex((e) => Math.hypot(b.x - e.x, b.y - e.y) < e.r + 4);
      if (hit !== -1) { s.enemies.splice(hit, 1); s.score += 5; return false; }
      return true;
    });

    const hit = s.enemies.some((e) => Math.hypot(p.x - e.x, p.y - e.y) < e.r + 8);
    if (hit) s.lives = Math.max(0, s.lives - 1);

    if (s.lives <= 0) s.over = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ROCKET_W, ROCKET_H);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, ROCKET_W, ROCKET_H);

    for (let i = 0; i < 30; i++) {
      const sx = ((i * 137 + s.frame * 0.3) % ROCKET_W);
      const sy = ((i * 97) % ROCKET_H);
      ctx.fillStyle = `rgba(255,255,255,${0.1 + (i % 5) * 0.05})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = "#a7c957";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fb7185";
    ctx.fillRect(-12, -3, 6, 6);
    ctx.restore();

    s.bullets.forEach((b) => {
      ctx.fillStyle = "#fed931";
      ctx.fillRect(b.x - 4, b.y - 1, 8, 2);
    });

    s.enemies.forEach((e) => {
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "11px monospace";
    ctx.fillText(`SCORE ${s.score}`, 6, 14);
    ctx.fillText(`♥ ${s.lives}`, ROCKET_W - 36, 14);

    setDisplay({ score: s.score, lives: s.lives, over: s.over });
    if (!s.over) rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    const onKey = (e) => { s.keys[e.key] = e.type === "keydown"; };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  const restart = () => {
    stateRef.current = {
      player: { x: 50, y: ROCKET_H / 2, vy: 0 },
      bullets: [], enemies: [],
      score: 0, lives: 3, over: false, frame: 0, keys: {},
    };
    setDisplay({ score: 0, lives: 3, over: false });
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div style={{ fontFamily: "var(--font-mono)", color: "#ffffff", padding: "8px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.65rem" }}>
        <span style={{ color: "var(--terminal-green)", fontWeight: 700 }}>ROCKET v1.0</span>
        <button onClick={onExit} style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "2px 8px", borderRadius: 4, fontSize: "0.6rem", cursor: "pointer" }}>EXIT</button>
      </div>
      <canvas ref={canvasRef} width={ROCKET_W} height={ROCKET_H} style={{ border: "1px solid rgba(167,201,87,0.3)", borderRadius: 4, display: "block" }} />
      <div style={{ marginTop: 6, fontSize: "0.55rem", color: "rgba(255,255,255,0.5)" }}>W/S or Arrow Keys to move — bullets fire automatically</div>
      {display.over && (
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 6 }}>GAME OVER — Score: {display.score}</div>
          <button onClick={restart} style={{ background: "rgba(167,201,87,0.15)", border: "1px solid rgba(167,201,87,0.4)", color: "var(--terminal-green)", padding: "4px 16px", borderRadius: 4, fontSize: "0.65rem", cursor: "pointer", marginRight: 8 }}>RETRY</button>
          <button onClick={onExit} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", padding: "4px 16px", borderRadius: 4, fontSize: "0.65rem", cursor: "pointer" }}>EXIT</button>
        </div>
      )}
    </div>
  );
}

export { SnakeGame, RocketGame };
