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

export default function SignupPage() {
  const { signup, demoLogin } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMessage("Please complete all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await signup(fullName, email, password);
    if (!res.success) {
      setErrorMessage(res.error || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "OWNER" | "REVENUE_OFFICER") => {
    setDemoLoading(role);
    setErrorMessage(null);
    try {
      await demoLogin(role);
    } catch (e: any) {
      setErrorMessage("Failed to authenticate demo account.");
    } finally {
      setDemoLoading(null);
    }
  };

  const indianStates = [
    "Karnataka",
    "Maharashtra",
    "Telangana",
    "Andhra Pradesh",
    "Tamil Nadu",
    "Rajasthan",
    "Uttar Pradesh",
    "Madhya Pradesh",
    "Gujarat",
    "Punjab",
    "Haryana",
    "West Bengal",
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 shadow-xl shadow-emerald-600/20 mb-2">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">LAND AI</h1>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5">
              इंडी-भूमि
            </Badge>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Create Your Citizen Land Tracking Vault
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Digital India Land Records Modernization (DILRMP)</span>
          </div>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
          
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-semibold text-white">Citizen Account Registration</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track and monitor your verified properties, cadastral parcels, and title lineages
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nishu Kumar / रमेश शर्मा"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

            {/* State Selection */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Primary Land State
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-[11px] text-slate-400 leading-relaxed space-y-1">
              <p className="flex items-start gap-1.5 text-emerald-300/90 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Citizen Role: Verified Land Tracking &amp; Intelligence</span>
              </p>
              <p className="text-[10px] text-slate-500 pl-5">
                Citizens have full tracking access to view properties, satellite cadastral maps, and title histories. Document upload is restricted to authorized Revenue Officers.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Land Vault...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create Citizen Vault</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Already Have Account */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
            <span>Already have an account? </span>
            <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>

          {/* Demo 1-Click Access */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block text-center">
              Or Explore Instantly with Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("OWNER")}
                disabled={demoLoading !== null}
                className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 text-xs font-semibold text-indigo-300 text-center transition-colors"
              >
                👤 Demo Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("REVENUE_OFFICER")}
                disabled={demoLoading !== null}
                className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-xs font-semibold text-emerald-300 text-center transition-colors"
              >
                🏛️ Demo Officer
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>© 2026 Land AI Platform (इंडी-भूमि) • Smart India Hackathon</p>
        </div>

      </div>
    </div>
  );
}
