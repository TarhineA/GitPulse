import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ACCENT = "#00e5cc";
const ACCENT2 = "#00ff88";
const BG = "#0a0a0a";
const SURFACE = "#111111";
const BORDER = "#1e1e1e";
const MUTED = "#444444";
const TEXT = "#e8e8e8";
const SUBTEXT = "#666666";

const LANG_COLORS = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  Go: "#00add8",
  Rust: "#ce422b",
  Ruby: "#cc342d",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#fa7343",
  Kotlin: "#a97bff",
  PHP: "#777bb4",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Dart: "#00b4ab",
  Scala: "#c22d40",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Vue: "#41b883",
  Other: "#444444",
};

const CHART_COLORS = [ACCENT, ACCENT2, "#ff6b6b", "#ffd93d", "#c77dff", "#ff9a3c"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n?.toString() ?? "0");
const ago = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const joinYear = (dateStr) => new Date(dateStr).getFullYear();

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const Skeleton = ({ w = "100%", h = "1rem", r = "2px", className = "" }) => (
  <div
    className={className}
    style={{
      width: w, height: h, borderRadius: r,
      background: `linear-gradient(90deg, ${BORDER} 25%, #1a1a1a 50%, ${BORDER} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }}
  />
);

// ─── FADE-IN WRAPPER ──────────────────────────────────────────────────────────
const FadeIn = ({ delay = 0, children, style = {} }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      ...style,
    }}>
      {children}
    </div>
  );
};

// ─── LABEL ───────────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <span style={{
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.6rem", letterSpacing: "0.15em",
    color: SUBTEXT, textTransform: "uppercase",
  }}>{children}</span>
);

// ─── STAT BOX ────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, accent = false }) => (
  <div style={{
    flex: 1, padding: "1.25rem 1.5rem",
    background: SURFACE, border: `1px solid ${BORDER}`,
    display: "flex", flexDirection: "column", gap: "0.4rem",
    position: "relative", overflow: "hidden",
  }}>
    {accent && (
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, ${ACCENT}, transparent)`,
      }} />
    )}
    <Label>{label}</Label>
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: "2rem", fontWeight: 700, color: accent ? ACCENT : TEXT,
      lineHeight: 1,
    }}>{value}</span>
  </div>
);

// ─── LANG BADGE ──────────────────────────────────────────────────────────────
const LangBadge = ({ lang }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "0.3rem",
    padding: "0.15rem 0.5rem",
    background: "#161616", border: `1px solid ${BORDER}`,
    borderRadius: "2px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.65rem", color: SUBTEXT,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%",
      background: LANG_COLORS[lang] || LANG_COLORS.Other,
      flexShrink: 0,
    }} />
    {lang}
  </span>
);

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div style={{
      background: "#161616", border: `1px solid ${BORDER}`,
      padding: "0.5rem 0.75rem",
      fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem",
    }}>
      <span style={{ color: ACCENT }}>{name}</span>
      <span style={{ color: SUBTEXT }}> · </span>
      <span style={{ color: TEXT }}>{value} repos</span>
    </div>
  );
};

// ─── SKELETON DASHBOARD ───────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
    {/* Profile */}
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      padding: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-start",
    }}>
      <Skeleton w="72px" h="72px" r="4px" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Skeleton w="180px" h="1.2rem" />
        <Skeleton w="120px" h="0.85rem" />
        <Skeleton w="280px" h="0.85rem" />
        <Skeleton w="200px" h="0.85rem" />
      </div>
    </div>
    {/* Stats */}
    <div style={{ display: "flex", gap: "1px" }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ flex:1, background: SURFACE, border:`1px solid ${BORDER}`, padding:"1.25rem" }}>
          <Skeleton w="60px" h="0.6rem" className="mb-2" />
          <div style={{ marginTop: "0.5rem" }}><Skeleton w="80px" h="1.8rem" /></div>
        </div>
      ))}
    </div>
    {/* Repos */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px" }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ background: SURFACE, border:`1px solid ${BORDER}`, padding:"1.25rem" }}>
          <Skeleton w="60%" h="0.9rem" />
          <div style={{ marginTop:"0.5rem" }}><Skeleton w="90%" h="0.75rem" /></div>
          <div style={{ marginTop:"0.5rem" }}><Skeleton w="50px" h="0.7rem" /></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── ERROR STATES ─────────────────────────────────────────────────────────────
const ErrorState = ({ type, username }) => {
  const states = {
    not_found: {
      code: "404",
      title: "User not found",
      msg: `No GitHub account matches "${username}". Check the spelling and try again.`,
      icon: "◉",
    },
    rate_limit: {
      code: "429",
      title: "Rate limit exceeded",
      msg: "GitHub API rate limit hit. Wait ~60 seconds before your next request.",
      icon: "⏱",
    },
    empty_repos: {
      code: "200",
      title: "No public repositories",
      msg: `${username} exists but has no public repos to display.`,
      icon: "□",
    },
    network: {
      code: "ERR",
      title: "Network failure",
      msg: "Could not reach the GitHub API. Check your connection and try again.",
      icon: "⚡",
    },
  };
  const s = states[type] || states.network;
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      padding: "3rem", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "3rem", color: BORDER, lineHeight: 1,
      }}>{s.icon}</div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.6rem", letterSpacing: "0.2em", color: SUBTEXT,
      }}>HTTP {s.code}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: TEXT }}>{s.title}</div>
      <div style={{ fontSize: "0.875rem", color: SUBTEXT, maxWidth: "380px", lineHeight: 1.6 }}>{s.msg}</div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function GitPulse() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { type }
  const [data, setData] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchData = async (username) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
      ]);

      if (userRes.status === 404) { setError({ type: "not_found" }); setLoading(false); return; }
      if (userRes.status === 403 || userRes.status === 429) { setError({ type: "rate_limit" }); setLoading(false); return; }
      if (!userRes.ok) { setError({ type: "network" }); setLoading(false); return; }

      const user = await userRes.json();
      const repos = await reposRes.json();

      if (!Array.isArray(repos) || repos.length === 0) {
        setData({ user, repos: [], langData: [], topRepos: [], totalStars: 0, totalForks: 0, recentRepo: null });
        setLoading(false);
        return;
      }

      // Stats
      const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
      const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);

      // Top repos by stars
      const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);

      // Language distribution
      const langMap = {};
      repos.forEach(r => {
        if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
      });
      const langData = Object.entries(langMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));

      // Most recent
      const recentRepo = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

      setData({ user, repos, topRepos, langData, totalStars, totalForks, recentRepo });
    } catch (e) {
      setError({ type: "network" });
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const trimmed = input.trim().replace(/^@/, "");
    if (!trimmed) return;
    setQuery(trimmed);
    fetchData(trimmed);
  };

  const hasNoRepos = data && data.repos.length === 0;

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: TEXT,
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${BG}; }
        ::-webkit-scrollbar-thumb { background: ${MUTED}; }
        input::placeholder { color: ${MUTED}; }
        input:focus { outline: none; }
        .repo-card:hover { border-color: ${MUTED} !important; background: #161616 !important; }
        .repo-card { transition: border-color 0.15s, background 0.15s; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "52px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`,
            animation: "pulse 2s infinite",
          }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.05em", color: TEXT,
          }}>GITPULSE</span>
        </div>
        <Label>github public api · no auth</Label>
      </div>

      {/* ── SEARCH ── */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: "1.5rem 2rem",
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          color: ACCENT, fontSize: "0.875rem", flexShrink: 0,
        }}>$ lookup</span>
        <div style={{
          flex: 1, maxWidth: 420,
          display: "flex", alignItems: "stretch",
          border: `1px solid ${BORDER}`, background: SURFACE,
        }}>
          <span style={{
            padding: "0 0.75rem", display: "flex", alignItems: "center",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.875rem", color: SUBTEXT, borderRight: `1px solid ${BORDER}`,
            flexShrink: 0,
          }}>github.com/</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="username"
            style={{
              flex: 1, padding: "0.6rem 0.75rem",
              background: "transparent",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.875rem", color: TEXT, border: "none",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "0 1.25rem",
              background: loading ? BORDER : ACCENT,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.75rem", fontWeight: 700, color: "#000",
              letterSpacing: "0.1em", flexShrink: 0,
              transition: "background 0.15s",
            }}
          >{loading ? "···" : "RUN"}</button>
        </div>
        {query && !loading && (
          <Label>
            {data ? `${data.repos.length} repos indexed` : error ? "query failed" : ""}
          </Label>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "1.5rem 2rem", maxWidth: 1200, margin: "0 auto" }}>

        {/* Empty state */}
        {!loading && !error && !data && (
          <div style={{
            padding: "5rem", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "4rem", color: BORDER, lineHeight: 1,
            }}>▸</div>
            <div style={{ color: SUBTEXT, fontSize: "0.875rem" }}>
              Enter a GitHub username to analyze their profile
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Errors */}
        {!loading && error && <ErrorState type={error.type} username={query} />}

        {/* No repos */}
        {!loading && !error && hasNoRepos && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <ProfileCard user={data.user} delay={0} />
            <ErrorState type="empty_repos" username={query} />
          </div>
        )}

        {/* Full dashboard */}
        {!loading && !error && data && !hasNoRepos && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>

            {/* Profile */}
            <FadeIn delay={0}>
              <ProfileCard user={data.user} />
            </FadeIn>

            {/* Stats row */}
            <FadeIn delay={80}>
              <div style={{ display: "flex", gap: "1px" }}>
                <StatBox label="Public Repos" value={fmt(data.user.public_repos)} />
                <StatBox label="Total Stars" value={fmt(data.totalStars)} accent />
                <StatBox label="Total Forks" value={fmt(data.totalForks)} />
                <StatBox label="Followers" value={fmt(data.user.followers)} />
                <StatBox label="Following" value={fmt(data.user.following)} />
              </div>
            </FadeIn>

            {/* Main grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1px", marginTop: "1px" }}>

              {/* Left: Top Repos */}
              <FadeIn delay={160}>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
                  <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Label>Top Repos · by stars</Label>
                    <Label>{data.topRepos.length} shown</Label>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                    {data.topRepos.map((repo, i) => (
                      <FadeIn key={repo.id} delay={200 + i * 60}>
                        <a
                          href={repo.html_url} target="_blank" rel="noreferrer"
                          className="repo-card"
                          style={{
                            display: "block", padding: "1rem 1.25rem",
                            background: "#0e0e0e", border: `1px solid ${BORDER}`,
                            textDecoration: "none", cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                                <span style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: "0.7rem", color: SUBTEXT,
                                  flexShrink: 0,
                                }}>#{i + 1}</span>
                                <span style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: "0.875rem", fontWeight: 600, color: ACCENT,
                                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>{repo.name}</span>
                              </div>
                              {repo.description && (
                                <p style={{
                                  fontSize: "0.8rem", color: SUBTEXT, lineHeight: 1.5,
                                  overflow: "hidden", textOverflow: "ellipsis",
                                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                                }}>{repo.description}</p>
                              )}
                              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {repo.language && <LangBadge lang={repo.language} />}
                                {repo.topics?.slice(0, 3).map(t => (
                                  <span key={t} style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: "0.6rem", color: SUBTEXT,
                                    padding: "0.15rem 0.4rem",
                                    border: `1px solid ${BORDER}`, borderRadius: "2px",
                                  }}>{t}</span>
                                ))}
                              </div>
                            </div>
                            <div style={{ flexShrink: 0, textAlign: "right" }}>
                              <div style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: "1.1rem", fontWeight: 700, color: TEXT,
                                lineHeight: 1,
                              }}>
                                <span style={{ color: "#ffd700", fontSize: "0.65rem", marginRight: "0.2rem" }}>★</span>
                                {fmt(repo.stargazers_count)}
                              </div>
                              <div style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: "0.6rem", color: SUBTEXT, marginTop: "0.2rem",
                              }}>
                                ⑂ {fmt(repo.forks_count)}
                              </div>
                            </div>
                          </div>
                        </a>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Right: Donut + Activity */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <FadeIn delay={240}>
                  <div style={{
                    background: SURFACE, border: `1px solid ${BORDER}`,
                    padding: "1.5rem",
                  }}>
                    <div style={{ marginBottom: "1rem" }}><Label>Language Distribution</Label></div>
                    {data.langData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={data.langData}
                              cx="50%" cy="50%"
                              innerRadius={52} outerRadius={78}
                              paddingAngle={2}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {data.langData.map((entry, i) => (
                                <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
                          {data.langData.map((lang, i) => {
                            const total = data.langData.reduce((s, l) => s + l.value, 0);
                            const pct = Math.round((lang.value / total) * 100);
                            return (
                              <div key={lang.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{
                                  width: 8, height: 8, borderRadius: "1px", flexShrink: 0,
                                  background: CHART_COLORS[i % CHART_COLORS.length],
                                }} />
                                <span style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: "0.7rem", color: SUBTEXT, flex: 1,
                                }}>{lang.name}</span>
                                <span style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: "0.7rem", color: TEXT,
                                }}>{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: SUBTEXT, fontSize: "0.8rem", padding: "1rem 0" }}>
                        No language data available
                      </div>
                    )}
                  </div>
                </FadeIn>

                {/* Recent Activity */}
                {data.recentRepo && (
                  <FadeIn delay={320}>
                    <div style={{
                      background: SURFACE, border: `1px solid ${BORDER}`,
                      padding: "1.5rem", position: "relative", overflow: "hidden",
                    }}>
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
                        background: `linear-gradient(90deg, ${ACCENT2}, transparent)`,
                      }} />
                      <Label>Most Recent Activity</Label>
                      <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <a
                          href={data.recentRepo.html_url} target="_blank" rel="noreferrer"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "0.95rem", fontWeight: 600, color: ACCENT2,
                            textDecoration: "none",
                          }}
                        >{data.recentRepo.name}</a>
                        <div style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "0.7rem", color: SUBTEXT,
                        }}>
                          last push · <span style={{ color: TEXT }}>{ago(data.recentRepo.pushed_at || data.recentRepo.updated_at)}</span>
                        </div>
                        <div style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "0.7rem", color: SUBTEXT,
                        }}>
                          updated · <span style={{ color: TEXT }}>{ago(data.recentRepo.updated_at)}</span>
                        </div>
                        {data.recentRepo.language && (
                          <div style={{ marginTop: "0.25rem" }}>
                            <LangBadge lang={data.recentRepo.language} />
                          </div>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                )}
              </div>
            </div>

            {/* Footer */}
            <FadeIn delay={400}>
              <div style={{
                padding: "1rem 0", display: "flex", justifyContent: "space-between",
                borderTop: `1px solid ${BORDER}`, marginTop: "0.5rem",
              }}>
                <Label>gitpulse · github.com/{query}</Label>
                <Label>data fetched {new Date().toLocaleTimeString()}</Label>
              </div>
            </FadeIn>

          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
function ProfileCard({ user }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      padding: "1.75rem 2rem",
      display: "flex", gap: "1.5rem", alignItems: "flex-start",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 200, height: 200,
        background: `radial-gradient(circle at top right, ${ACCENT}08, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <img
        src={user.avatar_url}
        alt={user.login}
        style={{
          width: 72, height: 72, borderRadius: "4px",
          border: `2px solid ${BORDER}`, flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
          <h1 style={{
            fontSize: "1.25rem", fontWeight: 600, color: TEXT, lineHeight: 1,
          }}>{user.name || user.login}</h1>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.75rem", color: SUBTEXT,
          }}>@{user.login}</span>
        </div>
        {user.bio && (
          <p style={{
            marginTop: "0.4rem", fontSize: "0.875rem", color: SUBTEXT,
            lineHeight: 1.5, maxWidth: 520,
          }}>{user.bio}</p>
        )}
        <div style={{
          marginTop: "0.75rem", display: "flex", gap: "1.5rem", flexWrap: "wrap",
        }}>
          {user.location && (
            <span style={{ fontSize: "0.75rem", color: SUBTEXT }}>
              <span style={{ color: MUTED }}>◎ </span>{user.location}
            </span>
          )}
          {user.company && (
            <span style={{ fontSize: "0.75rem", color: SUBTEXT }}>
              <span style={{ color: MUTED }}>⬡ </span>{user.company}
            </span>
          )}
          {user.blog && (
            <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
              target="_blank" rel="noreferrer"
              style={{ fontSize: "0.75rem", color: ACCENT, textDecoration: "none" }}>
              ↗ {user.blog}
            </a>
          )}
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.7rem", color: SUBTEXT,
          }}>
            joined {joinYear(user.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
