'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

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
        return (
          <div className="h-10 w-10 shrink-0 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m19 12-7-7-7 7"/></svg>
          </div>
        );
      case 'activity':
        return (
          <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
        );
      case 'connection':
         return (
          <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m19 8 2 2 4-4"/></svg>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
        );
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Syncing notifications...</div>;

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 md:p-8">
      
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-2">Activity and alerts regarding your AI identity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={!notifications.some(n => !n.isRead)}>
           Mark all as read
        </Button>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
           <div className="p-12 text-center text-gray-400 italic">
             Your neural notification feed is empty.
           </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-5 flex gap-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-purple-50/20' : ''}`}
              >
                {getIcon(notification.type)}
                <div className="flex-1 min-w-0 pt-0.5">
                   <div className="flex items-center justify-between mb-1 gap-4">
                      <h3 className={`text-sm tracking-tight ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                        {notification.message.split('!')[0]}!
                      </h3>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(notification.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className={`text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                   </p>
                </div>
                {!notification.isRead && (
                  <div className="shrink-0 flex items-center pl-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
