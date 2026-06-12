"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Mail } from "lucide-react";

const GithubIcon = ({ size = 13 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const GITHUB_USER = "AmadReally";
const EMAIL = "naimjamalullail@gmail.com";

export default function ProfileCard({ profile }) {
  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      className="profile-card glass-card"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="card-glow" />

      <div className="avatar-wrap">
        <motion.div
          className="avatar-ring"
          style={{
            background: "conic-gradient(var(--terminal-green), var(--accent-cyan), var(--accent-cherry), var(--terminal-green))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <img
          src={profile?.avatar_url || `https://github.com/${GITHUB_USER}.png`}
          alt={profile?.name || "Naim Jamalullail"}
          className="avatar-img"
          width={72}
          height={72}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "0 auto 4px" }}>
        <h1 className="profile-name" style={{ marginBottom: 0 }}>
          {profile?.name || "Naim Jamalullail"}
        </h1>
        <ShieldCheck size={14} className="text-green" title="Verified Creator" />
      </div>

      <motion.span
        className="profile-role"
        style={{
          color: "var(--terminal-green)",
          borderColor: "rgba(167, 201, 87, 0.4)",
          backgroundColor: "rgba(167, 201, 87, 0.12)",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        FULL-STACK CREATOR
      </motion.span>

      <p className="profile-bio" style={{ marginBottom: 10 }}>
        <MapPin size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />
        {profile?.location || "Malaysia"}
      </p>

      {profile && (
        <div className="profile-stats-grid">
          <div className="profile-stat-tile">
            <span className="profile-stat-label">Repos</span>
            <span className="profile-stat-val">{profile.public_repos ?? "—"}</span>
          </div>
          <div className="profile-stat-tile">
            <span className="profile-stat-label">Stars</span>
            <span className="profile-stat-val">{profile.total_stars ?? "—"}</span>
          </div>
          <div className="profile-stat-tile">
            <span className="profile-stat-label">Followers</span>
            <span className="profile-stat-val">{profile.followers ?? "—"}</span>
          </div>
        </div>
      )}

      <div className="social-row" style={{ padding: 0, marginTop: 10, display: "flex", gap: 6 }}>
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn"
          title="GitHub"
          style={{ padding: "6px 8px" }}
        >
          <GithubIcon size={13} />
        </a>
        <div style={{ position: "relative", flex: 1, display: "flex" }}>
          <a
            href={`mailto:${EMAIL}`}
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(EMAIL);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="social-btn"
            title={`Email: ${EMAIL}`}
            style={{ padding: "6px 8px", width: "100%" }}
          >
            <Mail size={13} />
          </a>
          {copied && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
              background: "rgba(29,48,44,0.98)", border: "1px solid var(--border-default)",
              color: "var(--terminal-green)", fontSize: "0.55rem", fontFamily: "var(--font-mono)",
              padding: "4px 8px", borderRadius: "4px", whiteSpace: "nowrap", zIndex: 100,
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}>
              Email copied!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
