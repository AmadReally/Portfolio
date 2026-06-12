"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import { SnakeGame, RocketGame } from "./TerminalGames";

const GITHUB_USER = "AmadReally";
const EMAIL = "naimjamalullail@gmail.com";

const NEOFETCH_ART = `<span style="color:#a7c957;font-weight:700">     /\\      </span><span style="color:#ffffff">AmadReally</span><span style="color:rgba(255,255,255,0.4)">@</span><span style="color:#a7c957">console</span>
<span style="color:#a7c957;font-weight:700">    /  \\     </span><span style="color:rgba(255,255,255,0.5)">─────────────────</span>
<span style="color:#a7c957;font-weight:700">   / /\\ \\    </span><span style="color:rgba(255,255,255,0.5)">OS:</span>     <span style="color:#fff">Windows 11 / Linux</span>
<span style="color:#a7c957;font-weight:700">  / ____ \\   </span><span style="color:rgba(255,255,255,0.5)">Shell:</span>  <span style="color:#2dd4bf">zsh</span>
<span style="color:#a7c957;font-weight:700"> /_/    \\_\\  </span><span style="color:rgba(255,255,255,0.5)">Editor:</span> <span style="color:#a78bfa">VS Code</span>
<span style="color:#a7c957;font-weight:700">             </span><span style="color:rgba(255,255,255,0.5)">Theme:</span>  <span style="color:#7a2021">Cherry Dark</span>
<span style="color:#a7c957;font-weight:700">             </span><span style="color:rgba(255,255,255,0.5)">Engine:</span> <span style="color:#a78bfa">Next.js 16</span>
<span style="color:#a7c957;font-weight:700">             </span><span style="color:rgba(255,255,255,0.5)">Uptime:</span> <span style="color:#4ade80">99.9%</span>`;

/* ── Markdown helpers ─────────────────────────────────────────── */
function renderMdInline(text) {
  let t = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  t = t.replace(/\*\*(.+?)\*\*/g, '<span style="color:#fff;font-weight:700">$1</span>');
  t = t.replace(/\*(.+?)\*/g, '<em style="color:rgba(255,255,255,0.8)">$1</em>');
  t = t.replace(/`([^`]+)`/g, '<span style="color:#a7c957;background:rgba(167,201,87,0.15);padding:0 3px;border-radius:3px;font-family:var(--font-mono)">$1</span>');
  return t;
}

function renderMarkdown(md) {
  const lines = md.split("\n");
  const result = [];
  let inCode = false;
  let codeBuf = [];
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        result.push({ type: "response", html: `<span style="color:rgba(167,201,87,0.35);font-family:var(--font-mono)">┌─ code ─────────────────────────────────</span>` });
        codeBuf.forEach((cl) => result.push({ type: "response", html: `<span style="color:#a7c957;font-family:var(--font-mono)">│</span> <span style="color:rgba(255,255,255,0.75);font-family:var(--font-mono)">${cl.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span>` }));
        result.push({ type: "response", html: `<span style="color:rgba(167,201,87,0.35);font-family:var(--font-mono)">└────────────────────────────────────────</span>` });
        inCode = false; codeBuf = [];
      } else { inCode = true; }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }
    if (line.startsWith("# "))        result.push({ type: "response", html: `<span style="color:#a7c957;font-weight:700;font-size:0.9em">━━ ${renderMdInline(line.slice(2))} ━━</span>` });
    else if (line.startsWith("## ")) result.push({ type: "response", html: `<span style="color:#2dd4bf;font-weight:700">${renderMdInline(line.slice(3))}</span>` });
    else if (line.startsWith("### ")) result.push({ type: "response", html: `<span style="color:#f4a261;font-weight:600">${renderMdInline(line.slice(4))}</span>` });
    else if (/^[-*] /.test(line))    result.push({ type: "response", html: `  <span style="color:#a7c957">▸</span> <span style="color:rgba(255,255,255,0.8)">${renderMdInline(line.slice(2))}</span>` });
    else if (line.startsWith("---")) result.push({ type: "response", html: `<span style="color:rgba(255,255,255,0.15)">────────────────────────────────────────</span>` });
    else if (line === "")            result.push({ type: "spacer" });
    else                              result.push({ type: "response", html: `<span style="color:rgba(255,255,255,0.8)">${renderMdInline(line)}</span>` });
  }
  return result;
}

/* ── Help categories ─────────────────────────────────────────── */
const HELP_CATEGORIES = [
  {
    id: "identity",
    label: "Identity",
    color: "#a7c957",
    icon: "◈",
    commands: [
      { cmd: "about",      desc: "Who I am" },
      { cmd: "skills",     desc: "Tech stack" },
      { cmd: "experience", desc: "Work history" },
      { cmd: "contact",    desc: "Get in touch" },
    ],
  },
  {
    id: "system",
    label: "System",
    color: "#2dd4bf",
    icon: "◉",
    commands: [
      { cmd: "neofetch", desc: "System info" },
      { cmd: "status",   desc: "Live metrics" },
      { cmd: "repos",    desc: "GitHub repos" },
    ],
  },
  {
    id: "play",
    label: "Play",
    color: "#f4a261",
    icon: "▶",
    commands: [
      { cmd: "game snake",  desc: "Snake game" },
      { cmd: "game rocket", desc: "Rocket shooter" },
      { cmd: "matrix",      desc: "Digital rain" },
    ],
  },
  {
    id: "devlog",
    label: "Devlog",
    color: "#a78bfa",
    icon: "◆",
    commands: [
      { cmd: "blog",   desc: "List posts" },
      { cmd: "secret", desc: "???" },
    ],
  },
  {
    id: "util",
    label: "Utility",
    color: "rgba(255,248,247,0.35)",
    icon: "○",
    commands: [
      { cmd: "help",  desc: "This menu" },
      { cmd: "clear", desc: "Clear terminal" },
    ],
  },
];

/* ── Command responses ───────────────────────────────────────── */
function buildResponse(cmd, posts) {
  const c = cmd.trim().toLowerCase();

  if (c === "help") {
    return [{ type: "help-panel" }];
  }

  if (c === "about") {
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:#a7c957;font-weight:700">╔══ ABOUT ME ══╗</span>` },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.85)">Hey, I'm <span style="color:#a7c957;font-weight:700">Amad</span> — a Full-Stack Developer</span>` },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.85)">based in <span style="color:#2dd4bf">Malaysia</span>, passionate about building</span>` },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.85)">elegant web experiences and scalable systems.</span>` },
      { type: "spacer" },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.55)">I enjoy turning complex problems into clean,</span>` },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.55)">simple designs. Always shipping, always learning.</span>` },
      { type: "spacer" },
      {
        type: "chips",
        label: "Explore →",
        chips: [
          { label: "skills", cmd: "skills" },
          { label: "experience", cmd: "experience" },
          { label: "contact", cmd: "contact" },
        ],
      },
      { type: "spacer" },
    ];
  }

  if (c === "skills") {
    const skills = [
      { name: "JavaScript / TypeScript", pct: 92, color: "#f7df1e" },
      { name: "React / Next.js",         pct: 88, color: "#61dafb" },
      { name: "HTML / CSS / Tailwind",   pct: 90, color: "#e34c26" },
      { name: "Node.js / Express",       pct: 82, color: "#68a063" },
      { name: "Git / GitHub",            pct: 85, color: "#f05032" },
      { name: "Python",                  pct: 75, color: "#3572a5" },
      { name: "SQL / NoSQL",             pct: 72, color: "#2dd4bf" },
      { name: "Docker / CI-CD",          pct: 65, color: "#a78bfa" },
    ];
    const bars = skills.map((s) => ({
      type: "response",
      html: `<div style="display:flex;align-items:center;gap:8px;padding:2px 0">
        <span style="color:${s.color};font-weight:600;font-size:0.68rem;min-width:168px;flex-shrink:0">${s.name}</span>
        <div style="flex:1;height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;min-width:40px">
          <div style="width:${s.pct}%;height:100%;background:${s.color};border-radius:3px;box-shadow:0 0 8px ${s.color}55"></div>
        </div>
        <span style="color:rgba(255,255,255,0.45);font-size:0.6rem;min-width:28px;text-align:right;font-family:var(--font-mono)">${s.pct}%</span>
      </div>`,
    }));
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:#a7c957;font-weight:700">╔══ SKILLS & TECH STACK ══╗</span>` },
      ...bars,
      { type: "spacer" },
      {
        type: "chips",
        label: "Next →",
        chips: [
          { label: "experience", cmd: "experience" },
          { label: "repos", cmd: "repos" },
        ],
      },
      { type: "spacer" },
    ];
  }

  if (c === "experience") {
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:#a7c957;font-weight:700">╔══ EXPERIENCE ══╗</span>` },
      { type: "response", html: `<span style="color:#fed931;font-weight:700">[ 2024 — Present ]</span>` },
      { type: "response", html: `  <span style="color:#fff;font-weight:600">Full-Stack Developer</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">Building production web apps with React, Next.js,</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">and Node.js backends.</span>` },
      { type: "spacer" },
      { type: "response", html: `<span style="color:#fed931;font-weight:700">[ 2022 — 2024 ]</span>` },
      { type: "response", html: `  <span style="color:#fff;font-weight:600">Frontend Developer</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">Crafting responsive UIs, component libraries,</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">and integrating REST/GraphQL APIs.</span>` },
      { type: "spacer" },
      { type: "response", html: `<span style="color:#fed931;font-weight:700">[ 2020 — 2022 ]</span>` },
      { type: "response", html: `  <span style="color:#fff;font-weight:600">Computer Science Student</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">Data structures, algorithms, software engineering</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">fundamentals. Lots of late-night coding sessions.</span>` },
      { type: "spacer" },
      {
        type: "chips",
        label: "Next →",
        chips: [
          { label: "contact", cmd: "contact" },
          { label: "skills", cmd: "skills" },
        ],
      },
      { type: "spacer" },
    ];
  }

  if (c === "repos") {
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:#a7c957;font-weight:700">╔══ GITHUB REPOS ══╗</span>` },
      { type: "response", html: `  Check the <span style="color:#2dd4bf">Projects</span> panel on the right →` },
      { type: "response", html: `  Or visit: <a href="https://github.com/${GITHUB_USER}" target="_blank" style="color:#a7c957;text-decoration:underline">github.com/${GITHUB_USER}</a>` },
      { type: "spacer" },
    ];
  }

  if (c === "contact") {
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:#a7c957;font-weight:700">╔══ CONTACT ══╗</span>` },
      { type: "response", html: `  <span style="color:#f4a261;font-weight:600">Email</span>    <a href="mailto:${EMAIL}" style="color:#a7c957">${EMAIL}</a>` },
      { type: "response", html: `  <span style="color:#f4a261;font-weight:600">GitHub</span>   <a href="https://github.com/${GITHUB_USER}" target="_blank" style="color:#a7c957">github.com/${GITHUB_USER}</a>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.4)">Open to collaborations, freelance, and full-time roles.</span>` },
      { type: "spacer" },
    ];
  }

  if (c === "neofetch") {
    return [
      { type: "spacer" },
      { type: "response", html: NEOFETCH_ART },
      { type: "spacer" },
    ];
  }

  if (c === "status") {
    const cpu = (12 + Math.random() * 40).toFixed(1);
    const ram = (3.9 + Math.random() * 0.6).toFixed(2);
    const net = (15 + Math.random() * 50).toFixed(2);
    const cpuColor = parseFloat(cpu) > 70 ? "#f87171" : parseFloat(cpu) > 40 ? "#fed931" : "#4ade80";
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:#a7c957;font-weight:700">╔══ SERVER STATUS ══╗</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">CPU Load </span><span style="color:${cpuColor};font-weight:700">${cpu}%</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">Memory   </span><span style="color:#4ade80;font-weight:700">${ram} GiB</span> <span style="color:rgba(255,255,255,0.3)">/ 8.00 GiB</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">Disk     </span><span style="color:#2dd4bf;font-weight:700">26.44 GiB</span> <span style="color:rgba(255,255,255,0.3)">/ 100 GiB</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">Network  </span><span style="color:#fed931;font-weight:700">↓ ${net} KB/s</span>` },
      { type: "response", html: `  <span style="color:rgba(255,255,255,0.55)">Uptime   </span><span style="color:#4ade80;font-weight:700">99.9%</span>` },
      { type: "spacer" },
    ];
  }

  if (c === "secret") {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
    const msg = "KEEP BUILDING. KEEP SHIPPING.";
    const encrypted = msg.split("").map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.3);font-size:0.65rem">Decrypting message...</span>` },
      { type: "response", html: `<span style="color:#a78bfa;font-weight:700;letter-spacing:2px">${encrypted}</span>` },
      { type: "response", html: `<span style="color:#a7c957;font-weight:700;letter-spacing:2px">${msg}</span>` },
      { type: "spacer" },
    ];
  }

  if (c === "matrix") {
    const cols = 42;
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ";
    const rows = Array.from({ length: 6 }, () =>
      Array.from({ length: cols }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    );
    return [
      { type: "spacer" },
      ...rows.map((row) => ({
        type: "response",
        html: row.split("").map((ch) => {
          const bright = Math.random() > 0.85;
          const opacity = 0.15 + Math.random() * 0.7;
          return `<span style="color:rgba(167,201,87,${opacity.toFixed(2)});font-weight:${bright ? 700 : 400}">${ch}</span>`;
        }).join(""),
      })),
      { type: "spacer" },
    ];
  }

  if (c === "clear") {
    return [{ type: "clear" }];
  }

  if (c.startsWith("game ") || c === "game") {
    const sub = c.split(" ")[1];
    if (sub === "snake")  return [{ type: "game", game: "snake" }];
    if (sub === "rocket") return [{ type: "game", game: "rocket" }];
    return [{
      type: "chips",
      label: "Pick a game →",
      chips: [
        { label: "game snake",  cmd: "game snake" },
        { label: "game rocket", cmd: "game rocket" },
      ],
    }];
  }

  if (c === "blog" || c === "blog ls") {
    const list = Array.isArray(posts) ? posts : [];
    if (!list.length) return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.45)">No posts found. Check back later.</span>` },
      { type: "spacer" },
    ];
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:#a78bfa;font-weight:700">╔══ DEVLOG ══╗</span>` },
      ...list.map((p) => ({
        type: "response",
        html: `  <span style="color:#fed931;font-family:var(--font-mono);font-size:0.62rem">${p.date}</span>  <span style="color:#a78bfa;cursor:pointer;font-weight:600" onclick="window.__consoleExec('blog read ${p.slug}')">${p.slug}</span>  <span style="color:rgba(255,255,255,0.6)">${p.title}</span>`,
      })),
      { type: "spacer" },
      {
        type: "chips",
        label: "Read →",
        chips: list.map((p) => ({ label: p.slug, cmd: `blog read ${p.slug}` })),
      },
      { type: "spacer" },
    ];
  }

  if (c.startsWith("blog read ")) {
    const slug = cmd.trim().slice("blog read ".length).trim();
    const list = Array.isArray(posts) ? posts : [];
    const post = list.find((p) => p.slug === slug);
    if (!post) return [
      { type: "response", html: `<span style="color:#f87171">Post not found: <b>${slug}</b></span>` },
      { type: "chips", label: "Try →", chips: [{ label: "blog", cmd: "blog" }] },
    ];
    return [
      { type: "spacer" },
      { type: "response", html: `<span style="color:rgba(255,255,255,0.35);font-family:var(--font-mono);font-size:0.58rem">── ${post.date} ──────────────────────────────</span>` },
      ...renderMarkdown(post.content),
      { type: "response", html: `<span style="color:rgba(255,255,255,0.35);font-family:var(--font-mono);font-size:0.58rem">────────────────────────────────────────────</span>` },
      { type: "chips", label: "Back →", chips: [{ label: "blog", cmd: "blog" }] },
      { type: "spacer" },
    ];
  }

  if (c === "") return [];

  return [
    { type: "response", html: `<span style="color:#f87171">Command not found: <span style="font-weight:700">${cmd}</span></span>` },
    { type: "chips", label: "Try →", chips: [{ label: "help", cmd: "help" }] },
  ];
}

/* ── Welcome screen ──────────────────────────────────────────── */
const WELCOME = [
  { type: "banner" },
  { type: "quickstart" },
  { type: "spacer" },
];

/* ── HelpPanel component ─────────────────────────────────────── */
function HelpPanel({ onExec }) {
  return (
    <div className="help-panel">
      <div className="help-title">COMMAND REFERENCE</div>
      {HELP_CATEGORIES.map((cat) => (
        <div key={cat.id} className="help-category">
          <div className="help-cat-header" style={{ color: cat.color }}>
            <span className="help-cat-icon">{cat.icon}</span>
            {cat.label}
          </div>
          <div className="help-cmds">
            {cat.commands.map((item) => (
              <button
                key={item.cmd}
                className="help-cmd-btn"
                style={{ "--cat-color": cat.color }}
                onClick={() => onExec(item.cmd)}
              >
                <span className="help-cmd-name" style={{ color: cat.color }}>{item.cmd}</span>
                <span className="help-cmd-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Chips component ─────────────────────────────────────────── */
function Chips({ label, chips, onExec }) {
  return (
    <div className="chips-row">
      {label && <span className="chips-label">{label}</span>}
      {chips.map((chip) => (
        <button key={chip.cmd} className="chip-btn" onClick={() => onExec(chip.cmd)}>
          {chip.label}
        </button>
      ))}
    </div>
  );
}

/* ── Banner component ────────────────────────────────────────── */
function Banner({ onExec }) {
  return (
    <div className="console-banner">
      <div className="banner-title">
        <span style={{ color: "#a7c957" }}>AMAD</span>
        <span style={{ color: "rgba(255,248,247,0.4)" }}>@</span>
        <span style={{ color: "#2dd4bf" }}>console</span>
        <span className="banner-blink">_</span>
      </div>
      <div className="banner-sub">Full-Stack Developer · Malaysia · v4.2</div>
      <div className="banner-divider" />
      <div className="banner-hint">
        <span className="banner-hint-prompt">❯</span>
        type{" "}
        <button className="banner-help-btn" onClick={() => onExec("help")}>
          help
        </button>
        {" "}to explore all commands
      </div>
    </div>
  );
}

/* ── Quickstart component ────────────────────────────────────── */
function Quickstart({ onExec }) {
  const picks = [
    { label: "about",       cmd: "about",       color: "#a7c957" },
    { label: "skills",      cmd: "skills",      color: "#61dafb" },
    { label: "neofetch",    cmd: "neofetch",    color: "#a7c957" },
    { label: "game snake",  cmd: "game snake",  color: "#f4a261" },
    { label: "blog",        cmd: "blog",        color: "#a78bfa" },
    { label: "secret",      cmd: "secret",      color: "rgba(255,248,247,0.3)" },
  ];
  return (
    <div className="quickstart-row">
      <span className="quickstart-label">Quick launch</span>
      <div className="quickstart-chips">
        {picks.map((p) => (
          <button
            key={p.cmd}
            className="quickstart-chip"
            style={{ "--chip-color": p.color }}
            onClick={() => onExec(p.cmd)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Console ────────────────────────────────────────────── */
export default function Console() {
  const [lines, setLines] = useState(WELCOME);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const postsRef = useRef([]);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(basePath + "/api/posts.json")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) postsRef.current = d; })
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.__consoleExec = (cmd) => processCommand(cmd);
    return () => { delete window.__consoleExec; };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, 30);
  };

  const processCommand = (cmd) => {
    const trimmed = cmd.trim();
    const results = buildResponse(trimmed, postsRef.current);

    if (results[0]?.type === "clear") {
      setLines(WELCOME);
      return;
    }

    setLines((prev) => [
      ...prev,
      { type: "cmd", text: trimmed },
      ...results,
    ]);
    if (trimmed) setHistory((h) => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);
    scrollToBottom();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processCommand(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : history[next] ?? "");
    }
  };

  useEffect(() => { scrollToBottom(); }, [lines]);

  const renderLine = (line, i) => {
    switch (line.type) {
      case "spacer":
        return <div key={i} style={{ height: 4 }} />;

      case "banner":
        return <Banner key={i} onExec={processCommand} />;

      case "quickstart":
        return <Quickstart key={i} onExec={processCommand} />;

      case "welcome":
        return <div key={i} className="console-line welcome">{line.text}</div>;

      case "hint":
        return <div key={i} className="console-line hint">{line.text}</div>;

      case "cmd":
        return (
          <div key={i} className="console-line cmd">
            <span className="prompt-symbol">❯</span>
            <span className="cmd-text">{line.text}</span>
          </div>
        );

      case "response":
        return (
          <div key={i} className="console-line response"
            dangerouslySetInnerHTML={{ __html: line.html }} />
        );

      case "help-panel":
        return (
          <div key={i} className="console-line response">
            <HelpPanel onExec={processCommand} />
          </div>
        );

      case "chips":
        return (
          <div key={i} className="console-line response" style={{ paddingTop: 2 }}>
            <Chips label={line.label} chips={line.chips} onExec={processCommand} />
          </div>
        );

      case "game":
        if (line.game === "snake") return (
          <div key={i} className="console-line response">
            <SnakeGame onExit={() => {
              setLines((prev) => prev.filter((_, j) => j !== i));
              inputRef.current?.focus();
            }} />
          </div>
        );
        if (line.game === "rocket") return (
          <div key={i} className="console-line response">
            <RocketGame onExit={() => {
              setLines((prev) => prev.filter((_, j) => j !== i));
              inputRef.current?.focus();
            }} />
          </div>
        );
        return null;

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="console-card crt-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="console-titlebar">
        <div className="titlebar-dots">
          <button className="titlebar-dot red" title="Close"
            onClick={(e) => { e.stopPropagation(); setLines(WELCOME); }} />
          <button className="titlebar-dot yellow" title="Minimize"
            onClick={(e) => { e.stopPropagation(); setMinimized((v) => !v); }} />
          <button className="titlebar-dot green" title="Maximize"
            onClick={(e) => e.stopPropagation()} />
        </div>
        <div className="titlebar-center">
          <Terminal size={14} className="titlebar-icon" />
          <span>naim@console — zsh</span>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Body */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            className="console-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, flex: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, minHeight: 0 }}
          >
            <div className="console-output" ref={outputRef}>
              {lines.map(renderLine)}
            </div>

            <form onSubmit={handleSubmit} className="console-input-row">
              <span className="prompt-symbol">❯</span>
              <input
                ref={inputRef}
                className="console-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type a command..."
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
