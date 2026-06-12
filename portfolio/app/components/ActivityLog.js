"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GitCommit, BookMarked, ArrowUpRight } from "lucide-react";

const LANG_COLORS = {
  JavaScript: "#f7df1e", TypeScript: "#3178c6",
  Python: "#3572a5", HTML: "#e34c26", CSS: "#563d7c",
};

function formatMonthYear(year, month) {
  return new Date(year, month).toLocaleDateString("en-MY", { month: "long", year: "numeric" });
}

function getLangColor(lang) {
  return LANG_COLORS[lang] || "#a7c957";
}

export default function ActivityLog({ repos, contributions, selectedDate, setSelectedDate, events }) {
  const selectedYear = selectedDate?.getFullYear() ?? new Date().getFullYear();

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: cur - 2023 }, (_, i) => cur - i);
  }, []);

  const monthlyActivity = useMemo(() => {
    if (!repos) return [];
    const byMonth = {};

    // From events
    if (events && events.length > 0) {
      events.forEach((ev) => {
        const d = new Date(ev.created_at);
        if (d.getFullYear() !== selectedYear) return;
        const key = d.getMonth();

        if (!byMonth[key]) byMonth[key] = { commits: {}, created: [] };

        if (ev.type === "PushEvent") {
          const repoName = ev.repo?.name?.split("/")[1] || ev.repo?.name || "unknown";
          const repoUrl = `https://github.com/${ev.repo?.name}`;
          if (!byMonth[key].commits[repoName]) {
            byMonth[key].commits[repoName] = { count: 0, url: repoUrl, messages: [] };
          }
          const commits = ev.payload?.commits || [];
          byMonth[key].commits[repoName].count += commits.length || 1;
          commits.slice(0, 2).forEach((c) => {
            if (c.message && byMonth[key].commits[repoName].messages.length < 3) {
              byMonth[key].commits[repoName].messages.push({ msg: c.message.split("\n")[0], sha: c.sha?.substring(0, 7) || "0000000" });
            }
          });
        }

        if (ev.type === "CreateEvent" && ev.payload?.ref_type === "repository") {
          const repoName = ev.repo?.name?.split("/")[1] || ev.repo?.name;
          byMonth[key].created.push({ name: repoName, url: `https://github.com/${ev.repo?.name}`, date: ev.created_at });
        }
      });
    } else {
      // Fallback: use repo metadata
      repos.forEach((repo) => {
        const pushed = repo.pushed_at || repo.updated_at;
        if (!pushed) return;
        const d = new Date(pushed);
        if (d.getFullYear() !== selectedYear) return;
        const key = d.getMonth();
        if (!byMonth[key]) byMonth[key] = { commits: {}, created: [] };
        const name = repo.name.includes("/") ? repo.name.split("/")[1] : repo.name;
        if (!byMonth[key].commits[name]) {
          byMonth[key].commits[name] = { count: 0, url: repo.html_url || `https://github.com/${repo.name}`, messages: [] };
        }
        byMonth[key].commits[name].count += 3;
        if (repo.latest_commit_message) {
          byMonth[key].commits[name].messages.push({ msg: repo.latest_commit_message.split("\n")[0], sha: repo.latest_commit_sha || "0000000" });
        }
        if (repo.created_at) {
          const cd = new Date(repo.created_at);
          if (cd.getFullYear() === selectedYear && cd.getMonth() === key) {
            byMonth[key].created.push({ name, url: repo.html_url, date: repo.created_at });
          }
        }
      });
    }

    return Object.entries(byMonth)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([monthIdx, data]) => {
        const commitEntries = Object.entries(data.commits);
        const totalCommits = commitEntries.reduce((s, [, v]) => s + v.count, 0);
        const maxCount = Math.max(...commitEntries.map(([, v]) => v.count), 1);
        return {
          monthIdx: Number(monthIdx),
          totalCommits,
          commitEntries: commitEntries.sort(([, a], [, b]) => b.count - a.count),
          maxCount,
          created: data.created,
        };
      })
      .filter((m) => m.totalCommits > 0 || m.created.length > 0);
  }, [repos, events, selectedYear]);

  return (
    <motion.div
      className="activity-widget glass-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="widget-header" style={{ marginBottom: 10 }}>
        <span className="header-dot" />
        ACTIVITY
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedDate(new Date(y, selectedDate?.getMonth() ?? 0, 1))}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.52rem", fontWeight: 700,
                padding: "1px 6px", borderRadius: 4, cursor: "pointer",
                background: y === selectedYear ? "rgba(167,201,87,0.2)" : "rgba(255,248,247,0.04)",
                border: `1px solid ${y === selectedYear ? "rgba(167,201,87,0.4)" : "rgba(255,248,247,0.1)"}`,
                color: y === selectedYear ? "var(--terminal-green)" : "var(--text-light-secondary)",
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {monthlyActivity.length === 0 ? (
        <div className="activity-empty">
          Tiada aktiviti dicatatkan untuk tahun {selectedYear}
        </div>
      ) : (
        <div className="activity-timeline-container">
          <div className="activity-scroll">
            {monthlyActivity.map((monthData) => (
              <div key={monthData.monthIdx} style={{ marginBottom: 16 }}>
                <div className="activity-month-header">
                  <div className="month-bullet" />
                  <span>{formatMonthYear(selectedYear, monthData.monthIdx)}</span>
                  <div className="month-line" />
                  <span style={{ fontSize: "0.52rem", opacity: 0.6, flexShrink: 0 }}>
                    {monthData.totalCommits} commits
                  </span>
                </div>

                <div className="activity-timeline-track">
                  {monthData.commitEntries.length > 0 && (
                    <div className="activity-item">
                      <div className="activity-node">
                        <div className="node-icon-bg">
                          <GitCommit size={8} style={{ color: "var(--terminal-green)" }} />
                        </div>
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          {monthData.totalCommits} commit{monthData.totalCommits !== 1 ? "s" : ""} across {monthData.commitEntries.length} repo{monthData.commitEntries.length !== 1 ? "s" : ""}
                        </div>
                        <div className="activity-repos-list">
                          {monthData.commitEntries.slice(0, 4).map(([name, info]) => (
                            <div key={name} className="activity-repo-row">
                              <div className="activity-repo-link-wrap">
                                <a href={info.url} target="_blank" rel="noopener noreferrer" className="activity-repo-link">
                                  {name}
                                  <ArrowUpRight size={10} className="arrow-icon" />
                                </a>
                                <span className="activity-repo-commits-count">{info.count} commit{info.count !== 1 ? "s" : ""}</span>
                              </div>
                              <div className="activity-progress-track">
                                <div className="activity-progress-fill" style={{ width: `${(info.count / monthData.maxCount) * 100}%` }} />
                              </div>
                              {info.messages.slice(0, 2).map((m, j) => (
                                <div key={j} className="activity-commit-detail">
                                  <span className="activity-commit-sha">{m.sha}</span>
                                  <span className="activity-commit-msg">{m.msg}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {monthData.created.length > 0 && (
                    <div className="activity-item">
                      <div className="activity-node">
                        <div className="node-icon-bg">
                          <BookMarked size={8} style={{ color: "var(--accent-amber)" }} />
                        </div>
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">Created {monthData.created.length} new repo{monthData.created.length !== 1 ? "s" : ""}</div>
                        <div className="activity-created-list">
                          {monthData.created.map((r, j) => (
                            <div key={j} className="activity-created-row">
                              <div className="activity-created-meta">
                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="activity-repo-link">
                                  {r.name}
                                  <ArrowUpRight size={10} className="arrow-icon" />
                                </a>
                                {r.date && (
                                  <span className="activity-created-date">
                                    {new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
