import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, Building2, CheckCircle2, Clock3, Code2, Compass, GraduationCap, LogIn, LogOut, MapPin, Menu, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { api } from "./api";

const demoJobs = [
  { _id: "demo-1", title: "Cybersecurity Analyst Intern", company: "Nexus Security", location: "Chennai, India", type: "Hybrid", stipend: "₹15,000 / month", skills: ["SOC", "SIEM", "Networking"], description: "Help monitor alerts, investigate suspicious activity, and document security findings with a hands-on security team." },
  { _id: "demo-2", title: "Frontend Developer Intern", company: "PixelCraft Labs", location: "Remote", type: "Remote", stipend: "₹12,000 / month", skills: ["React", "JavaScript", "CSS"], description: "Build accessible product experiences, work with reusable components, and ship real features alongside engineers." },
  { _id: "demo-3", title: "AI / Machine Learning Intern", company: "Cortex AI", location: "Bengaluru, India", type: "Hybrid", stipend: "₹20,000 / month", skills: ["Python", "ML", "Pandas"], description: "Prototype machine-learning workflows, evaluate model quality, and turn experiments into useful product insights." },
  { _id: "demo-4", title: "Full Stack Developer Intern", company: "Orbit Digital", location: "Remote", type: "Remote", stipend: "₹18,000 / month", skills: ["Node.js", "Express", "MongoDB"], description: "Develop APIs and polished interfaces, write maintainable code, and collaborate through pull requests." },
  { _id: "demo-5", title: "Cloud Engineering Intern", company: "CloudNova", location: "Hyderabad, India", type: "On-site", stipend: "₹16,000 / month", skills: ["AWS", "Linux", "Docker"], description: "Support cloud deployments, automate repeatable tasks, and learn modern infrastructure practices." },
  { _id: "demo-6", title: "Product Design Intern", company: "Goodspace Studio", location: "Remote", type: "Remote", stipend: "₹10,000 / month", skills: ["Figma", "Research", "UI/UX"], description: "Explore user needs, map journeys, and translate ideas into thoughtful prototypes and design systems." }
];

const categories = ["All roles", "Cybersecurity", "Development", "AI & Data", "Design", "Cloud"];

function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("lp_user")); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem("lp_token") || "");
  const [jobs, setJobs] = useState(demoJobs);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All roles");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [selected, setSelected] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/internships").then(data => { if (data.internships?.length) setJobs(data.internships); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (token) {
      api("/auth/me", { token }).then(({ user }) => {
        setUser(user); localStorage.setItem("lp_user", JSON.stringify(user));
      }).catch(() => logout(false));
    }
  }, []);

  useEffect(() => {
    if (token) api("/applications/mine", { token }).then(data => setMyApps(data.applications || [])).catch(() => {});
  }, [token]);

  const filtered = useMemo(() => jobs.filter(job => {
    const text = `${job.title} ${job.company} ${job.location} ${(job.skills || []).join(" ")}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const key = category === "AI & Data" ? /ai|machine learning|data|python|ml/i : category === "Development" ? /developer|development|frontend|backend|full stack|react/i : category === "Cybersecurity" ? /cyber|security|soc|siem/i : category === "Design" ? /design|ui\/ux|product/i : category === "Cloud" ? /cloud|devops|aws/i : null;
    return matchesSearch && (!key || key.test(text));
  }), [jobs, search, category]);

  function notify(message) { setToast(message); window.setTimeout(() => setToast(""), 3200); }
  function logout(showToast = true) {
    localStorage.removeItem("lp_token"); localStorage.removeItem("lp_user");
    setToken(""); setUser(null); setMyApps([]);
    if (showToast) notify("You have been signed out.");
  }

  async function submitAuth(event) {
    event.preventDefault(); setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const result = await api(`/auth/${authMode}`, { method: "POST", body: JSON.stringify(payload) });
      localStorage.setItem("lp_token", result.token); localStorage.setItem("lp_user", JSON.stringify(result.user));
      setToken(result.token); setUser(result.user); setAuthOpen(false);
      notify(authMode === "login" ? "Welcome back!" : "Account created. Welcome aboard!");
    } catch (error) { notify(error.message); }
    finally { setLoading(false); }
  }

  async function apply(job) {
    if (!token) { setAuthMode("login"); setAuthOpen(true); notify("Log in to apply for this role."); return; }
    if (String(job._id).startsWith("demo-")) { notify("Connect MongoDB and add real listings before submitting applications."); return; }
    try {
      await api(`/internships/${job._id}/apply`, { method: "POST", token, body: JSON.stringify({ coverLetter: "" }) });
      notify("Application submitted successfully.");
      const data = await api("/applications/mine", { token }); setMyApps(data.applications || []);
    } catch (error) { notify(error.message); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <span className="brand-mark"><Compass size={21} strokeWidth={2.4}/></span><span>launchpad<span className="brand-dot">.</span></span>
      </a>
      <nav className={mobileMenu ? "nav-links nav-open" : "nav-links"}>
        <a href="#opportunities" onClick={() => setMobileMenu(false)}>Find internships</a>
        <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
        {user && <button className="nav-link-button" onClick={() => { notify(`You have ${myApps.length} application${myApps.length === 1 ? "" : "s"}.`); setMobileMenu(false); }}>My applications <span className="count">{myApps.length}</span></button>}
      </nav>
      <div className="top-actions">
        {user ? <><span className="user-greeting">Hi, {user.name.split(" ")[0]}</span><button className="btn btn-outline btn-small" onClick={() => logout()}><LogOut size={15}/> Sign out</button></> :
          <><button className="btn btn-ghost btn-small" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>Log in</button><button className="btn btn-dark btn-small" onClick={() => { setAuthMode("register"); setAuthOpen(true); }}>Get started <ArrowUpRight size={15}/></button></>}
      </div>
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
    </header>

    <main>
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-pulse"></span> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Big careers start<br/>with <span className="highlight">small beginnings.</span></h1>
          <p className="hero-desc">Find internships that turn your curiosity into experience. Real teams, meaningful work, and a first step worth taking.</p>
          <div className="hero-actions"><a className="btn btn-lime" href="#opportunities">Explore opportunities <ArrowUpRight size={17}/></a><a className="text-link" href="#how-it-works">How it works <span>↗</span></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>R</span><span>A</span><span>K</span><span>S</span></div><div><strong>Built for what's next</strong><small>Find your place. Make your mark.</small></div></div>
        </div>
        <div className="hero-art" aria-label="Career growth illustration">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="art-card card-back"><span className="mini-label">YOUR POTENTIAL</span><div className="growth-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          <div className="art-card card-main"><div className="card-top"><span className="tiny-icon"><GraduationCap size={18}/></span><span className="live-tag"><i></i> OPEN OPPORTUNITY</span></div><div className="art-title">Make room<br/>for <span>growth.</span></div><div className="art-line"></div><div className="art-bottom"><div><small>YOUR NEXT MOVE</small><strong>Intern → Innovator</strong></div><span className="arrow-circle"><ArrowUpRight size={20}/></span></div></div>
          <div className="floating-badge badge-spark"><Sparkles size={17}/><span>Start curious</span></div><div className="floating-badge badge-check"><CheckCircle2 size={19}/><span>Build real skills</span></div>
          <div className="art-sun"></div>
        </div>
        <div className="hero-foot"><span>01 / FIND YOUR DIRECTION</span><span>OPPORTUNITY MEETS PREPARATION <span className="foot-star">✳</span></span></div>
      </section>

      <section className="stats-strip"><div><strong>{jobs.length}+</strong><span>opportunities to explore</span></div><div><strong>01</strong><span>bold first step</span></div><div><strong>∞</strong><span>ways to grow</span></div><div className="stats-note"><span className="stats-dot"></span> YOUR FUTURE IS IN PROGRESS</div></section>

      <section className="opportunities section-wrap" id="opportunities">
        <div className="section-heading"><div><div className="eyebrow dark-eyebrow">THE OPPORTUNITY BOARD</div><h2>Find work that<br/><em>moves you forward.</em></h2></div><p>From your first line of code to your first big idea, your next opportunity is out there.</p></div>
        <div className="search-row"><div className="search-box"><Search size={19}/><input aria-label="Search internships" placeholder="Role, company, or skill..." value={search} onChange={e => setSearch(e.target.value)}/>{search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={16}/></button>}</div><span className="result-count"><strong>{filtered.length}</strong> roles found</span></div>
        <div className="category-row">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? "category-chip active" : "category-chip"}>{c}</button>)}</div>
        <div className="job-grid">{filtered.map((job, i) => <article className="job-card" key={job._id}><div className="job-card-top"><div className={`company-icon icon-${i % 5}`}><Building2 size={22}/></div><button className="save-job" aria-label={`View ${job.title}`} onClick={() => setSelected(job)}><ArrowUpRight size={18}/></button></div><div className="job-type">{job.type || "Remote"} <span>·</span> Internship</div><h3>{job.title}</h3><p className="company-name">{job.company}</p><div className="job-meta"><span><MapPin size={14}/>{job.location || "Remote"}</span><span><BriefcaseBusiness size={14}/>{job.stipend || "Stipend varies"}</span></div><div className="skill-tags">{(job.skills || []).slice(0, 3).map(skill => <span key={skill}>{skill}</span>)}</div><button className="job-apply" onClick={() => setSelected(job)}>View opportunity <ArrowUpRight size={16}/></button></article>)}
        {filtered.length === 0 && <div className="empty-state"><Search size={30}/><h3>No matches just yet.</h3><p>Try another keyword or category. Your opportunity is out there.</p><button className="btn btn-dark" onClick={() => { setSearch(""); setCategory("All roles"); }}>Clear filters</button></div>}</div>
        <div className="demo-note"><span className="note-dot"></span> Sample listings are shown until your API contains real opportunities.</div>
      </section>

      <section className="how-section" id="how-it-works"><div className="section-wrap"><div className="eyebrow">NO GUESSWORK. JUST GROWTH.</div><div className="how-heading"><h2>Your next move,<br/><em>made simple.</em></h2><p>A little momentum goes a long way. Here is how to get started.</p></div><div className="steps-grid"><div className="step"><span className="step-no">01</span><div className="step-icon"><Search/></div><h3>Explore</h3><p>Discover roles that match your interests, skills, and the future you're building.</p></div><div className="step"><span className="step-no">02</span><div className="step-icon"><LogIn/></div><h3>Show up</h3><p>Create your account and apply to opportunities that feel like your next chapter.</p></div><div className="step"><span className="step-no">03</span><div className="step-icon"><Code2/></div><h3>Level up</h3><p>Learn on the job, collaborate with teams, and turn potential into progress.</p></div></div></div></section>

      <section className="cta-section"><div className="cta-pattern"></div><div className="cta-content"><span className="cta-kicker"><Sparkles size={15}/> THE FUTURE ISN'T WAITING</span><h2>Ready to make<br/>your <em>first move?</em></h2><p>Your experience doesn't have to start someday. It can start today.</p><button className="btn btn-lime" onClick={() => { setAuthMode("register"); setAuthOpen(true); }}>Create your free account <ArrowUpRight size={17}/></button></div><div className="cta-side"><div className="cta-ring"></div><div className="cta-stamp"><GraduationCap size={32}/><span>LEARN<br/>BY DOING</span></div></div></section>
    </main>

    <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark"><Compass size={19}/></span><span>launchpad<span className="brand-dot">.</span></span></a><span>Small beginnings. Limitless directions.</span><span>© 2026 Launchpad Internship Portal</span></footer>

    {authOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}><section className="auth-modal"><button className="modal-close" aria-label="Close" onClick={() => setAuthOpen(false)}><X/></button><div className="modal-mark"><Compass size={24}/></div><div className="eyebrow dark-eyebrow">{authMode === "login" ? "WELCOME BACK" : "YOUR NEXT CHAPTER"}</div><h2>{authMode === "login" ? "Good to see you." : "Let's get you started."}</h2><p className="modal-subtitle">{authMode === "login" ? "Log in to pick up where your future left off." : "Create an account and find your next opportunity."}</p><form onSubmit={submitAuth} className="auth-form">{authMode === "register" && <label>Full name<input name="name" placeholder="Your name" autoComplete="name" required minLength={2}/></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required/></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" autoComplete={authMode === "login" ? "current-password" : "new-password"} required minLength={8}/></label><button className="btn btn-dark auth-submit" disabled={loading}>{loading ? "Please wait..." : authMode === "login" ? "Log in securely" : "Create account"} <ArrowUpRight size={17}/></button></form><div className="secure-note"><ShieldCheck size={15}/> Passwords are securely hashed. Protected by JWT authentication.</div><p className="switch-auth">{authMode === "login" ? "New around here?" : "Already have an account?"} <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Create account" : "Log in"}</button></p></section></div>}

    {selected && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section className="detail-modal"><button className="modal-close" aria-label="Close" onClick={() => setSelected(null)}><X/></button><div className="company-icon detail-icon"><Building2 size={25}/></div><div className="job-type">{selected.type || "Remote"} <span>·</span> Internship</div><h2>{selected.title}</h2><p className="company-name">{selected.company}</p><div className="detail-meta"><span><MapPin size={15}/>{selected.location || "Remote"}</span><span><BriefcaseBusiness size={15}/>{selected.stipend || "Stipend varies"}</span></div><div className="detail-divider"></div><h3>About this opportunity</h3><p className="detail-description">{selected.description || "Join the team, learn by doing, and build experience through meaningful work."}</p><h3>Skills you'll explore</h3><div className="skill-tags detail-skills">{(selected.skills || []).map(skill => <span key={skill}>{skill}</span>)}</div><button className="btn btn-dark detail-apply" onClick={() => apply(selected)}>Apply for this internship <ArrowUpRight size={17}/></button><p className="detail-footnote"><Clock3 size={14}/> Take the first step. Your journey starts here.</p></section></div>}
    {toast && <div role="status" className="toast"><CheckCircle2 size={18}/>{toast}<button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={15}/></button></div>}
  </div>;
}

export default App;
