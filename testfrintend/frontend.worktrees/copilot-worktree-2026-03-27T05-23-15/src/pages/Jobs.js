import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/jobs")
      .then(({ data }) => setJobs(data))
      .catch(() => { setError("Failed to load jobs. Is the backend running?"); })
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { open:"var(--accent2)", in_progress:"var(--warn)", submitted:"var(--accent)", completed:"var(--accent2)", cancelled:"var(--danger)" };

  return (
    <div className="page">
      <div className="flex items-center justify-between" style={{ marginBottom:28 }}>
        <div>
          <h1>Job Marketplace</h1>
          <p style={{ color:"var(--muted)", marginTop:4 }}>
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {role === "client" && (
          <button className="btn btn-primary" onClick={() => navigate("/create-job")}>
            ➕ Post Job
          </button>
        )}
      </div>

      {loading && <p style={{ color:"var(--muted)" }}>Loading jobs…</p>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && !error && jobs.length === 0 && (
        <div className="card" style={{ textAlign:"center", padding:"60px" }}>
          <div style={{ fontSize:"3rem", marginBottom:12 }}>📭</div>
          <h2 style={{ marginBottom:8 }}>No jobs yet</h2>
          <p style={{ color:"var(--muted)" }}>
            {role === "client" ? "Post your first job to get started." : "No jobs available right now."}
          </p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {jobs.map(job => (
          <Link key={job._id} to={`/jobs/${job._id}`} style={{ textDecoration:"none" }}>
            <div className="card" style={{ cursor:"pointer", transition:"transform 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor="var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.borderColor="var(--border)"; }}>
              <div className="flex items-center justify-between" style={{ marginBottom:10 }}>
                <h3>{job.title}</h3>
                <span className={`badge badge-${job.status}`}>{job.status.replace("_"," ")}</span>
              </div>
              <p style={{ color:"var(--muted)", fontSize:"0.88rem", marginBottom:14 }}>
                {job.description?.slice(0,120) || "No description provided."}{job.description?.length > 120 ? "…" : ""}
              </p>
              <div className="flex gap-md" style={{ fontSize:"0.85rem", color:"var(--muted)" }}>
                <span>💰 <strong style={{ color:statusColor[job.status] || "var(--text)" }}>{job.budget} ETH</strong></span>
                <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                {job.freelancer && <span>👤 Assigned</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
