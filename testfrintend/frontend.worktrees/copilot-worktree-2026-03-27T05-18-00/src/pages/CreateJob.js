import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function CreateJob() {
  const [form, setForm] = useState({
    title: "", description: "", budget: "", freelancerAddress: ""
  });
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      // 1. Create job in MongoDB
      const { data: job } = await API.post("/api/jobs/create", {
        title: form.title,
        description: form.description,
        budget: parseFloat(form.budget),
        freelancerAddress: form.freelancerAddress || undefined,
      });

      // 2. Lock funds in blockchain escrow (if freelancer address provided)
      if (form.freelancerAddress) {
        try {
          await API.post("/api/escrow/create", {
            freelancerAddress: form.freelancerAddress,
            amount: form.budget,
          });
          setSuccess("Job created and escrow funded on blockchain! 🎉");
        } catch {
          setSuccess("Job created in DB. Escrow skipped (Ganache may not be running).");
        }
      } else {
        setSuccess("Job posted successfully!");
      }

      setTimeout(() => navigate("/jobs"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 style={{ marginBottom:6 }}>Post a Job</h1>
      <p style={{ color:"var(--muted)", marginBottom:28 }}>
        Fill in the details below. If you provide a freelancer wallet address, funds will be locked in blockchain escrow.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div className="form-group">
            <label>Job Title</label>
            <input name="title" placeholder="e.g. Build a DeFi Dashboard" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={4} placeholder="Describe the work, requirements, and deliverables…"
              value={form.description} onChange={handleChange}
              style={{ resize:"vertical" }} />
          </div>

          <div className="form-group">
            <label>Budget (ETH)</label>
            <input name="budget" type="number" step="0.001" min="0" placeholder="0.5"
              value={form.budget} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Freelancer Wallet Address <span style={{ color:"var(--muted)", fontWeight:400, textTransform:"none" }}>(optional)</span></label>
            <input name="freelancerAddress" placeholder="0x…"
              value={form.freelancerAddress} onChange={handleChange} />
            <small style={{ color:"var(--muted)" }}>If provided, funds will be locked in the smart contract escrow.</small>
          </div>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="flex gap-sm">
            <button type="button" className="btn btn-outline" onClick={() => navigate("/jobs")}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex:1, justifyContent:"center" }}>
              {loading ? "Posting…" : "🚀 Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
