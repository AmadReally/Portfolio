"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function ServerMonitor() {
  const [cpu, setCpu] = useState(24.5);
  const [ram, setRam] = useState(4.12);
  const [disk] = useState(26.44);
  const [network, setNetwork] = useState({ rx: 45.21, tx: 12.83 });
  const [temp, setTemp] = useState(47);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((prev) => {
        const delta = (Math.random() * 10) - 5;
        return parseFloat(Math.max(12.0, Math.min(88.0, prev + delta)).toFixed(1));
      });
      setNetwork(() => ({
        rx: parseFloat((Math.random() * 50 + 15).toFixed(2)),
        tx: parseFloat((Math.random() * 20 + 5).toFixed(2)),
      }));
      setTemp((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(42, Math.min(62, prev + delta));
      });
      setRam((prev) => {
        const delta = (Math.random() * 0.04) - 0.02;
        return parseFloat(Math.max(3.9, Math.min(4.5, prev + delta)).toFixed(2));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="glass-card server-stats-card"
      initial={isMobile ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={isMobile ? { duration: 0 } : { duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="widget-header" style={{ padding: "0 0 6px 0", borderBottom: "1px solid var(--border-subtle)", marginBottom: 8, width: "100%" }}>
        <span className="header-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent-green)" }} />
        SERVER STATISTICS
      </div>

      <div className="server-stats-grid">
        <div className="stat-monitor-tile">
          <span className="stat-monitor-label">CPU LOAD</span>
          <span className="stat-monitor-val text-accent">{cpu}%</span>
          <span className="stat-monitor-sub">TEMP: {temp}°C</span>
        </div>
        <div className="stat-monitor-tile">
          <span className="stat-monitor-label">MEMORY</span>
          <span className="stat-monitor-val text-green">{ram} GiB</span>
          <span className="stat-monitor-sub">OF 8.00 GiB</span>
        </div>
        <div className="stat-monitor-tile">
          <span className="stat-monitor-label">DISK</span>
          <span className="stat-monitor-val text-cyan">{disk} GiB</span>
          <span className="stat-monitor-sub">OF 100 GiB</span>
        </div>
        <div className="stat-monitor-tile">
          <span className="stat-monitor-label">NETWORK</span>
          <span className="stat-monitor-val text-yellow" style={{ fontSize: "0.85rem" }}>↓ {network.rx} KB/s</span>
          <span className="stat-monitor-val text-yellow" style={{ fontSize: "0.85rem", opacity: 0.8 }}>↑ {network.tx} KB/s</span>
        </div>
      </div>
    </motion.div>
  );
}
