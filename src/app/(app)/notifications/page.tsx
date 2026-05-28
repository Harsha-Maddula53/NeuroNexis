'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  UserPlus, 
  AlertCircle,
  Info,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Zap size={18} className="text-indigo-300" />;
      case 'activity':
        return <MessageSquare size={18} className="text-blue-500" />;
      case 'connection':
        return <UserPlus size={18} className="text-emerald-500" />;
      default:
        return <Info size={18} className="text-zinc-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] flex flex-col items-center justify-center font-sans">
         <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
         <p className="text-[var(--text-tertiary)] font-medium uppercase tracking-[0.08em] text-[10px]">Syncing notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full bg-[var(--bg-primary)] font-sans">
      <div className="mx-auto max-w-[1200px] p-6 md:p-10 pb-32">
        
        <header className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-white/10 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <Badge variant="ai" className="font-bold">
                 <Sparkles size={12} className="mr-2" />
                 Updates
               </Badge>
            </div>
            <h1 className="text-[44px] md:text-[56px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[1.02]">Activity & Alerts</h1>
            <p className="text-[var(--text-secondary)] mt-4 text-sm font-medium max-w-xl leading-relaxed">
              Stay informed about your AI&apos;s interactions, system updates, and new connections in NeuroNexis.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={markAllRead} 
            disabled={!notifications.some(n => !n.isRead)}
            className="h-12 px-6 font-semibold flex items-center gap-2"
          >
             <CheckCheck size={16} />
             Mark all as read
          </Button>
        </header>

        <div className="space-y-6">
          {notifications.length === 0 ? (
              <Card className="py-24 text-center bg-zinc-900/20 border-zinc-800/50 flex flex-col items-center">
                <div className="h-20 w-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-700 mb-8 overflow-hidden group">
                   <ShieldCheck size={40} className="group-hover:scale-110 transition-transform text-emerald-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">Clean Slate</h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
                  You&apos;re all caught up. There are no pending notifications for your account.
                </p>
              </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {notifications.map(notification => (
                  <motion.div 
                    key={notification.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <Card 
                      className={cn(
                        "p-6 flex gap-6 transition-all group relative overflow-hidden",
                        !notification.isRead 
                          ? "bg-[rgba(255,255,255,0.05)] border-indigo-500/20 shadow-[0_0_0_1px_rgba(99,102,241,0.10)]" 
                          : "bg-[rgba(255,255,255,0.03)] border-white/10 shadow-none grayscale hover:grayscale-0"
                      )}
                    >
                      {!notification.isRead && (
                         <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      )}

                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border",
                        notification.type === 'system' ? "border-indigo-500/20 bg-indigo-500/5" :
                        notification.type === 'activity' ? "border-blue-500/20 bg-blue-500/5" :
                        "border-emerald-500/20 bg-emerald-500/5"
                      )}>
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                !notification.isRead ? "text-indigo-200" : "text-zinc-600"
                              )}>
                                {notification.type}
                              </span>
                              <div className="h-1 w-1 bg-zinc-800 rounded-full" />
                              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={10} />
                                {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                              </span>
                            </div>
                         </div>
                         <h3 className={cn(
                           "text-base tracking-tight mb-1",
                           !notification.isRead ? "font-bold text-white font-medium" : "font-semibold text-zinc-400"
                         )}>
                           {notification.message.split('!')[0]}
                         </h3>
                         <p className={cn(
                           "text-sm leading-relaxed",
                           !notification.isRead ? "text-zinc-400" : "text-zinc-600"
                         )}>
                            {notification.message}
                         </p>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="shrink-0 flex items-center">
                          <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse shadow-glow" />
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
