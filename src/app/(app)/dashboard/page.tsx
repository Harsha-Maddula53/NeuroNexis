'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const isAiEnabled = data?.user?.aiEnabled ?? false;

  const toggleAi = async () => {
    try {
      const res = await fetch("/api/ai/deploy", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error toggling AI:", error);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading your neural dashboard...</div>;

  const count1 = data?.user?._count?.conversations1 || 0;
  const count2 = data?.user?._count?.conversations2 || 0;
  const totalConversations = count1 + count2;

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-8">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your AI representation and view recent activity.</p>
        </div>
        
        {/* Master AI Toggle */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 shrink-0">
           <div className="flex flex-col">
             <span className="font-bold text-gray-900 text-sm">Master AI Switch</span>
             <span className="text-xs text-gray-500">{isAiEnabled ? 'Active (Responding)' : 'Paused (Manual only)'}</span>
           </div>
           
           <button 
             onClick={toggleAi}
             className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isAiEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
           >
             <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isAiEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
           </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">AI Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{data?.user?._count?.messages || 0}</div>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium">
               Lifetime neural outputs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalConversations}</div>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1 font-medium">
               Networked connections
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 shadow-sm bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 uppercase tracking-wider">AI Personality</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-xl font-bold text-purple-900">{data?.user?.behaviorProfile?.tone || "Standard"}</div>
             <p className="text-sm text-purple-600 mt-2 flex items-center gap-1 font-medium">
               {data?.user?.behaviorProfile?.humorLevel || "Balanced"} humor level
            </p>
            <Link href="/setup/behavior">
              <Button size="sm" className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Refine Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
           <Card className="h-full">
             <CardHeader className="border-b border-gray-100 pb-4">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent AI Activity</CardTitle>
               </div>
               <CardDescription>The latest interactions handled by your AI identity.</CardDescription>
             </CardHeader>
             <CardContent className="pt-0">
               <div className="divide-y divide-gray-100">
                 
                 {(!data?.recentActivity || data.recentActivity.length === 0) && (
                   <div className="py-12 text-center text-gray-400 italic">No recent AI activity recorded. Your AI is standing by.</div>
                 )}

                 {data?.recentActivity?.map((activity: any) => (
                   <div key={activity.id} className="py-4 flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-1">
                            <p className="text-sm font-bold text-gray-900">
                              Responded to {activity.conversation?.participant1?.name === data.user.name ? activity.conversation?.participant2?.name : activity.conversation?.participant1?.name}
                            </p>
                            <span className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2">
                             <p className="text-sm text-gray-600 line-clamp-2 italic">
                               <span className="font-semibold text-purple-600 not-italic">(AI Representation):</span> &quot;{activity.content}&quot;
                             </p>
                         </div>
                         <div className="flex gap-2 mt-3">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-purple-200 text-purple-700 bg-purple-50">Confidence: {Math.round((activity.confidenceLevel || 0.95) * 100)}%</Badge>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/training" className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-500 group-hover:text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Train My AI</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m9 18 6-6-6-6"/></svg>
              </Link>

              <Link href="/setup/behavior" className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-500 group-hover:text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Edit Behavior</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
              
              <Link href="/setup/identity" className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-500 group-hover:text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Manage Identity</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-none shadow-lg">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-2">Neural Link Active</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Your AI clonal identity learns from your real interactions. The more you chat, the more accurate its representation becomes.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
