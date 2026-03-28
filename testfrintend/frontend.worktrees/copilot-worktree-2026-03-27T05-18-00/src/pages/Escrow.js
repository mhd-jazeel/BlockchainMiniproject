import React, { useState } from "react";
import API from "../api/axios";

export default function Escrow() {
  const [jobId, setJobId] = useState("");
  const [data, setData]   = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (e) => {
    e.preventDefault();
    setError(""); setData(null); setLoading(true);
    try {
      const { data: result } = await API.get(`/api/escrow/job/${jobId}`);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || "Could not fetch escrow data. Make sure Ganache is running.");
    } finally { setLoading(false); }
  };

  const statusColors = { Created:"var(--accent2)", WorkSubmitted:"var(--warn)", Approved:"var(--accent)", Paid:"var(--accent2)" };

  return (
    <div className="page" style={{ maxWidth:640 }}>
      <h1 style={{ marginBottom:6 }}>Blockchain Escrow</h1>
      <p style={{ color:"var(--muted)", marginBottom:28 }}>
        Look up the on-chain escrow status for any job by its blockchain Job ID.
      </p>

      <div className="card" style={{ marginBottom:24 }}>
        <form onSubmit={lookup} style={{ display:"flex", gap:12 }}>
          <input
            type="number"
            placeholder="Enter blockchain Job ID (e.g. 0)"
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            required
            style={{ flex:1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "…" : "🔍 Lookup"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {data && (
        <div className="card">
          <h2 style={{ marginBottom:20 }}>Escrow Details — Job #{data.jobId}</h2>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Status">
              <span style={{ color: statusColors[data.status] || "var(--text)", fontWeight:700 }}>
                ● {data.status}
              </span>
            </Field>
            <Field label="Amount">
              <span style={{ color:"var(--accent2)", fontWeight:700 }}>
                {data.amount} ETH
              </span>
            </Field>
            <Field label="Client">
              <code style={{ fontSize:"0.82rem", color:"var(--muted)" }}>{data.client}</code>
            </Field>
            <Field label="Freelancer">
              <code style={{ fontSize:"0.82rem", color:"var(--muted)" }}>{data.freelancer}</code>
            </Field>
          </div>

          <div style={{ marginTop:20, padding:"14px 16px", background:"var(--bg)", borderRadius:"var(--radius)", fontSize:"0.82rem", color:"var(--muted)" }}>
            ℹ Data sourced directly from the Ganache smart contract. Refresh to update.
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:12, paddingBottom:14, borderBottom:"1px solid var(--border)" }}>
      <div style={{ minWidth:120, fontSize:"0.82rem", fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.04em", paddingTop:2 }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
