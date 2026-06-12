"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal as TermIcon, Server, Cpu, Monitor, Zap, Shield } from "lucide-react";
import StatusBar from "./components/StatusBar";
import ProfileCard from "./components/ProfileCard";
import ServerMonitor from "./components/ServerMonitor";
import Console from "./components/Console";
import ProjectsList from "./components/ProjectsList";
import Contributions from "./components/Contributions";
import ActivityLog from "./components/ActivityLog";

const GITHUB_USER = "AmadReally";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [mobileTab, setMobileTab] = useState("profile");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(basePath + "/api/github.json?v=" + Date.now())
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
        if (d.events) setEvents(d.events);

        fetch(`https://api.github.com/users/${GITHUB_USER}/events`)
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Events API failed");
          })
          .then((eventsList) => {
            if (!Array.isArray(eventsList)) return;
            setEvents(eventsList);

            const eventReposMap = {};
            eventsList.forEach((ev) => {
              if (!ev.repo?.name) return;
              const repoName = ev.repo.name;
              const evTime = new Date(ev.created_at).getTime();
              if (!eventReposMap[repoName] || evTime > eventReposMap[repoName].time) {
                eventReposMap[repoName] = { time: evTime, createdAt: ev.created_at, event: ev };
              }
            });

            setData((currentData) => {
              if (!currentData) return currentData;
              const updatedRepos = [...(currentData.repos || [])];

              Object.keys(eventReposMap).forEach((repoName) => {
                const evInfo = eventReposMap[repoName];
                const existingIndex = updatedRepos.findIndex(
                  (r) =>
                    r.name.toLowerCase() === repoName.toLowerCase() ||
                    r.name.toLowerCase() === repoName.split("/")[1]?.toLowerCase()
                );

                let commitMsg = null;
                let commitSha = null;
                if (evInfo.event.type === "PushEvent") {
                  const commits = evInfo.event.payload?.commits;
                  if (commits?.length > 0) {
                    commitMsg = commits[0].message;
                    commitSha = commits[0].sha ? commits[0].sha.substring(0, 7) : null;
                  }
                }

                if (existingIndex !== -1) {
                  const existingRepo = updatedRepos[existingIndex];
                  const existingTime = new Date(existingRepo.pushed_at || existingRepo.updated_at).getTime();
                  if (evInfo.time > existingTime) {
                    updatedRepos[existingIndex] = {
                      ...existingRepo,
                      pushed_at: evInfo.createdAt,
                      updated_at: evInfo.createdAt,
                      latest_commit_message: commitMsg || existingRepo.latest_commit_message,
                      latest_commit_sha: commitSha || existingRepo.latest_commit_sha,
                    };
                  }
                } else {
                  const isOrg = repoName.includes("/");
                  updatedRepos.push({
                    name: repoName,
                    description: isOrg ? "Contribution to organization repository" : "Public repository",
                    html_url: `https://github.com/${repoName}`,
                    language: "JavaScript",
                    stargazers_count: 0, forks_count: 0, watchers_count: 0,
                    created_at: null,
                    updated_at: evInfo.createdAt,
                    pushed_at: evInfo.createdAt,
                    latest_commit_message: commitMsg || "Pushed commits",
                    latest_commit_sha: commitSha || "0000000",
                  });
                }
              });

              return {
                ...currentData,
                repos: updatedRepos,
                stats: { ...currentData.stats, repos: updatedRepos.length },
              };
            });
          })
          .catch((e) => console.warn("Live events unavailable:", e.message));
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="noise-overlay" />
      <div className="dashboard-viewport">
        <StatusBar />

        <div className="dashboard-grid">
          {/* ═══ LEFT PANEL ═══ */}
          <div className={`left-panel mobile-tab-panel ${mobileTab === "profile" ? "mobile-tab-active" : ""}`}>
            <ProfileCard profile={data?.profile} />

            <motion.div
              className="info-widget glass-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="widget-header">
                <span className="header-dot" />
                SYS_INFO
              </div>
              <div className="info-row">
                <span className="info-label"><TermIcon size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />Shell</span>
                <span className="info-value text-cyan">zsh</span>
              </div>
              <div className="info-row">
                <span className="info-label"><Monitor size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />Theme</span>
                <span className="info-value text-accent">Cherry Dark</span>
              </div>
              <div className="info-row">
                <span className="info-label"><Zap size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />Status</span>
                <span className="info-value text-green">● ACTIVE</span>
              </div>
              <div className="info-row">
                <span className="info-label"><Server size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />Mode</span>
                <span className="info-value text-yellow">Solo Core</span>
              </div>
              <div className="info-row">
                <span className="info-label"><Cpu size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />Engine</span>
                <span className="info-value text-violet">Next.js 16</span>
              </div>
              <div className="info-row">
                <span className="info-label"><Shield size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />Uptime</span>
                <span className="info-value text-green">99.9%</span>
              </div>
            </motion.div>

            <Contributions
              repos={data?.repos}
              contributions={data?.contributions}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />

            <div className="desktop-activity">
              <ActivityLog
                repos={data?.repos}
                contributions={data?.contributions}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                events={events}
              />
            </div>
          </div>

          {/* ═══ CENTER PANEL ═══ */}
          <div className={`center-panel mobile-tab-panel ${mobileTab === "terminal" ? "mobile-tab-active" : ""}`}>
            <Console />
            <ServerMonitor />
          </div>

          {/* ═══ RIGHT PANEL ═══ */}
          <div className={`right-panel mobile-tab-panel ${mobileTab === "projects" ? "mobile-tab-active" : ""}`}>
            <ProjectsList repos={data?.repos} loading={loading} />
          </div>
        </div>

        {/* Activity overlay — mobile only */}
        <div className={`activity-tab-panel ${mobileTab === "activity" ? "mobile-tab-active" : ""}`}>
          <ActivityLog
            repos={data?.repos}
            contributions={data?.contributions}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
          />
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav className="mobile-tab-bar" aria-label="Mobile navigation">
          <button className={`mobile-tab-btn ${mobileTab === "profile" ? "active" : ""}`} onClick={() => setMobileTab("profile")} aria-label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
            <span>Profile</span>
          </button>
          <button className={`mobile-tab-btn ${mobileTab === "terminal" ? "active" : ""}`} onClick={() => setMobileTab("terminal")} aria-label="Terminal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
            <span>Terminal</span>
          </button>
          <button className={`mobile-tab-btn ${mobileTab === "projects" ? "active" : ""}`} onClick={() => setMobileTab("projects")} aria-label="Projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>
            <span>Projects</span>
          </button>
          <button className={`mobile-tab-btn ${mobileTab === "activity" ? "active" : ""}`} onClick={() => setMobileTab("activity")} aria-label="Activity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            <span>Activity</span>
          </button>
        </nav>

        <span className="micro-footer">
          © 2026 AMADREALLY — POWERED BY MEMORYOFPLANET
        </span>
      </div>
    </>
  );
}
