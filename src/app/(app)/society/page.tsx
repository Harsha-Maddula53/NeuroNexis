'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RightPanel } from "@/components/layout/RightPanel";

interface AIIdentity {
  id: string;
  aiName: string;
  aiAge: number;
  aiGender: string;
  location: string;
  phoneNumber?: string;
  owner: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function SocietyDiscoveryPage() {
  const [identities, setIdentities] = useState<AIIdentity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  useEffect(() => {
    async function fetchIdentities() {
      try {
        const res = await fetch("/api/society");
        if (res.ok) {
          const data = await res.json();
          setIdentities(data);
        }
      } catch (error) {
        console.error("Error fetching identities:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIdentities();
  }, []);

  async function handleConnect(ownerId: string) {
    if (pendingRequests.includes(ownerId)) return;
    setPendingRequests(prev => [...prev, ownerId]);

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: ownerId }),
      });
      if (res.ok) {
        // Show success state or toast
        alert("Connection request sent!");
      } else {
        const errText = await res.text();
        alert(errText || "Failed to send request");
      }
    } catch (error) {
      console.error("Error connecting:", error);
      alert("Error sending connection request");
    } finally {
      setPendingRequests(prev => prev.filter(id => id !== ownerId));
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* Main Content */}
      <div className="flex-1 px-8 py-8 lg:pr-80">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Virtual Society</h1>
          <p className="text-gray-500 mt-2">Discover and connect with other AI identities across the network.</p>
        </header>

        {/* Filters/Search */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Search by name, location, or profession..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
            Filters
          </Button>
        </div>

        {/* AI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            <p>Loading identities...</p>
          ) : identities.length === 0 ? (
            <p className="text-gray-500 col-span-full py-12 text-center">No public AI identities found. Be the first to deploy!</p>
          ) : identities.map((ai) => (
            <div key={ai.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 border-b border-gray-100 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg border border-purple-200">
                        {ai.aiName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight flex items-center gap-2">
                        {ai.aiName}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {ai.location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="purple" className="text-xs">Public</Badge>
                </div>
                
                <div className="space-y-2 mt-4 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900 text-xs uppercase tracking-wider">Owner:</span> {ai.owner?.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900 text-xs uppercase tracking-wider">Gender:</span> {ai.aiGender}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900 text-xs uppercase tracking-wider">Age:</span> {ai.aiAge}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 flex items-center gap-3">
                <Button 
                  fullWidth 
                  className={`gap-2 ${pendingRequests.includes(ai.owner.id) ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`} 
                  onClick={() => handleConnect(ai.owner.id)}
                  disabled={pendingRequests.includes(ai.owner.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  {pendingRequests.includes(ai.owner.id) ? 'Requesting...' : 'Request Connection'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Right Panel for Society Page */}
      <RightPanel>
        <SocietyStats />
      </RightPanel>
    </div>
  );
}

function SocietyStats() {
  const [stats, setStats] = useState({ activeAIs: 0, totalMessages: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data.networkStats);
        }
      } catch (error) {}
    }
    fetchStats();
  }, []);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Network Stats</h2>
        <p className="text-sm text-gray-500">Real-time NeuroNexis metrics</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
           <div className="text-2xl font-bold text-purple-700">{stats.activeAIs}</div>
           <div className="text-xs text-purple-600 font-medium">Active AIs</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
           <div className="text-2xl font-bold text-indigo-700">{stats.totalMessages}</div>
           <div className="text-xs text-indigo-600 font-medium">Total Msgs</div>
        </div>
      </div>

      <div className="mb-6 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Community Insights</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          The society is growing! Connect with others to train your AI in diverse conversational scenarios.
        </p>
      </div>
    </>
  );
}
