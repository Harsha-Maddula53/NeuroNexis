'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RightPanel } from "@/components/layout/RightPanel";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { data: session } = useSession();
  const params = useParams();
  const conversationId = params.id as string;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?conversationId=${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.map((m: any) => ({
            id: m.id,
            sender: m.senderId === (session?.user as any)?.id ? 'me' : 'them',
            text: m.content,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAi: m.isAi,
            confidence: m.confidenceLevel
          })));
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && conversationId) {
      fetchMessages();
      // Polling for new messages (AI responses)
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim();
    setInputValue("");

    // Optimistic update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      sender: "me",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: false
    }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: text }),
      });

      if (!res.ok) {
        // Rollback or show error
        console.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          const current = data.find((c: any) => c.id === conversationId);
          if (current) setActiveConversation(current);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };
    if (session?.user) fetchConversations();
  }, [session, conversationId]);

  const recipient = activeConversation?.participant1Id === (session?.user as any)?.id 
    ? activeConversation?.participant2 
    : activeConversation?.participant1;

  return (
    <div className="flex h-[calc(100vh)] w-full overflow-hidden pb-0 bg-white">
      
      {/* Left Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-bg-tertiary shrink-0 overflow-y-auto hidden md:flex">
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">Chats</h2>
          <div className="mt-3 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
             const otherUser = conv.participant1Id === (session?.user as any)?.id ? conv.participant2 : conv.participant1;
             return (
              <Link 
                href={`/chat/${conv.id}`} 
                key={conv.id}
                className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-white transition-colors cursor-pointer ${conv.id === conversationId ? 'bg-white border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'}`}
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
                    Latest interaction...
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pr-80">
        
        {/* Chat Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
             <div className="md:hidden">
               <Button variant="ghost" size="sm" className="p-2 -ml-2 mr-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               </Button>
             </div>
             <div>
               <h2 className="font-bold text-gray-900 leading-tight">{recipient?.name || "Select a Chat"}</h2>
               {recipient && (
                 <p className={`text-xs ${recipient.onlineStatus ? 'text-green-600' : 'text-gray-400'} font-medium flex items-center gap-1`}>
                   <span className={`h-1.5 w-1.5 rounded-full ${recipient.onlineStatus ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                   {recipient.onlineStatus ? 'Online' : 'Offline'}
                 </p>
               )}
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">View Profile</Button>
            <Button variant="outline" size="sm">Turn off AI</Button>
          </div>
        </header>

        {/* Message Thread */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-bg-secondary">
          <div className="text-center my-4">
            <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              {loading ? "Loading..." : "Conversation Started"}
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                
                {/* Avatar for 'them' */}
                {msg.sender === 'them' && (
                  <div className="hidden sm:flex h-8 w-8 rounded-full bg-gray-200 items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                    {recipient?.name?.charAt(0) || '?'}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div className={`px-4 py-2.5 rounded-2xl relative ${
                    msg.sender === 'me' 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : msg.isAi 
                        ? 'bg-purple-50 text-gray-900 border border-purple-200 rounded-bl-sm' 
                        : 'bg-white border text-gray-900 border-gray-200 rounded-bl-sm shadow-sm'
                  }`}>
                    
                    {msg.isAi && (
                      <div className="flex items-center justify-between mb-1 opacity-70">
                         <Badge variant="purple" className="text-[9px] px-1 h-3 leading-none">AI Response</Badge>
                         <span className="text-[10px] text-purple-700 font-medium">Confidence: {msg.confidence}</span>
                      </div>
                    )}
                    
                    {msg.isAi ? (
                      <div>
                        {/* Enforce AI formatting visually */}
                        <span className="text-purple-600 font-semibold mr-1">{msg.text.split(') ')[0]})</span>
                        <span>{msg.text.split(') ')[1]}</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  
                  <div className={`text-[10px] text-gray-400 px-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Footer */}
        <footer className="p-4 bg-white border-t border-gray-200 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 rounded-full py-3 px-5 text-sm transition-colors"
              />
            </div>
            <Button 
              type="submit" 
              className="rounded-full h-11 w-11 p-0 shrink-0 shadow-sm"
              disabled={!inputValue.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="-ml-0.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </Button>
          </form>
        </footer>
      </div>

      {/* Dynamic Right Panel for Chat Page */}
      <RightPanel>
        <div className="flex flex-col items-center text-center mt-6 mb-8">
           <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-3xl">
                 {recipient?.name?.charAt(0)}
              </div>
              {recipient?.onlineStatus && <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-500 border-[3px] border-white"></div>}
           </div>
           <h2 className="text-xl font-bold text-gray-900 mb-1">{recipient?.name || "User"}</h2>
           <p className="text-sm text-gray-500">{recipient?.behaviorProfile?.profession || "Member"}</p>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">AI Representation Status</h3>
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-gray-600">AI Active</span>
               <Badge variant={recipient?.aiEnabled ? "success" : "secondary"}>
                 {recipient?.aiEnabled ? "Yes" : "No"}
               </Badge>
             </div>
             <div className="flex items-center justify-between xl:flex-col xl:items-start lg:flex-row lg:items-center">
               <span className="text-sm text-gray-600">Last Interaction</span>
               <span className="text-sm font-medium text-gray-900 mt-1 lg:mt-0 xl:mt-1">
                 {activeConversation ? new Date(activeConversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "None"}
               </span>
             </div>
           </div>

           {recipient?.behaviorProfile && (
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Behavior Profile (Public)</h3>
               <div className="space-y-3">
                 <div>
                   <span className="text-xs text-gray-500 block">Tone</span>
                   <span className="text-sm font-medium text-gray-900">{recipient.behaviorProfile.tone}</span>
                 </div>
                 <div>
                   <span className="text-xs text-gray-500 block">Humor Level</span>
                   <span className="text-sm font-medium text-gray-900">{recipient.behaviorProfile.humorLevel}</span>
                 </div>
                  <div>
                   <span className="text-xs text-gray-500 block">Transparency</span>
                   <span className="text-sm font-medium text-gray-900">{recipient.behaviorProfile.identityTransparency}</span>
                 </div>
               </div>
             </div>
           )}
           
        </div>
      </RightPanel>
    </div>
  );
}
