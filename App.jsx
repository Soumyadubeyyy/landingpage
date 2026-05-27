import { useState, useEffect, createContext, useContext } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace with your actual backend base URL
const API_BASE = "https://api.settle.pranaa.com";

// ─── API HELPERS ─────────────────────────────────────────────────────────────
const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || "Login failed");
    return res.json(); // expects { token, user: { name, email } }
  },
  getReports: async (token) => {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json(); // expects [{ id, name, created_at, status, pdf_url }]
  },
  downloadPDF: async (token, reportId) => {
    const res = await fetch(`${API_BASE}/reports/${reportId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to download PDF");
    return res.blob();
  },
};

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("settle_token"));

  useEffect(() => {
    const saved = localStorage.getItem("settle_user");
    if (saved && token) setUser(JSON.parse(saved));
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("settle_token", data.token);
    localStorage.setItem("settle_user", JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("settle_token");
    localStorage.removeItem("settle_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #141412;
    --ink-muted: #636358;
    --ink-faint: #9e9e94;
    --surface: #f8f8f5;
    --surface-alt: #f0f0eb;
    --surface-card: #ffffff;
    --border: rgba(20,20,18,0.09);
    --border-md: rgba(20,20,18,0.15);
    --accent: #1a6a4a;
    --accent-light: #e6f2ec;
    --accent-mid: #2d9e6f;
    --wa: #25d366;
    --danger: #c0392b;
    --radius: 10px;
    --radius-lg: 16px;
    --shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--surface); color: var(--ink); -webkit-font-smoothing: antialiased; }

  /* NAV */
  .nav {
    position: sticky; top: 0; z-index: 200;
    height: 58px; padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(248,248,245,0.92); backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: var(--ink); cursor: pointer; letter-spacing: -0.02em; }
  .nav-logo span { color: var(--accent); }
  .nav-right { display: flex; align-items: center; gap: 0.75rem; }
  .nav-links { display: flex; align-items: center; gap: 1.8rem; list-style: none; }
  .nav-links a { font-size: 0.875rem; color: var(--ink-muted); text-decoration: none; transition: color 0.15s; cursor: pointer; }
  .nav-links a:hover { color: var(--ink); }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 7px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500; padding: 0.55rem 1.2rem; border-radius: var(--radius); cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
  .btn-ghost { background: transparent; border: 1px solid var(--border-md); color: var(--ink-muted); }
  .btn-ghost:hover { background: var(--surface-alt); color: var(--ink); }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #155c3e; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-danger { background: transparent; border: 1px solid rgba(192,57,43,0.3); color: var(--danger); }
  .btn-danger:hover { background: rgba(192,57,43,0.06); }
  .btn-wa { background: var(--wa); color: #fff; }
  .btn-wa:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-full { width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.95rem; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  /* HERO */
  .hero { max-width: 820px; margin: 0 auto; padding: 6rem 2rem 4rem; text-align: center; }
  .hero-badge { display: inline-flex; align-items: center; gap: 7px; font-size: 0.75rem; font-weight: 500; color: var(--accent); background: var(--accent-light); border: 1px solid rgba(26,106,74,0.2); padding: 0.3rem 0.9rem; border-radius: 100px; margin-bottom: 2rem; letter-spacing: 0.02em; }
  .pulse { width: 6px; height: 6px; background: var(--wa); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  h1 { font-family: 'DM Serif Display', serif; font-size: clamp(2.6rem, 6vw, 4.2rem); line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 1.4rem; }
  h1 em { font-style: italic; color: var(--accent); }
  .hero-sub { font-size: 1.05rem; color: var(--ink-muted); max-width: 500px; margin: 0 auto 2.5rem; line-height: 1.75; font-weight: 300; }
  .hero-actions { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }

  /* CHAT MOCKUP */
  .chat-wrap { max-width: 540px; margin: 3.5rem auto 0; padding: 0 2rem; }
  .phone { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); }
  .phone-header { background: #075e54; padding: 0.8rem 1.1rem; display: flex; align-items: center; gap: 10px; }
  .phone-av { width: 34px; height: 34px; background: var(--wa); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 500; font-size: 0.75rem; color: #fff; }
  .phone-title { font-size: 0.9rem; font-weight: 500; color: #fff; }
  .phone-sub { font-size: 0.7rem; color: rgba(255,255,255,0.65); }
  .chat-body { background: #e5ddd5; padding: 1rem; display: flex; flex-direction: column; gap: 9px; }
  .msg { max-width: 78%; padding: 0.5rem 0.8rem; border-radius: 7px; font-size: 0.83rem; line-height: 1.5; }
  .msg .t { font-size: 0.65rem; opacity: 0.5; margin-top: 3px; text-align: right; }
  .msg-in { background: #fff; align-self: flex-start; border-radius: 0 7px 7px 7px; color: var(--ink); }
  .msg-out { background: #dcf8c6; align-self: flex-end; border-radius: 7px 0 7px 7px; color: var(--ink); }
  .typing { display: flex; align-items: center; gap: 4px; padding: 0.5rem 0.8rem; background: #fff; border-radius: 0 7px 7px 7px; align-self: flex-start; width: 52px; }
  .typing span { width: 6px; height: 6px; background: #aaa; border-radius: 50%; animation: tbounce 1.2s infinite; }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes tbounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

  /* SECTIONS */
  .section { max-width: 820px; margin: 0 auto; padding: 5rem 2rem; }
  .section-label { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 0.5rem; }
  h2 { font-family: 'DM Serif Display', serif; font-size: clamp(1.7rem, 3.5vw, 2.4rem); letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 2.5rem; }
  .divider { max-width: 820px; margin: 0 auto; border: none; border-top: 1px solid var(--border); }

  /* STEPS */
  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1.2rem; }
  .step { padding: 1.5rem; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface-card); }
  .step-num { font-size: 0.7rem; font-weight: 500; color: var(--accent); letter-spacing: 0.06em; margin-bottom: 0.85rem; }
  .step-icon { width: 38px; height: 38px; background: var(--accent-light); border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.85rem; color: var(--accent); }
  .step h3 { font-size: 0.95rem; font-weight: 500; margin-bottom: 0.4rem; }
  .step p { font-size: 0.83rem; color: var(--ink-muted); line-height: 1.6; }

  /* FEATURES GRID */
  .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 0; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface-card); }
  .feat { padding: 1.6rem; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .feat-icon { color: var(--accent); margin-bottom: 0.85rem; }
  .feat h3 { font-size: 0.92rem; font-weight: 500; margin-bottom: 0.35rem; }
  .feat p { font-size: 0.81rem; color: var(--ink-muted); line-height: 1.6; }

  /* CTA BOX */
  .cta-box { background: var(--ink); border-radius: var(--radius-lg); padding: 4rem 2.5rem; text-align: center; }
  .cta-box h2 { color: #fff; margin-bottom: 0.85rem; }
  .cta-box p { color: rgba(255,255,255,0.55); font-size: 1rem; font-weight: 300; margin-bottom: 2rem; }

  /* FOOTER */
  .footer { max-width: 820px; margin: 0 auto; padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; border-top: 1px solid var(--border); }
  .footer-brand { font-family: 'DM Serif Display', serif; font-size: 1.1rem; }
  .footer-brand span { color: var(--accent); }
  .footer-copy { font-size: 0.78rem; color: var(--ink-faint); }

  /* LOGIN PAGE */
  .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .auth-card { width: 100%; max-width: 400px; background: var(--surface-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow); }
  .auth-logo { font-family: 'DM Serif Display', serif; font-size: 1.6rem; text-align: center; margin-bottom: 0.4rem; letter-spacing: -0.02em; }
  .auth-logo span { color: var(--accent); }
  .auth-tagline { text-align: center; font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 2rem; }
  .form-group { margin-bottom: 1.1rem; }
  .form-label { display: block; font-size: 0.8rem; font-weight: 500; color: var(--ink-muted); margin-bottom: 0.4rem; letter-spacing: 0.02em; }
  .form-input { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--border-md); border-radius: var(--radius); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--ink); background: var(--surface); outline: none; transition: border 0.15s; }
  .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(26,106,74,0.1); }
  .form-error { font-size: 0.78rem; color: var(--danger); margin-top: 0.3rem; }
  .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.8rem; color: var(--ink-faint); }
  .auth-back { font-size: 0.8rem; color: var(--accent); cursor: pointer; text-decoration: none; margin-bottom: 1.5rem; display: inline-flex; align-items: center; gap: 4px; }
  .auth-back:hover { opacity: 0.75; }

  /* DASHBOARD */
  .dash-wrap { max-width: 900px; margin: 0 auto; padding: 2rem; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .dash-title { font-family: 'DM Serif Display', serif; font-size: 1.8rem; letter-spacing: -0.025em; }
  .dash-subtitle { font-size: 0.85rem; color: var(--ink-muted); margin-top: 0.2rem; }
  .dash-user { display: flex; align-items: center; gap: 0.75rem; }
  .user-av { width: 36px; height: 36px; background: var(--accent-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 500; color: var(--accent); }
  .user-name { font-size: 0.875rem; font-weight: 500; }
  .user-email { font-size: 0.75rem; color: var(--ink-muted); }

  /* STATS */
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--surface-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.2rem 1.4rem; }
  .stat-label { font-size: 0.75rem; color: var(--ink-muted); margin-bottom: 0.4rem; font-weight: 500; letter-spacing: 0.02em; }
  .stat-val { font-size: 1.9rem; font-weight: 300; font-family: 'DM Serif Display', serif; letter-spacing: -0.02em; color: var(--ink); }
  .stat-change { font-size: 0.72rem; color: var(--accent); margin-top: 0.2rem; }

  /* REPORTS TABLE */
  .reports-card { background: var(--surface-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .reports-head { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .reports-head h3 { font-size: 0.95rem; font-weight: 500; }
  .reports-table { width: 100%; border-collapse: collapse; }
  .reports-table th { font-size: 0.72rem; font-weight: 500; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.06em; padding: 0.75rem 1.5rem; text-align: left; background: var(--surface-alt); border-bottom: 1px solid var(--border); }
  .reports-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.875rem; vertical-align: middle; }
  .reports-table tr:last-child td { border-bottom: none; }
  .reports-table tr:hover td { background: var(--surface-alt); }
  .report-name { font-weight: 500; color: var(--ink); }
  .report-date { color: var(--ink-muted); font-size: 0.82rem; }
  .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 500; padding: 0.25rem 0.7rem; border-radius: 100px; }
  .badge-done { background: var(--accent-light); color: var(--accent); }
  .badge-processing { background: #fff8e1; color: #b7720a; }
  .badge-error { background: rgba(192,57,43,0.08); color: var(--danger); }
  .pdf-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; color: var(--accent); cursor: pointer; border: none; background: none; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 0.3rem 0.7rem; border-radius: 6px; transition: background 0.15s; }
  .pdf-btn:hover { background: var(--accent-light); }
  .pdf-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .empty-state { padding: 4rem 2rem; text-align: center; color: var(--ink-muted); }
  .empty-state p { font-size: 0.9rem; margin-top: 0.5rem; }
  .loading-row td { text-align: center; color: var(--ink-faint); font-size: 0.85rem; padding: 2.5rem; }

  @media (max-width: 600px) {
    .nav-links { display: none; }
    .reports-table th:nth-child(3), .reports-table td:nth-child(3) { display: none; }
  }
`;

// ─── ICONS (inline SVG) ────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    attach: <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>,
    file: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    wa: <><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.857L.057 23.12a.75.75 0 0 0 .917.953l5.454-1.43A11.933 11.933 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></>,
    back: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── MOCK DATA (used when API is not yet connected) ──────────────────────────
const MOCK_REPORTS = [
  { id: "r1", name: "Q3 Expenses Report", created_at: "2025-05-20T10:41:00Z", status: "done", pdf_url: "#" },
  { id: "r2", name: "April Travel Receipts", created_at: "2025-05-18T14:22:00Z", status: "done", pdf_url: "#" },
  { id: "r3", name: "Vendor Invoice — May", created_at: "2025-05-22T09:05:00Z", status: "processing", pdf_url: null },
  { id: "r4", name: "Office Supply Summary", created_at: "2025-05-15T16:40:00Z", status: "done", pdf_url: "#" },
  { id: "r5", name: "Marketing Spend Q2", created_at: "2025-05-10T11:20:00Z", status: "error", pdf_url: null },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Nav({ page, setPage }) {
  const { isLoggedIn, logout } = useAuth();
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("landing")}>Settle<span>.</span></div>
      <div className="nav-right">
        {!isLoggedIn ? (
          <>
            <ul className="nav-links">
              <li><a onClick={() => setPage("landing")}>Home</a></li>
              <li><a onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</a></li>
            </ul>
            <button className="btn btn-ghost" onClick={() => setPage("login")}>Log in</button>
            <button className="btn btn-primary" onClick={() => setPage("login")}>Get started</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => setPage("dashboard")}>Dashboard</button>
            <button className="btn btn-danger" style={{ gap: 6 }} onClick={logout}>
              <Icon name="logout" size={14} /> Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function LandingPage({ setPage }) {
  return (
    <>
      <section className="hero">
        <div className="hero-badge">
          <span className="pulse" />
          Now live on WhatsApp
        </div>
        <h1>Reports ingested,<br /><em>in a message.</em></h1>
        <p className="hero-sub">
          Settle turns WhatsApp into a powerful report ingestion tool. Send files, photos, or voice notes — get a structured PDF back, instantly.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" style={{ padding: "0.75rem 1.6rem", fontSize: "0.95rem" }} onClick={() => setPage("login")}>
            <Icon name="wa" size={17} /> Start on WhatsApp
          </button>
          <button className="btn btn-ghost" style={{ fontSize: "0.9rem" }} onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
            See how it works →
          </button>
        </div>
      </section>

      <div className="chat-wrap">
        <div className="phone">
          <div className="phone-header">
            <div className="phone-av">S</div>
            <div>
              <div className="phone-title">Settle</div>
              <div className="phone-sub">online</div>
            </div>
          </div>
          <div className="chat-body">
            <div className="msg msg-out">
              Hi
              <div className="t">10:41 AM ✓✓</div>
            </div>
            <div className="msg msg-in">
              <strong>Greetings from Settle</strong><br /><br />
              📊 <strong>How may I help you?</strong><br />
              • Analyze<br />
              • Report<br />
              • Quit<br /><br />
              <strong>Choose an option from the list above</strong><br />
              <div className="t">10:41 AM</div>
            </div>
            <div className="msg msg-out">
              Analyze
              <div className="t">10:41 AM ✓✓</div>
            </div>
            <div className="msg msg-in">
              <strong>Send me all the files you want to process</strong><br /><br />
              Type go when you are done sending all the files<br />
              <div className="t">10:41 AM</div>
            </div>
            <div className="msg msg-out">
              qwer1.png
              <div className="t">10:41 AM ✓✓</div>
            </div>
            <div className="msg msg-out">
              qwer2.png
              <div className="t">10:41 AM ✓✓</div>
            </div>
            <div className="msg msg-out">
              qwer3.png
              <div className="t">10:41 AM ✓✓</div>
            </div>
            <div className="msg msg-out">
              go
              <div className="t">10:41 AM ✓✓</div>
            </div>
            <div className="msg msg-in">
              Processed<br />
              <strong>Here is the analysis of all the files you uploaded</strong><br /><br />
              Please wait for the pdf to be generated<br />
              <div className="t">10:41 AM</div>
            </div>
            <div className="typing">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" style={{ marginTop: "4rem" }} />

      <section className="section" id="how">
        <p className="section-label">How it works</p>
        <h2>Three steps to a clean PDF</h2>
        <div className="steps">
          {[
            { num: "01", icon: "attach", title: "Send your report", desc: "Drop a PDF, Excel, image, or voice note into your Settle WhatsApp chat. Any format." },
            { num: "02", icon: "grid", title: "Settle extracts", desc: "AI reads, parses, and categorises every line item, figure, and field — zero manual work." },
            { num: "03", icon: "file", title: "Get your PDF", desc: "A clean, structured PDF report lands on your dashboard — ready to download or share." },
          ].map(s => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon"><Icon name={s.icon} size={19} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="section">
        <p className="section-label">Features</p>
        <h2>Everything you need</h2>
        <div className="features">
          {[
            { icon: "file", title: "Multi-format ingestion", desc: "PDF, Excel, CSV, images, voice notes — Settle handles all of them." },
            { icon: "zap", title: "Instant processing", desc: "Results in seconds. No dashboards to navigate, no uploads." },
            { icon: "grid", title: "Smart categorisation", desc: "Line items grouped and labelled automatically — vendors, dates, amounts." },
            { icon: "download", title: "PDF output", desc: "Every report comes out as a clean, shareable, downloadable PDF." },
            { icon: "chat", title: "Conversational queries", desc: "Ask follow-up questions in plain language — Settle replies in the same chat." },
            { icon: "shield", title: "Secure by design", desc: "Docs are processed and discarded. Never stored. Never used for training." },
          ].map(f => (
            <div className="feat" key={f.title}>
              <div className="feat-icon"><Icon name={f.icon} size={20} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div className="cta-box">
          <h2>Ready to settle your reports?</h2>
          <p>No app downloads. No sign-up friction. Just WhatsApp.</p>
          <button className="btn btn-wa" style={{ padding: "0.8rem 1.8rem", fontSize: "0.95rem" }}>
            <Icon name="wa" size={17} /> Open WhatsApp
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">Settle<span>.</span></div>
        <div className="footer-copy">A product by Pranaa · settle.pranaa.com</div>
      </footer>
    </>
  );
}

function LoginPage({ setPage }) {
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isLoggedIn) setPage("dashboard"); }, [isLoggedIn]);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await login(email, password);
      setPage("dashboard");
    } catch (e) {
      // Mock login for demo — remove this block once backend is live
      if (email && password) {
        const mockUser = { name: email.split("@")[0], email };
        localStorage.setItem("settle_token", "mock_token_123");
        localStorage.setItem("settle_user", JSON.stringify(mockUser));
        window.location.reload();
      } else {
        setError(e.message || "Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">Settle<span>.</span></div>
        <div className="auth-tagline">Sign in to your dashboard</div>

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          {error && <div className="form-error">{error}</div>}
        </div>

        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: "0.5rem" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="auth-footer">
          <span onClick={() => setPage("landing")} style={{ cursor: "pointer", color: "var(--accent)" }}>
            ← Back to home
          </span>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ setPage }) {
  const { user, token, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(token);
      setReports(data);
    } catch {
      // Fall back to mock data while backend is not yet connected
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleDownload = async (report) => {
    if (!report.pdf_url) return;
    setDownloading(report.id);
    try {
      // If real API: const blob = await api.downloadPDF(token, report.id);
      // For mock, just open the url
      if (report.pdf_url && report.pdf_url !== "#") {
        const a = document.createElement("a");
        a.href = report.pdf_url;
        a.download = report.name + ".pdf";
        a.click();
      } else {
        alert("PDF download will work once your backend is connected.");
      }
    } catch {
      alert("Failed to download PDF.");
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const done = reports.filter(r => r.status === "done").length;
  const processing = reports.filter(r => r.status === "processing").length;

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <div>
          <div className="dash-title">Dashboard</div>
          <div className="dash-subtitle">Your processed reports and PDFs</div>
        </div>
        <div className="dash-user">
          <div>
            <div className="user-name" style={{ textAlign: "right" }}>{user?.name || "User"}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <div className="user-av">{initials}</div>
          <button className="btn btn-ghost" style={{ gap: 5 }} onClick={() => { logout(); setPage("landing"); }}>
            <Icon name="logout" size={14} /> Log out
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total Reports</div>
          <div className="stat-val">{reports.length}</div>
          <div className="stat-change">via WhatsApp</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PDFs Ready</div>
          <div className="stat-val">{done}</div>
          <div className="stat-change">ready to download</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Processing</div>
          <div className="stat-val">{processing}</div>
          <div className="stat-change">in queue</div>
        </div>
      </div>

      <div className="reports-card">
        <div className="reports-head">
          <h3>Reports</h3>
          <button className="btn btn-ghost" style={{ gap: 5, fontSize: "0.8rem" }} onClick={fetchReports}>
            <Icon name="refresh" size={13} /> Refresh
          </button>
        </div>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report name</th>
              <th>Status</th>
              <th>Date</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row"><td colSpan={4}>Loading reports…</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={4}>
                <div className="empty-state">
                  <Icon name="file" size={28} />
                  <p>No reports yet. Send a file to Settle on WhatsApp to get started.</p>
                </div>
              </td></tr>
            ) : reports.map(r => (
              <tr key={r.id}>
                <td><div className="report-name">{r.name}</div></td>
                <td>
                  <span className={`badge ${r.status === "done" ? "badge-done" : r.status === "processing" ? "badge-processing" : "badge-error"}`}>
                    {r.status === "done" ? "✓ Done" : r.status === "processing" ? "⏳ Processing" : "✗ Error"}
                  </span>
                </td>
                <td><span className="report-date">{formatDate(r.created_at)}</span></td>
                <td>
                  {r.status === "done" ? (
                    <button className="pdf-btn" onClick={() => handleDownload(r)} disabled={downloading === r.id}>
                      <Icon name="download" size={13} />
                      {downloading === r.id ? "…" : "Download PDF"}
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1.5rem", padding: "1rem 1.2rem", background: "var(--accent-light)", borderRadius: "var(--radius)", border: "1px solid rgba(26,106,74,0.15)", fontSize: "0.82rem", color: "var(--accent)" }}>
        💬 <strong>Send a new report:</strong> Forward any PDF, Excel, or image to <strong>Settle on WhatsApp</strong> — your PDF will appear here automatically.
      </div>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");

  // Inject global styles
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = styles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  return (
    <AuthProvider>
      <AppInner page={page} setPage={setPage} />
    </AuthProvider>
  );
}

function AppInner({ page, setPage }) {
  const { isLoggedIn } = useAuth();

  // Redirect to dashboard if already logged in and hitting login
  useEffect(() => {
    if (isLoggedIn && page === "login") setPage("dashboard");
    if (!isLoggedIn && page === "dashboard") setPage("login");
  }, [isLoggedIn, page]);

  return (
    <div>
      {page !== "login" && <Nav page={page} setPage={setPage} />}
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
    </div>
  );
}
