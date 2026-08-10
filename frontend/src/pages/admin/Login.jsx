import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("scc_token", data.token);
      nav("/admin");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <main data-testid="admin-login" className="min-h-screen bg-coffee flex items-center justify-center px-6">
      <form onSubmit={submit} className="bg-ivory rounded-2xl p-10 w-full max-w-md">
        <div className="font-serif text-3xl text-coffee tracking-widest uppercase text-center mb-1">Stay Coral</div>
        <p className="overline text-coral text-center mb-8">Admin Panel</p>
        {error && <p data-testid="login-error" className="text-destructive text-sm text-center mb-4">{error}</p>}
        <input data-testid="login-email" required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-b border-sand focus:border-coral outline-none py-3 mb-5 bg-transparent text-coffee" />
        <input data-testid="login-password" required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-b border-sand focus:border-coral outline-none py-3 mb-8 bg-transparent text-coffee" />
        <button data-testid="login-submit" disabled={loading} className="w-full rounded-full bg-coral text-white py-4 text-xs tracking-widest uppercase hover:bg-coral-dark transition-all disabled:opacity-60">{loading ? "..." : "Sign In"}</button>
      </form>
    </main>
  );
}
