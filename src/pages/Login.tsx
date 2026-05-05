import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { setAuthToken } from "../api/client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import dvskLogo from "../assets/Secondary_logo.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
          localStorage.setItem("adminAuth", "true");
          navigate("/products/inventory", { replace: true });
        } catch {
          setCheckingAuth(false);
        }
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0914] text-[#ececec]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <div className="text-[11px] tracking-[0.3em] text-[#666] uppercase">
            Checking session
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const firebaseToken = await user.getIdToken();
      setAuthToken(firebaseToken);
      localStorage.setItem("adminAuth", "true");

      toast.success("Logged in successfully");
      navigate("/products/inventory");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0914] text-[#ececec] relative overflow-hidden">
      {/* Ambient purple glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo + brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] mb-4">
            <img src={dvskLogo} alt="DVSK" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-white">DVSK Admin</h1>
          <p className="text-[11px] tracking-[0.3em] text-[#666] uppercase mt-1">
            Command Center
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-[0.2em] text-[#888] uppercase font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dvsk.com"
                className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.2em] text-[#888] uppercase font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[13px] tracking-[0.15em] uppercase rounded-xl py-3 transition-all shadow-[0_0_20px_rgba(147,51,234,0.25)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] tracking-[0.25em] text-[#444] uppercase mt-6">
          DVSK CLO. — Internal Tool
        </p>
      </div>
    </div>
  );
}
