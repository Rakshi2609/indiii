"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  RefreshCw, 
  Info, 
  Server,
  ExternalLink 
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/govt/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/govt/keys/generate", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.api_key) {
          setKeys((prev) => [...prev, data.api_key]);
        }
      }
    } catch (err) {
      console.error("Failed to generate key:", err);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <div className="flex-1 bg-background min-h-screen flex flex-col">
      <Topbar title="API Integration Settings" subtitle="Generate and manage government open API keys" />
      
      <main className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-6">
        
        {/* Info Card */}
        <Card className="p-6 border border-primary/20 bg-primary/5 flex gap-4 items-start">
          <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div class="space-y-1">
            <h3 className="font-bold text-sm text-primary">About Government Open API Keys</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              These API keys allow external authorized systems (such as financial institutions, land acquisition cells, and judiciary portals) to integrate with and query verified digital land records using specific verification codes.
            </p>
          </div>
        </Card>

        {/* Key Generator Card */}
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> Active API Keys
              </h2>
              <p className="text-xs text-on-surface-variant">Manage credentials for external client integrations</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchKeys} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" onClick={generateKey} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Generate Key
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : keys.length === 0 ? (
            <div className="border border-dashed border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              No API keys generated yet. Click "Generate Key" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key, i) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-4 rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold select-all text-on-surface truncate">
                        {key}
                      </span>
                      {key.startsWith("govt_sih") && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Default</Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      Active Integration Key • SHA-256 Verified
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(key)}
                    className="shrink-0 text-primary hover:bg-primary-container/20"
                  >
                    {copiedKey === key ? (
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy</span>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Integration Instructions */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" /> How to Integrate
          </h2>
          
          <div className="space-y-3 text-xs text-on-surface-variant">
            <p>External portals can perform GET queries to the validation route with the following structure:</p>
            <div className="bg-slate-900 text-emerald-400 font-mono p-4 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
              curl -X GET "http://localhost:8000/api/govt/verify?code=1&api_key=YOUR_API_KEY"
            </div>
            
            <div className="border-t border-outline-variant pt-4 space-y-2">
              <h4 className="font-semibold text-on-surface">Supported Parameters:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><code className="bg-surface-container-high px-1 py-0.5 rounded font-mono">api_key</code> (Query parameter) or <code className="bg-surface-container-high px-1 py-0.5 rounded font-mono">X-API-Key</code> (Header): Valid API key.</li>
                <li><code className="bg-surface-container-high px-1 py-0.5 rounded font-mono">code</code> (Query parameter): Document ID, Record ID, or Land Survey Number to query.</li>
              </ul>
            </div>

            <div className="pt-2">
              <a 
                href="http://localhost:10000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                Open External Client Simulator (localhost:10000) <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
