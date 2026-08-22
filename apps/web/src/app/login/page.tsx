"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    const success = await login(email, password);
    if (!success) {
      setErrorMessage("Invalid credentials. Please verify your email and password.");
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "OWNER" | "REVENUE_OFFICER" | "ADMIN") => {
    setDemoLoading(role);
    setErrorMessage(null);
    try {
      if (role === "OWNER") {
        setEmail("nishu@demo.landai");
        setPassword("LandAI@123");
      } else if (role === "REVENUE_OFFICER") {
        setEmail("officer@demo.landai");
        setPassword("LandAI@123");
      } else {
        setEmail("admin@demo.landai");
        setPassword("LandAI@123");
      }
      await demoLogin(role);
    } catch (e: any) {
      setErrorMessage("Failed to authenticate demo account. Please check backend connection.");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-xl shadow-indigo-600/20 mb-2">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">LAND AI</h1>
            <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5">
              इंडी-भूमि
            </Badge>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Verified land intelligence for India
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Digital India Land Records Modernization Programme (DILRMP)</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
          
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-semibold text-white">Sign In to Your Portal</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your role or enter provisioned institutional credentials
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Email Address / Officer ID</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nishu@demo.landai or officer@demo.landai"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-500 text-[11px]">Role auto-detected</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>🚀 1-Click Competition Demo</span>
              <span className="text-emerald-400">Pre-Seeded</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("OWNER")}
                disabled={demoLoading !== null}
                className="flex flex-col text-left p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 hover:border-indigo-500/60 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Demo Owner</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-indigo-500/40 bg-indigo-500/10 text-indigo-300 px-1 py-0">
                    Nishu
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-1">
                  Multi-State Land Vault
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 font-medium">
                  Redirects → /owner
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("REVENUE_OFFICER")}
                disabled={demoLoading !== null}
                className="flex flex-col text-left p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-500/60 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Demo Officer</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/40 bg-emerald-500/10 text-emerald-300 px-1 py-0">
                    Govt
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-1">
                  Verification &amp; GIS
                </span>
                <span className="text-[10px] text-indigo-400 mt-1 font-medium">
                  Redirects → /dashboard
                </span>
              </button>
            </div>
          </div>

          {/* Institutional Note */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-[11px] text-slate-400 leading-relaxed">
            <p className="flex items-start gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Institutional access is strictly managed. Citizen and Officer accounts are provisioned via State Revenue Authority registers. Public self-registration is restricted.
              </span>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>© 2026 Land AI Platform (इंडी-भूमि) • Smart India Hackathon</p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600">
            <Link href="/" className="hover:text-slate-400">Platform Overview</Link>
            <span>•</span>
            <Link href="/copilot" className="hover:text-slate-400">Land AI Copilot</Link>
            <span>•</span>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-slate-400">FastAPI Swagger</a>
          </div>
        </div>

      </div>
    </div>
  );
}
