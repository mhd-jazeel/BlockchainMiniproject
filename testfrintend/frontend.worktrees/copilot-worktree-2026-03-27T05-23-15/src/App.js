import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar   from "./components/Navbar";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Jobs        from "./pages/Jobs";
import CreateJob   from "./pages/CreateJob";
import JobDetail   from "./pages/JobDetail";
import Escrow      from "./pages/Escrow";
import "./index.css";

// ── Protected layout: requires a JWT token ────────────────────────────────────
function ProtectedLayout() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/jobs"       element={<Jobs />} />
          <Route path="/jobs/:id"   element={<JobDetail />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/escrow"     element={<Escrow />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
