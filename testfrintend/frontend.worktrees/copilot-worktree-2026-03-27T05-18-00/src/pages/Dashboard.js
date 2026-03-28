import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, open: 0, completed: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get("/api/users/me");
        setUser(data);
        const jobsRes = await API.get("/api/jobs");
        const jobs = jobsRes.data || [];
        setStats({
          total: jobs.length,
          open: jobs.filter(j => j.status === "open").length,
          completed: jobs.filter(j => j.status === "completed").length,
        });
      } catch {
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  if (!user) return <div style={{ textAlign:"center", padding:"80px", color:"var(--muted)" }}>Loading…</div>;

  const isClient = user.role === "client";

  return (
    <div className="page">
      {/* Hero */}
      <div style={styles.hero}>
        <div>
          <h1 style={{ marginBottom: 6 }}>
            Welcome back, <span style={{ color:"var(--accent)" }}>{user.name}</span> 👋
          </h1>
          <p style={{ color:"var(--muted)" }}>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
            {user.walletAddress && (
              <span style={{ marginLeft:12, fontFamily:"monospace", fontSize:"0.8rem", color:"var(--muted)" }}>
                🔗 {user.walletAddress.slice(0,8)}…{user.walletAddress.slice(-6)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label:"Total Jobs", value: stats.total, color:"var(--accent)" },
          { label:"Open Jobs",  value: stats.open,  color:"var(--accent2)" },
          { label:"Completed",  value: stats.completed, color:"var(--warn)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex:1, textAlign:"center" }}>
            <div style={{ fontSize:"2rem", fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ color:"var(--muted)", fontSize:"0.85rem", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ marginBottom:16 }}>Quick Actions</h2>
      <div style={styles.actionGrid}>
        {isClient && (
          <ActionCard
            icon="➕"
            title="Post a Job"
            desc="Create a new job and lock funds in escrow"
            to="/create-job"
            accent="var(--accent)"
          />
        )}
        <ActionCard
          icon="💼"
          title="Browse Jobs"
          desc={isClient ? "View all jobs you have posted" : "Find and apply for available jobs"}
          to="/jobs"
          accent="var(--accent2)"
        />
        <ActionCard
          icon="🔗"
          title="Escrow Lookup"
          desc="Check blockchain escrow status for any job"
          to="/escrow"
          accent="var(--warn)"
        />
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, to, accent }) {
  return (
    <Link to={to} style={{ textDecoration:"none" }}>
      <div className="card" style={{ cursor:"pointer", transition:"transform 0.2s, border-color 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor=accent; }}
        onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.borderColor="var(--border)"; }}>
        <div style={{ fontSize:"2rem", marginBottom:12 }}>{icon}</div>
        <h3 style={{ color:accent, marginBottom:6 }}>{title}</h3>
        <p style={{ color:"var(--muted)", fontSize:"0.88rem" }}>{desc}</p>
      </div>
    </Link>
  );
}

const styles = {
  hero: {
    display:"flex", alignItems:"center", justifyContent:"space-between",
    background:"linear-gradient(135deg, #1e2535 0%, #161b27 100%)",
    border:"1px solid var(--border)",
    borderRadius:"16px",
    padding:"32px 36px",
    marginBottom:"28px",
  },
  statsRow: { display:"flex", gap:16, marginBottom:32 },
  actionGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))", gap:18 },
};
