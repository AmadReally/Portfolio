"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ExternalLink } from "lucide-react";

const LASTFM_USER = process.env.NEXT_PUBLIC_LASTFM_USER || "";
const LASTFM_KEY  = process.env.NEXT_PUBLIC_LASTFM_KEY  || "";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const secs = Math.floor((Date.now() - new Date(dateStr * 1000).getTime()) / 1000);
  if (secs < 60)   return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function NowPlaying() {
  const [track, setTrack]       = useState(null);
  const [playing, setPlaying]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [imgError, setImgError] = useState(false);

  const configured = LASTFM_USER && LASTFM_KEY;

  useEffect(() => {
    if (!configured) { setLoading(false); return; }

    const poll = () => {
      fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
        `&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=1`
      )
        .then((r) => r.json())
        .then((d) => {
          const t = d?.recenttracks?.track?.[0];
          if (!t) return;
          const isNow = t["@attr"]?.nowplaying === "true";
          setPlaying(isNow);
          setImgError(false);
          setTrack({
            name:      t.name,
            artist:    t.artist?.["#text"] || "",
            album:     t.album?.["#text"]  || "",
            image:     t.image?.find((i) => i.size === "large")?.["#text"] || "",
            url:       t.url || "",
            timestamp: t.date?.uts || null,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [configured]);

  /* progress bar fake-animate only while playing */
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) { setProgress(0); return; }
    setProgress(Math.random() * 60 + 10);
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 2;
        return next >= 100 ? 10 : next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [playing, track?.name]);

  return (
    <motion.div
      className="glass-card nowplaying-widget"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="widget-header" style={{ marginBottom: 10 }}>
        <span className="header-dot" style={{ background: playing ? "var(--highlight-green)" : "var(--text-light-muted)", boxShadow: playing ? "0 0 6px var(--highlight-green)" : "none", transition: "all 0.3s" }} />
        {playing ? "NOW_PLAYING" : "LAST_PLAYED"}
      </div>

      {!configured ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 0", opacity: 0.45 }}>
          <Music size={22} style={{ color: "var(--terminal-green)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", textAlign: "center", color: "var(--text-light-secondary)", lineHeight: 1.5 }}>
            Set NEXT_PUBLIC_LASTFM_USER<br />+ NEXT_PUBLIC_LASTFM_KEY
          </span>
        </div>
      ) : loading ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 6, background: "rgba(255,248,247,0.06)", animation: "shimmer 1.5s infinite" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            <div className="skeleton-line w-75" style={{ height: 7 }} />
            <div className="skeleton-line w-50" style={{ height: 6 }} />
          </div>
        </div>
      ) : !track ? (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-light-secondary)", opacity: 0.5 }}>
          Nothing scrobbled yet.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={track.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
          >
            {/* Album art */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {track.image && !imgError ? (
                <img
                  src={track.image}
                  alt={track.album}
                  width={42} height={42}
                  onError={() => setImgError(true)}
                  style={{ borderRadius: 6, border: "1px solid rgba(255,248,247,0.12)", display: "block", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: 6, background: "rgba(167,201,87,0.1)", border: "1px solid rgba(167,201,87,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Music size={18} style={{ color: "var(--terminal-green)", opacity: 0.6 }} />
                </div>
              )}
              {playing && (
                <div style={{ position: "absolute", bottom: -3, right: -3, width: 10, height: 10, borderRadius: "50%", background: "var(--highlight-green)", border: "1.5px solid #1d302c", boxShadow: "0 0 6px var(--highlight-green)", animation: "pingRipple 2s infinite" }} />
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <a href={track.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                <span style={{ fontWeight: 700, fontSize: "0.75rem", color: "var(--text-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {track.name}
                </span>
                <ExternalLink size={9} style={{ color: "var(--terminal-green)", opacity: 0.5, flexShrink: 0 }} />
              </a>
              <span style={{ fontSize: "0.62rem", color: "var(--text-light-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
                {track.artist}
              </span>
              {!playing && track.timestamp && (
                <span style={{ fontSize: "0.52rem", color: "var(--text-light-muted)", fontFamily: "var(--font-mono)" }}>
                  {timeAgo(track.timestamp)}
                </span>
              )}
              {playing && (
                <div style={{ marginTop: 4, height: 3, background: "rgba(255,248,247,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", background: "linear-gradient(90deg, var(--terminal-green), var(--accent-cyan))", borderRadius: 4 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
