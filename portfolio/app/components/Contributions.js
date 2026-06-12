"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLevel(count) {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export default function Contributions({ repos, contributions, selectedDate, setSelectedDate }) {
  const [tooltip, setTooltip] = useState(null);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const monthData = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const date = new Date(year, month, d);
      const isFuture = date > today;

      let count = 0;
      if (contributions && contributions[dateStr] !== undefined) {
        count = contributions[dateStr];
      } else if (!isFuture && repos) {
        repos.forEach((repo) => {
          const pushed = repo.pushed_at || repo.updated_at;
          if (pushed && pushed.startsWith(dateStr)) count += Math.floor(Math.random() * 3) + 1;
        });
      }

      cells.push({ day: d, date: dateStr, count: isFuture ? null : count, isFuture });
    }
    return cells;
  }, [year, month, repos, contributions]);

  const total = useMemo(
    () => monthData.reduce((s, c) => s + (c?.count ?? 0), 0),
    [monthData]
  );

  const monthLabel = new Date(year, month).toLocaleDateString("en-MY", { month: "long", year: "numeric" });

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setSelectedDate(d);
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    const d = new Date(year, month + 1, 1);
    setSelectedDate(d);
  };

  return (
    <motion.div
      className="contrib-widget glass-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="contrib-header-row">
        <div className="widget-header">
          <span className="header-dot" />
          CONTRIBUTIONS
        </div>
        <div className="month-switcher">
          <button className="month-btn" onClick={prevMonth}>‹</button>
          <span className="month-label">{monthLabel}</span>
          <button className="month-btn" onClick={nextMonth} disabled={isCurrentMonth}>›</button>
        </div>
      </div>

      <div className="contrib-container">
        <div className="contrib-grid-wrapper">
          <div className="contrib-weekday-headers">
            {DAYS.map((d) => <span key={d}>{d[0]}</span>)}
          </div>
          <div className="contrib-grid">
            {monthData.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} className="contrib-cell empty" />;
              const level = getLevel(cell.count);
              const col = i % 7;
              const align = col <= 1 ? "align-left" : col >= 5 ? "align-right" : "align-center";
              return (
                <div
                  key={cell.date}
                  className={`contrib-cell lvl-${level}${cell.isFuture ? "" : ""}`}
                  style={{ opacity: cell.isFuture ? 0.2 : 1 }}
                  onMouseEnter={() => setTooltip({ idx: i, count: cell.count, date: cell.date, align })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {tooltip?.idx === i && !cell.isFuture && (
                    <div className={`contrib-tooltip ${align}`}>
                      {cell.count ?? 0} commit{cell.count !== 1 ? "s" : ""} · {cell.date}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="contrib-footer">
          <span>{total} commit{total !== 1 ? "s" : ""} this month</span>
          <div className="contrib-legend">
            <span style={{ marginRight: 4, fontSize: "0.5rem" }}>Less</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <div key={l} className={`contrib-legend-cell lvl-${l}`} />
            ))}
            <span style={{ marginLeft: 4, fontSize: "0.5rem" }}>More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
