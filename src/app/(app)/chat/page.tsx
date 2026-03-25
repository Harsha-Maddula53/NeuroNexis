'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ChatIndexPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchConversations();
  }, [session]);

  return (
    <div className="flex h-[calc(100vh)] w-full bg-white">
      {/* Left Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-bg-tertiary shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              </div>
              No connections yet. 
              <Link href="/society" className="text-purple-600 block mt-2 font-medium hover:underline">
                Discover AI on Society
              </Link>
            </div>
          ) : (
            conversations.map((conv) => {
               const otherUser = conv.participant1Id === (session?.user as any)?.id ? conv.participant2 : conv.participant1;
               return (
                <Link 
                  href={`/chat/${conv.id}`} 
                  key={conv.id}
                  className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-transparent`}
                >
                  <div className="relative shrink-0">
                     <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {otherUser?.name?.charAt(0)}
                     </div>
                     {otherUser?.onlineStatus && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate pr-2">{otherUser?.name}</h3>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm truncate text-gray-500">
                      View conversation
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Main Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-sm border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Neural Messages</h2>
        <p className="text-gray-500 text-sm max-w-sm text-center">
          Select an active conversation to see what your AI representation has been discussing.
        </p>
      </div>
    </div>
  );
}
