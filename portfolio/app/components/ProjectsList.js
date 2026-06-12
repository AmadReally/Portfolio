"use client";

import { motion } from "framer-motion";
import { Star, GitFork, Eye, ArrowUpRight, Code2 } from "lucide-react";

const LANG_DOT = {
  JavaScript: "lang-js", TypeScript: "lang-ts",
  Python: "lang-py", HTML: "lang-html", CSS: "lang-css",
};

function formatDate(str) {
  if (!str) return null;
  return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line w-75" />
      <div className="skeleton-line w-full" />
      <div className="skeleton-line w-50" />
    </div>
  );
}

export default function ProjectsList({ repos, loading }) {
  const sorted = repos
    ? [...repos].sort((a, b) => {
        const ta = new Date(a.pushed_at || a.updated_at || 0).getTime();
        const tb = new Date(b.pushed_at || b.updated_at || 0).getTime();
        return tb - ta;
      })
    : [];

  return (
    <motion.div
      className="glass-card projects-inner"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <div className="projects-header">
        <span>REPOSITORIES</span>
        {!loading && sorted.length > 0 && (
          <span className="projects-count">{sorted.length}</span>
        )}
      </div>

      <div className="projects-list console-scroll">
        {loading ? (
          [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
        ) : sorted.length === 0 ? (
          <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--text-light-secondary)", fontSize: "0.65rem", opacity: 0.6 }}>
            Tiada repositori ditemui
          </div>
        ) : (
          sorted.map((repo, i) => {
            const name = repo.name.includes("/") ? repo.name.split("/")[1] : repo.name;
            const langClass = LANG_DOT[repo.language] || "lang-default";
            const updatedDate = formatDate(repo.pushed_at || repo.updated_at);

            return (
              <motion.a
                key={repo.name}
                href={repo.html_url || `https://github.com/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="project-name">
                  <span className="project-title-text">
                    <Code2 size={12} className="project-icon" />
                    {name}
                  </span>
                  <ArrowUpRight size={12} className="arrow-icon" />
                </div>

                {repo.description ? (
                  <div className="project-desc">{repo.description}</div>
                ) : (
                  <div className="project-desc no-desc">No description provided.</div>
                )}

                {(repo.latest_commit_message || repo.latest_commit_sha) && (
                  <div className="project-commit">
                    <span className="commit-prefix">git</span>
                    <span className="commit-text">{repo.latest_commit_message || "commit"}</span>
                    {repo.latest_commit_sha && (
                      <span className="commit-sha">{repo.latest_commit_sha}</span>
                    )}
                  </div>
                )}

                {updatedDate && (
                  <div className="project-date-box">
                    <span className="date-prefix">updated</span>
                    <span className="date-text">{updatedDate}</span>
                  </div>
                )}

                <div className="project-meta">
                  <div className="meta-left">
                    {repo.language && (
                      <span className="lang-indicator">
                        <span className={`lang-dot ${langClass}`} />
                        <span className="lang-text">{repo.language}</span>
                      </span>
                    )}
                    <span className="meta-stat">
                      <Star size={10} className="stat-icon star-icon" />
                      <span className="stat-value">{repo.stargazers_count ?? 0}</span>
                    </span>
                    <span className="meta-stat">
                      <GitFork size={10} className="stat-icon fork-icon" />
                      <span className="stat-value">{repo.forks_count ?? 0}</span>
                    </span>
                    <span className="meta-stat">
                      <Eye size={10} className="stat-icon watch-icon" />
                      <span className="stat-value">{repo.watchers_count ?? 0}</span>
                    </span>
                  </div>
                </div>
              </motion.a>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
