'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export default function TrainingChatPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAiEnabled = (session?.user as any)?.aiEnabled;
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load existing training conversation history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/ai/train");
        if (res.ok) {
          const data = await res.json();
          setConversationId(data.conversationId);
          if (data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                timestamp: new Date(m.timestamp),
              }))
            );
          } else {
            // First time — show welcome message (not persisted)
            setMessages([
              {
                id: "welcome",
                sender: "ai",
                text: "(AI Representation of You) Hello! I'm your AI identity. This is a private training session — our conversation is saved so I can learn from it over time. Send me messages to see how I respond!",
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error loading training history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    const userText = inputValue.trim();

    // Add user message to UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Send to API (which saves to DB and returns AI response)
    const fetchAIResponse = async () => {
      try {
        const res = await fetch("/api/ai/train", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, userMessage: userText }),
        });

        if (res.ok) {
          const data = await res.json();
          const aiMsg: Message = {
            id: data.id || Date.now().toString(),
            sender: 'ai',
            text: data.content,
            timestamp: new Date(data.timestamp || Date.now()),
          };
          setMessages(prev => [...prev, aiMsg]);
        } else {
          const errorData = await res.json();
          const errorMsg: Message = {
            id: Date.now().toString(),
            sender: 'ai',
            text: `(System) Error: ${errorData.error || "Failed to get AI response"}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMsg]);
        }
      } catch (err) {
        console.error("Error fetching AI response:", err);
      } finally {
        setIsTyping(false);
      }
    };

    fetchAIResponse();
  };

  const handleDeploy = async () => {
    try {
      const res = await fetch("/api/ai/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      if (res.ok) {
        router.push("/society");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-tertiary">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading training history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-tertiary">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/setup/deploy" className="text-gray-500 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold border border-purple-200">
                You
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 leading-tight">Your AI Identity</h2>
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-4">Training Mode</Badge>
                <span className="text-xs text-gray-500">Messages are saved</span>
              </div>
            </div>
          </div>
        </div>
        
        {!isAiEnabled ? (
          <Button onClick={handleDeploy} size="sm" className="shadow-sm">
            Deploy to Society
          </Button>
        ) : (
          <Button onClick={() => router.push("/society")} variant="outline" size="sm" className="shadow-sm">
            View Society
          </Button>
        )}
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center my-6">
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
            Training Session
          </span>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              
              {/* Avatar Indicator */}
              {msg.sender === 'ai' && (
                <div className="hidden sm:flex h-8 w-8 rounded-full bg-purple-100 items-center justify-center text-purple-600 text-xs font-bold shrink-0 mb-1">
                  AI
                </div>
              )}

              {/* Message Bubble */}
              <div className="flex flex-col gap-1">
                <div 
                  className={`px-4 py-2.5 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.sender === 'ai' ? (
                    <div>
                      {msg.text.includes(') ') ? (
                        <>
                          <span className="text-purple-600 font-semibold mr-1">{msg.text.split(') ')[0]})</span>
                          <span>{msg.text.split(') ').slice(1).join(') ')}</span>
                        </>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className={`text-[10px] text-gray-400 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex justify-start">
             <div className="flex items-end gap-2">
               <div className="hidden sm:flex h-8 w-8 rounded-full bg-purple-100 items-center justify-center text-purple-600 text-xs font-bold shrink-0 mb-1">
                 AI
               </div>
               <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 h-[44px]">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-gray-200">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Test a conversation with your AI..."
              className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 rounded-full py-3 pl-5 pr-12 text-sm transition-colors"
            />
          </div>
          <Button 
            type="submit" 
            className="rounded-full h-11 w-11 p-0 shrink-0 shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            disabled={!inputValue.trim() || isTyping || !conversationId}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="-ml-0.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Training messages are saved to help your AI learn over time.
        </p>
      </footer>
    </div>
  );
}
