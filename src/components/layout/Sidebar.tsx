'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Users, 
  MessageSquare, 
  Cpu, 
  LayoutDashboard, 
  FileText, 
  Network, 
  Zap, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  { name: "Discover", href: "/society", icon: Users },
  { name: "Chats", href: "/chat", icon: MessageSquare },
  { name: "AI Training", href: "/training", icon: Cpu },
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Feedback", href: "/review", icon: FileText },
  { name: "Friends", href: "/connections", icon: Network },
  { name: "AI Settings", href: "/behavior", icon: Zap },
  { name: "Activity", href: "/notifications", icon: Bell },
  { name: "Account", href: "/settings", icon: Settings }
];

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userName = session?.user?.name || "User";
  const aiEnabled = session?.user?.aiEnabled ?? false;

  return (
    <aside className="relative flex h-full border-r border-white/10 bg-[var(--sidebar-bg)]">
      <motion.div
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} 
        className="h-full flex flex-col z-30"
      >
        {/* Brand Logo */}
        <div className={cn(
          "h-16 flex items-center px-6 mb-4 relative",
          isCollapsed ? "justify-center px-0" : "justify-between"
        )}>
          <Logo
            href="/dashboard"
            size="sm"
            showText={!isCollapsed}
            markClassName="group-hover:scale-[1.06] transition-transform"
          />
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1.5 rounded-md hover:bg-white/5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors",
              isCollapsed ? "hidden" : "block"
            )}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onMobileClose?.()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative",
                  isActive 
                    ? 'bg-[rgba(255,255,255,0.04)] text-white border border-[rgba(255,255,255,0.05)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text-primary)] border border-transparent',
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <Icon size={isActive ? 20 : 18} className={cn("shrink-0 transition-transform duration-300", isActive ? "text-indigo-400" : "group-hover:text-white")} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-2 h-1.5 w-1.5 rounded-full bg-indigo-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/10 bg-[rgba(10,10,10,0.6)] backdrop-blur-md">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group border border-transparent hover:border-white/10",
            isCollapsed ? "justify-center" : ""
          )}>
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white font-bold border border-white/10 overflow-hidden">
                {session?.user?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={session.user.image} 
                    alt={userName} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-[var(--text-tertiary)]" />
                )}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--sidebar-bg)]",
                aiEnabled ? "bg-emerald-500" : "bg-white/25"
              )}></div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{userName}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] truncate flex items-center gap-1 mt-0.5">
                   {aiEnabled ? 'AI Active' : 'AI Paused'}
                </p>
              </div>
            )}
            
            {!isCollapsed && (
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-red-300 transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          
          {isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(false)}
              className="mt-2 w-full flex justify-center p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors hover:bg-white/5 rounded-lg"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </aside>
  );
}
