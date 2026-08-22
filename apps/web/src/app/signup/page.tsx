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
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
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
    } catch {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-container-low text-on-surface p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-cadastral">
      {/* Background Glow */}
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
            Create Your Citizen Land Tracking Vault
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant pt-0.5">
            <Shield className="h-3.5 w-3.5 text-[#15803D]" />
            <span>Digital India Land Records Modernization (DILRMP)</span>
          </div>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5">
          
          <div className="border-b border-outline-variant pb-3">
            <h2 className="text-sm font-bold text-on-surface">Citizen Account Registration</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Track and monitor your verified properties, cadastral parcels, and title lineages
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-error/20 bg-error-container p-3 text-xs text-on-error-container flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nishu Kumar / रमेश शर्मा"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            {/* State Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">
                Primary Land State
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-4 py-2 text-xs text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className="rounded-lg bg-surface-container-low border border-outline-variant p-3 text-[11px] text-on-surface-variant space-y-1">
              <p className="flex items-start gap-1.5 text-primary font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>Citizen Role: Verified Land Tracking &amp; Intelligence</span>
              </p>
              <p className="text-[10px] text-on-surface-variant pl-5">
                Citizens have tracking access to view property portfolios, satellite cadastral maps, and title histories.
              </p>
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
          <div className="pt-2 text-center text-xs text-on-surface-variant border-t border-outline-variant">
            <span>Already have an account? </span>
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>

          {/* Demo 1-Click Access */}
          <div className="pt-2 border-t border-outline-variant space-y-2">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block text-center">
              Or Explore Instantly with Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("OWNER")}
                disabled={demoLoading !== null}
                className="p-2.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary text-center transition-colors cursor-pointer"
              >
                👤 Demo Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("REVENUE_OFFICER")}
                disabled={demoLoading !== null}
                className="p-2.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary text-center transition-colors cursor-pointer"
              >
                🏛️ Demo Officer
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-on-surface-variant">
          <p>© 2026 LAND AI Platform (इंडी-भूमि) • Smart India Hackathon</p>
        </div>

      </div>
    </div>
  );
}
