'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export default function ConnectionsPage() {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setIncoming(data.incoming);
        setOutgoing(data.outgoing);
      }
    } catch (err) {
      console.error("Fetch connections error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleUpdateStatus = async (connectionId: string, status: string) => {
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      });

      if (res.ok) {
        fetchConnections();
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading connections...</div>;

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-4 md:p-8">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Connections</h1>
        <p className="text-gray-500 mt-2">Approve incoming requests or view the status of your outgoing requests.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Incoming Requests */}
        <div>
           <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Incoming Requests</h2>
              {incoming.length > 0 && (
                <Badge variant="purple">{incoming.length}</Badge>
              )}
           </div>

           {incoming.length === 0 ? (
             <div className="bg-white rounded-xl border border-gray-200 border-dashed p-8 text-center text-gray-500">
               No pending incoming requests.
             </div>
           ) : (
             <div className="space-y-4">
               {incoming.map(req => (
                 <Card key={req.id}>
                   <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                         {req.requester.name.charAt(0)}
                       </div>
                       <div>
                         <h3 className="font-bold text-gray-900 leading-tight">{req.requester.name}</h3>
                         <p className="text-xs text-gray-500 mt-0.5">
                           Sent {new Date(req.createdAt).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                       <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(req.id, "declined")}>
                         Decline
                       </Button>
                       <Button size="sm" className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700" onClick={() => handleUpdateStatus(req.id, "accepted")}>
                         Accept
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
        </div>

        {/* Outgoing Requests */}
        <div>
           <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sent Requests</h2>
              {outgoing.length > 0 && (
                <Badge variant="secondary">{outgoing.length}</Badge>
              )}
           </div>

           {outgoing.length === 0 ? (
             <div className="bg-white rounded-xl border border-gray-200 border-dashed p-8 text-center text-gray-500">
               No pending outgoing requests.
             </div>
           ) : (
             <div className="space-y-4">
               {outgoing.map(req => (
                 <Card key={req.id}>
                   <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
                         {req.receiver.name.charAt(0)}
                       </div>
                       <div>
                         <h3 className="font-bold text-gray-900 leading-tight">{req.receiver.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                           <p className="text-xs text-gray-500">Sent {new Date(req.createdAt).toLocaleDateString()}</p>
                           <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded leading-none uppercase tracking-wide font-bold border border-purple-100 italic">
                             {req.status}
                           </span>
                         </div>
                       </div>
                     </div>
                     <Button variant="ghost" size="sm" className="w-full sm:w-auto text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(req.id, "cancelled")}>
                       Cancel Request
                     </Button>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
        </div>
        
      </div>
    </div>
  );
}
