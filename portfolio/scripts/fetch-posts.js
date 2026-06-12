const fs   = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "../posts");
const OUT_FILE  = path.join(__dirname, "../public/api/posts.json");

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: {}, content: raw.trim() };
  const fm = {};
  m[1].split(/\r?\n/).forEach((line) => {
    const colon = line.indexOf(":");
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, "");
    if (key) fm[key] = val;
  });
  return { fm, content: m[2].trim() };
}

function buildExcerpt(content) {
  return content
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/#+\s+/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n/g, " ")
    .trim()
    .slice(0, 120)
    .trim() + "...";
}

fs.mkdirSync(POSTS_DIR,            { recursive: true });
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

const files = fs.existsSync(POSTS_DIR)
  ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
  : [];

if (!files.length) {
  fs.writeFileSync(OUT_FILE, "[]");
  console.log("fetch-posts: no posts found, wrote empty array.");
  process.exit(0);
}

const posts = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { fm, content } = parseFrontmatter(raw);
    const slug = path.basename(file, ".md");
    return {
      slug,
      title:   fm.title   || slug,
      date:    fm.date    || "2026-01-01",
      tags:    fm.tags    ? fm.tags.split(",").map((t) => t.trim()) : [],
      excerpt: buildExcerpt(content),
      content,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

fs.writeFileSync(OUT_FILE, JSON.stringify(posts, null, 2));
console.log(`fetch-posts: wrote ${posts.length} post(s) → ${OUT_FILE}`);
