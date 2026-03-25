'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RightPanel } from "@/components/layout/RightPanel";

export default function ReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [alignmentScore, setAlignmentScore] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/user/review");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setStats(data.stats);
        setAlignmentScore(data.alignmentScore);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (messageId: string, feedbackType: string, correctedText?: string) => {
    try {
      const res = await fetch("/api/user/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, feedbackType, correctedText }),
      });

      if (res.ok) {
        // Remove from local list and refresh stats
        setReviews(prev => prev.filter(r => r.id !== messageId));
        fetchData(); // Refresh stats in right panel
        setEditingId(null);
      } else {
        alert("Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred.");
    }
  };

  const handleStartEdit = (review: any) => {
    setEditingId(review.id);
    setEditValue(review.content);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading pending reviews...</div>;

  return (
    <div className="flex h-[calc(100vh)] w-full overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-8 lg:pr-80 bg-bg-secondary">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review & Train AI</h1>
          <p className="text-gray-500 mt-2">
            Review recent messages sent by your AI. Approving, rejecting, or correcting them continually trains its behavior.
          </p>
        </header>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
             <div className="mx-auto h-20 w-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all caught up!</h3>
             <p className="text-gray-500 max-w-sm mx-auto">
               There are no pending messages to review. Your AI is performing optimally.
             </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const recipient = review.conversation?.participant1?.name || review.conversation?.participant2?.name || "Unknown";
              const time = new Date(review.timestamp).toLocaleString();
              
              return (
                <div key={review.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6">
                    
                    {/* Context Header */}
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                             {recipient.charAt(0)}
                          </div>
                          Message sent to <span className="text-gray-900">{recipient}</span>
                       </div>
                       <span className="text-xs text-gray-400">{time}</span>
                    </div>

                    {/* AI Output */}
                    <div className="pl-11 pr-4 mb-6">
                       <div className="flex items-center justify-between mb-1 mt-1">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                             Your AI Responded:
                          </p>
                          <Badge variant={review.confidenceLevel === 'high' ? 'success' : 'warning'} className="text-[10px]">
                             Confidence: {review.confidenceLevel || 'medium'}
                          </Badge>
                       </div>
                       
                       {editingId === review.id ? (
                          <div className="mt-2 space-y-3">
                             <textarea 
                               className="w-full min-h-[100px] p-3 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm text-gray-900 bg-purple-50"
                               value={editValue}
                               onChange={(e) => setEditValue(e.target.value)}
                             />
                             <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleAction(review.id, "correct", editValue)}>
                                   Save Correction
                                </Button>
                             </div>
                          </div>
                       ) : (
                          <div className="bg-purple-50 rounded-lg rounded-tl-sm p-4 text-sm text-gray-900 border border-purple-100">
                               <span className="font-semibold text-purple-600 mr-1">(AI Representation):</span>
                               <span>{review.content}</span>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  {editingId !== review.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                       <Button 
                         variant="outline" 
                         className="flex-1 bg-white border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                         onClick={() => handleAction(review.id, "approve")}
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 6 9 17l-5-5"/></svg>
                         Spot On (Approve)
                       </Button>
                       
                       <Button 
                         variant="outline" 
                         className="flex-1 bg-white text-gray-700 hover:bg-gray-100"
                         onClick={() => handleStartEdit(review)}
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                         Correct It
                       </Button>
                       
                       <Button 
                         variant="outline" 
                         className="flex-1 bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                         onClick={() => handleAction(review.id, "reject")}
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                         Way Off (Reject)
                       </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Right Panel for Review Page */}
      <RightPanel>
         <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Training Progress</h2>
            <p className="text-sm text-gray-500">How well your AI knows you</p>
         </div>
         
         {/* Alignment Score */}
         <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 text-center">
            <div className="relative inline-flex items-center justify-center mb-2">
               <svg className="h-24 w-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                  <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={226 - (226 * alignmentScore / 100)} className="text-purple-600" />
               </svg>
               <span className="absolute text-2xl font-bold text-gray-900">{alignmentScore}%</span>
            </div>
            <h3 className="font-bold text-gray-900">Behavior Alignment</h3>
            <p className="text-xs text-gray-500 mt-1">Based on previous feedback</p>
         </div>

         {/* Feedback History Stats */}
         <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Lifetime Breakdown</h3>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
               <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  Approved
               </div>
               <span className="font-bold text-green-700">{stats?.approved || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
               <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  Corrected
               </div>
               <span className="font-bold text-blue-700">{stats?.corrected || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
               <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  Rejected
               </div>
               <span className="font-bold text-red-600">{stats?.rejected || 0}</span>
            </div>
         </div>
      </RightPanel>
      
    </div>
  );
}
