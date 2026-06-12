"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const GithubIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function StatusBar() {
  const [time, setTime] = useState("");
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    const tick = () => {
      setTime(
        new Intl.DateTimeFormat("en-MY", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false, timeZone: "Asia/Kuala_Lumpur",
        }).format(new Date())
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(basePath + "/api/github.json?v=" + Date.now())
      .then((r) => {
        setApiStatus(r.ok);
      })
      .catch(() => setApiStatus(false));
  }, []);

  return (
    <motion.div
      className="status-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="status-left">
        <div className="ping-dot" />
        <span style={{ fontWeight: 700, letterSpacing: "0.08em" }}>CONSOLE ACTIVE</span>
      </div>

      <div className="status-right">
        <div className="status-badge">
          <span style={{ opacity: 0.6 }}>MYT</span>
          <span style={{ fontWeight: 700 }}>{time}</span>
        </div>
        <div className="status-separator" />
        <div className="status-badge">
          <GithubIcon size={11} />
          <span style={{ color: apiStatus === true ? "#4ade80" : apiStatus === false ? "#fed931" : "rgba(255,248,247,0.5)", fontWeight: 700 }}>
            {apiStatus === null ? "..." : apiStatus ? "ONLINE" : "CACHED"}
          </span>
        </div>
        <div className="status-separator" />
        <div className="status-badge">
          <span style={{ color: "#4ade80", fontWeight: 700 }}>● CONNECTED</span>
        </div>
      </div>
    </motion.div>
  );
}
