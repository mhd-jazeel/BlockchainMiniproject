import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const links = [
    { to:"/dashboard", label:"Dashboard", icon:"🏠" },
    { to:"/jobs",      label:"Jobs",      icon:"💼" },
    { to:"/escrow",    label:"Escrow",    icon:"🔗" },
    ...(role === "client" ? [{ to:"/create-job", label:"Post Job", icon:"➕" }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.logo}>🔗 FreelanceX</Link>

      <div style={styles.links}>
        {links.map(l => (
          <Link key={l.to} to={l.to}
            style={{ ...styles.link, ...(isActive(l.to) ? styles.linkActive : {}) }}>
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
      </div>

      <div style={styles.right}>
        <span style={styles.nameTag}>
          <span className={`badge badge-${role}`}>{role}</span>
          <span style={{ marginLeft:8, fontWeight:600 }}>{name}</span>
        </span>
        <button className="btn btn-outline btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"0 28px",
    height:"62px",
    background:"var(--surface)",
    borderBottom:"1px solid var(--border)",
    position:"sticky", top:0, zIndex:100,
    backdropFilter:"blur(8px)",
  },
  logo: {
    fontSize:"1.1rem", fontWeight:800, color:"var(--accent)",
    textDecoration:"none", letterSpacing:"-0.02em",
  },
  links: { display:"flex", gap:4 },
  link: {
    display:"flex", alignItems:"center", gap:6,
    padding:"8px 14px", borderRadius:"var(--radius)",
    color:"var(--muted)", fontWeight:500, fontSize:"0.88rem",
    textDecoration:"none", transition:"all 0.15s",
  },
  linkActive: {
    background:"rgba(108,99,255,0.12)",
    color:"var(--accent)", fontWeight:600,
  },
  right: { display:"flex", alignItems:"center", gap:14 },
  nameTag: { display:"flex", alignItems:"center", fontSize:"0.88rem" },
};
