const fs = require("fs");
const path = require("path");
const https = require("https");

const GITHUB_USER = "AmadReally";
const TOKEN = process.env.GITHUB_TOKEN || "";
const OUT_DIR = path.join(__dirname, "../public/api");
const OUT_FILE = path.join(OUT_DIR, "github.json");

const HEADERS = {
  "User-Agent": "portfolio-fetcher/1.0",
  Accept: "application/vnd.github.v3+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function getHTML(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "portfolio-fetcher/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function fetchContributions() {
  try {
    const html = await getHTML(`https://github.com/users/${GITHUB_USER}/contributions`);
    const map = {};
    const re = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      map[m[1]] = parseInt(m[2], 10);
    }
    return map;
  } catch {
    return {};
  }
}

async function fetchCommits(repoFullName) {
  try {
    const commits = await get(`https://api.github.com/repos/${repoFullName}/commits?per_page=1`);
    if (!Array.isArray(commits) || !commits[0]) return { message: null, sha: null };
    const c = commits[0];
    return {
      message: c.commit?.message?.split("\n")[0] || null,
      sha: c.sha?.substring(0, 7) || null,
    };
  } catch {
    return { message: null, sha: null };
  }
}

async function main() {
  console.log(`[fetch-github] Fetching data for ${GITHUB_USER}...`);

  // Profile
  let profile = {};
  try {
    const raw = await get(`https://api.github.com/users/${GITHUB_USER}`);
    if (raw && raw.login) {
      profile = {
        login: raw.login,
        name: raw.name || GITHUB_USER,
        avatar_url: raw.avatar_url,
        bio: raw.bio,
        location: raw.location || "Malaysia",
        email: raw.email,
        public_repos: raw.public_repos,
        followers: raw.followers,
        following: raw.following,
        created_at: raw.created_at,
        html_url: raw.html_url,
      };
    }
  } catch (e) {
    console.warn("[fetch-github] Profile fetch failed:", e.message);
  }

  // Repos
  let repos = [];
  try {
    const raw = await get(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
    if (Array.isArray(raw)) {
      const topRepos = raw.slice(0, 12);
      repos = await Promise.all(
        topRepos.map(async (r) => {
          const commit = await fetchCommits(r.full_name);
          return {
            name: r.name,
            description: r.description,
            html_url: r.html_url,
            language: r.language,
            stargazers_count: r.stargazers_count,
            forks_count: r.forks_count,
            watchers_count: r.watchers_count,
            created_at: r.created_at,
            updated_at: r.updated_at,
            pushed_at: r.pushed_at,
            latest_commit_message: commit.message,
            latest_commit_sha: commit.sha,
          };
        })
      );
    }
  } catch (e) {
    console.warn("[fetch-github] Repos fetch failed:", e.message);
  }

  // Stats
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const stats = {
    repos: repos.length,
    stars: totalStars,
    followers: profile.followers || 0,
  };
  profile.total_stars = totalStars;

  // Events
  let events = [];
  try {
    const raw = await get(`https://api.github.com/users/${GITHUB_USER}/events?per_page=30`);
    if (Array.isArray(raw)) events = raw;
  } catch (e) {
    console.warn("[fetch-github] Events fetch failed:", e.message);
  }

  // Contributions
  const contributions = await fetchContributions();
  console.log(`[fetch-github] Got ${Object.keys(contributions).length} contribution days`);

  const output = {
    profile,
    repos,
    stats,
    events,
    contributions,
    fetched_at: new Date().toISOString(),
  };

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`[fetch-github] Wrote ${OUT_FILE}`);
}

main().catch((e) => {
  console.error("[fetch-github] Fatal:", e.message);
  // Write fallback so build doesn't break
  const fallback = {
    profile: { name: "Naim Jamalullail", login: GITHUB_USER, avatar_url: `https://github.com/${GITHUB_USER}.png`, location: "Malaysia", public_repos: 0, followers: 0, following: 0, total_stars: 0 },
    repos: [],
    stats: { repos: 0, stars: 0, followers: 0 },
    events: [],
    contributions: {},
    fetched_at: new Date().toISOString(),
  };
  const dir = path.join(__dirname, "../public/api");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "github.json"), JSON.stringify(fallback, null, 2));
});
