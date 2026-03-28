import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    API.get(`/api/jobs/${id}`)
      .then(({ data }) => setJob(data))
      .catch(() => setErr("Job not found."));
  }, [id]);

  const submitWork = async () => {
    setErr(""); setMsg(""); setLoading(true);
    try {
      await API.post("/api/jobs/submit", { jobId: id });
      setMsg("Work submitted successfully!");
      setJob(prev => ({ ...prev, status:"submitted" }));
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to submit work.");
    } finally { setLoading(false); }
  };

  const approveJob = async () => {
    setErr(""); setMsg(""); setLoading(true);
    try {
      await API.post("/api/jobs/approve", { jobId: id });
      setMsg("Job approved and payment released! 🎉");
      setJob(prev => ({ ...prev, status:"completed" }));
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to approve job.");
    } finally { setLoading(false); }
  };

  if (err && !job) return <div className="page"><div className="alert alert-error">{err}</div></div>;
  if (!job) return <div style={{ textAlign:"center", padding:"80px", color:"var(--muted)" }}>Loading…</div>;

  const statusMeta = {
    open:        { label:"Open",        color:"var(--accent2)" },
    in_progress: { label:"In Progress", color:"var(--warn)" },
    submitted:   { label:"Submitted",   color:"var(--accent)" },
    completed:   { label:"Completed",   color:"var(--accent2)" },
    cancelled:   { label:"Cancelled",   color:"var(--danger)" },
  };
  const sm = statusMeta[job.status] || {};

  return (
    <div className="page" style={{ maxWidth:680 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate("/jobs")} style={{ marginBottom:20 }}>
        ← Back to Jobs
      </button>

      <div className="card" style={{ marginBottom:20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom:16 }}>
          <h1 style={{ fontSize:"1.5rem" }}>{job.title}</h1>
          <span className={`badge badge-${job.status}`}>{sm.label}</span>
        </div>

        <p style={{ color:"var(--muted)", marginBottom:20, lineHeight:1.7 }}>
          {job.description || "No description provided."}
        </p>

        <div style={styles.infoGrid}>
          <InfoRow icon="💰" label="Budget"  value={`${job.budget} ETH`} />
          <InfoRow icon="📅" label="Posted"  value={new Date(job.createdAt).toLocaleDateString()} />
          {job.freelancerAddress && (
            <InfoRow icon="🔗" label="Freelancer Wallet"
              value={`${job.freelancerAddress.slice(0,10)}…${job.freelancerAddress.slice(-6)}`} />
          )}
          {job.transactionHash && (
            <InfoRow icon="⛓" label="Tx Hash"
              value={`${job.transactionHash.slice(0,14)}…`} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h3 style={{ marginBottom:16 }}>Actions</h3>

        {msg && <div className="alert alert-success" style={{ marginBottom:14 }}>{msg}</div>}
        {err && <div className="alert alert-error"   style={{ marginBottom:14 }}>{err}</div>}

        <div className="flex gap-sm" style={{ flexWrap:"wrap" }}>
          {role === "freelancer" && job.status === "open" && (
            <button className="btn btn-success" onClick={submitWork} disabled={loading}>
              {loading ? "Submitting…" : "✅ Submit Work"}
            </button>
          )}
          {role === "client" && job.status === "submitted" && (
            <button className="btn btn-primary" onClick={approveJob} disabled={loading}>
              {loading ? "Approving…" : "🎉 Approve & Release Payment"}
            </button>
          )}
          {job.blockchainJobId !== null && (
            <button className="btn btn-outline" onClick={() => navigate("/escrow")}>
              🔗 View Escrow
            </button>
          )}
          {job.status === "completed" && (
            <p style={{ color:"var(--accent2)", fontWeight:600 }}>✔ This job is complete. Payment released.</p>
          )}
          {(job.status === "open" && role === "client") && (
            <p style={{ color:"var(--muted)", fontSize:"0.88rem" }}>Waiting for freelancer to submit work.</p>
          )}
          {(job.status === "cancelled") && (
            <p style={{ color:"var(--danger)", fontSize:"0.88rem" }}>This job has been cancelled.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
      <span style={{ fontSize:"1.1rem" }}>{icon}</span>
      <div>
        <div style={{ fontSize:"0.78rem", color:"var(--muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</div>
        <div style={{ fontWeight:600 }}>{value}</div>
      </div>
    </div>
  );
}

const styles = {
  infoGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:16 },
};
