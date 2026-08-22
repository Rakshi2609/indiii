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
    } catch {
      setErrorMessage("Failed to authenticate demo account. Please check backend connection.");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-container-low text-on-surface p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-cadastral">
      {/* Background Decorative Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-surface-tint/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary-container text-on-primary-container shadow-md mb-1 font-mono font-bold text-xl">
            L
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary">LAND AI</h1>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              इंडी-भूमि
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            Verified Indian Land Record Intelligence &amp; Cadastral Verification
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant pt-0.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#15803D]" />
            <span>Digital India Land Records Modernization Programme (DILRMP)</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5">
          
          <div className="border-b border-outline-variant pb-3">
            <h2 className="text-sm font-bold text-on-surface">Sign In to Your Portal</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Select your role or enter provisioned institutional credentials
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-error/20 bg-error-container p-3 text-xs text-on-error-container flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>Email Address / Officer ID</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nishu@demo.landai or officer@demo.landai"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-10 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant hover:text-on-surface">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span>Remember session</span>
              </label>
              <span className="text-on-surface-variant text-[11px]">Role auto-detected</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary hover:bg-primary/90 py-2.5 text-xs font-bold shadow-sm cursor-pointer"
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

          {/* Citizen Sign Up Link */}
          <div className="text-center text-xs text-on-surface-variant pt-1">
            <span>New Citizen / Land Owner? </span>
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Create Land Vault
            </Link>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-outline-variant space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              <span>🚀 1-Click Evaluation Demo</span>
              <span className="text-[#15803D]">Pre-Seeded</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("OWNER")}
                disabled={demoLoading !== null}
                className="flex flex-col text-left p-3 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Demo Owner</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    Nishu
                  </Badge>
                </div>
                <span className="text-[11px] text-on-surface-variant line-clamp-1">
                  Multi-State Vault
                </span>
                <span className="text-[10px] text-primary mt-1 font-semibold">
                  Redirects → /owner
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("REVENUE_OFFICER")}
                disabled={demoLoading !== null}
                className="flex flex-col text-left p-3 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span>Demo Officer</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    Govt
                  </Badge>
                </div>
                <span className="text-[11px] text-on-surface-variant line-clamp-1">
                  Command &amp; GIS
                </span>
                <span className="text-[10px] text-primary mt-1 font-semibold">
                  Redirects → /dashboard
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-on-surface-variant space-y-1">
          <p>© 2026 LAND AI Platform (इंडी-भूमि) • Smart India Hackathon</p>
          <div className="flex items-center justify-center gap-3 text-[11px]">
            <Link href="/" className="hover:text-primary">Platform Overview</Link>
            <span>•</span>
            <Link href="/copilot" className="hover:text-primary">Land AI Copilot</Link>
            <span>•</span>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-primary">FastAPI Swagger</a>
          </div>
        </div>

      </div>
    </div>
  );
}
