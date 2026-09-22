'use client';

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RightPanel } from "@/components/layout/RightPanel";
import { 
  User, 
  Cpu, 
  Trash2, 
  Download, 
  RefreshCcw, 
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Sparkles,
  Zap,
  ShieldCheck,
  Check,
  X,
  Info,
  Camera,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTogglingAi, setIsTogglingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "success" });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setIsAiEnabled(data.user?.aiEnabled ?? false);
          setUserName(data.user?.name || "");
          setUserEmail(data.user?.email || "");
          setUserAvatar(data.user?.profilePhoto || null);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    }
    loadUserData();
  }, []);

  const toggleAi = async () => {
    setIsTogglingAi(true);
    try {
      const res = await fetch("/api/ai/deploy", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsAiEnabled(data.aiEnabled);
      }
    } catch (err) {
      console.error("Error toggling AI:", err);
    } finally {
      setIsTogglingAi(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage({ text: "", type: "success" });
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email: userEmail, profilePhoto: userAvatar }),
      });
      if (res.ok) {
        setSaveMessage({ text: "Profile updated successfully", type: "success" });
        await updateSession({ name: userName, email: userEmail });
      } else {
        setSaveMessage({ text: "Failed to update profile", type: "error" });
      }
    } catch (err) {
      setSaveMessage({ text: "An unexpected error occurred", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage({ text: "", type: "success" }), 3000);
    }
  };

  const handleExportData = () => {
    window.location.href = "/api/user/export";
  };

  const handleResetTraining = async () => {
    if (resetConfirmText !== "RESET") return;
    setIsResetting(true);
    setResetError("");
    try {
      const res = await fetch("/api/user/reset", { method: "POST" });
      if (res.ok) {
        setShowResetModal(false);
        setSaveMessage({ text: "AI training reset complete", type: "success" });
      } else {
        const data = await res.json();
        setResetError(data.error || "Failed to reset training");
      }
    } catch (err) {
      setResetError("System error during reset");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        const { signOut } = await import("next-auth/react");
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete account");
        setIsDeleting(false);
      }
    } catch (err) {
      setDeleteError("System error during deletion");
      setIsDeleting(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("File size exceeds 2MB limit");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setAvatarError("Invalid file type (JPG, PNG, GIF only)");
      return;
    }
    setAvatarError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[var(--bg-primary)] font-sans">
      <div className="flex-1 overflow-y-auto w-full scrollbar-none">
        <div className="mx-auto max-w-[1200px] py-12 px-6 lg:px-10 pb-40">
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="ai" className="font-bold flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-300" />
                Settings
              </Badge>
            </div>
            <h1 className="text-[40px] md:text-[56px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-[1.02] mb-4">Account Settings</h1>
            <p className="text-[var(--text-secondary)] font-medium text-sm max-w-2xl leading-relaxed">
              Manage your digital footprint, profile identity, and AI representation parameters across the platform.
            </p>
          </motion.header>

          <div className="space-y-16">
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-8">
                 <User size={18} className="text-indigo-300" />
                 <h2 className="text-lg font-bold text-white tracking-tight">Profile Details</h2>
              </div>
              
              <Card className="p-8 md:p-10 bg-zinc-900/20 border-zinc-800/80">
                 <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-3xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shadow-card transition-all group-hover:border-[rgba(255,255,255,0.15)]">
                         {userAvatar ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-4xl font-bold text-zinc-100 uppercase">
                              {userName ? userName.charAt(0) : 'U'}
                           </span>
                         )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-glow hover:scale-105 active:scale-95 transition-all"
                      >
                         <Camera size={18} />
                      </button>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/gif"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                       <h3 className="text-base font-bold text-white">Profile Avatar</h3>
                       <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                          Custom avatars help people recognize your identity in the society directory.
                       </p>
                       <div className="flex items-center gap-4 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-9 px-4 border-zinc-800 font-bold text-xs"
                          >
                             Change Avatar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setUserAvatar(null)}
                            disabled={!userAvatar}
                            className="h-9 px-4 text-zinc-600 font-bold text-xs hover:text-red-400"
                          >
                             Remove
                          </Button>
                       </div>
                       {avatarError && <p className="text-[10px] font-bold text-red-500 uppercase mt-2 tracking-widest">{avatarError}</p>}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-3">
                       <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Display Name</label>
                       <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full h-14 bg-[var(--bg-secondary)] border border-white/10 rounded-2xl px-6 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] transition-all"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
                       <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full h-14 bg-[var(--bg-secondary)] border border-white/10 rounded-2xl px-6 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[rgba(99,102,241,0.60)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] transition-all"
                       />
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-8 border-t border-zinc-900">
                    <div className="flex-1">
                      <AnimatePresence>
                        {saveMessage.text && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                              "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest",
                              saveMessage.type === "success" ? "text-emerald-500" : "text-red-500"
                            )}
                          >
                            {saveMessage.type === "success" ? <Check size={14} /> : <X size={14} />}
                            {saveMessage.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="h-12 px-8 font-semibold shadow-glow border-0"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                 </div>
              </Card>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-8">
                 <Cpu size={18} className="text-indigo-300" />
                 <h2 className="text-lg font-bold text-white tracking-tight">AI Representation</h2>
              </div>
              
              <Card className="p-0 bg-zinc-900/20 border-zinc-800/80 overflow-hidden">
                 <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-800/50">
                    <div className="max-w-xl">
                       <h3 className="text-base font-bold text-white mb-2">Active Presence</h3>
                       <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                          When enabled, your AI twin will respond to messages while you&apos;re offline. Disabling this will pause all automated responses.
                       </p>
                    </div>
                    <div className="shrink-0">
                       <button
                          onClick={toggleAi}
                          disabled={isTogglingAi}
                          className={cn(
                            "relative h-10 w-20 rounded-full transition-all duration-300 ring-4 ring-offset-4 ring-offset-zinc-950",
                            isAiEnabled ? "bg-indigo-500 ring-indigo-500/10" : "bg-white/10 ring-white/5"
                          )}
                        >
                          <motion.div 
                            animate={{ x: isAiEnabled ? 40 : 4 }}
                            className="h-7 w-7 bg-white rounded-full shadow-lg" 
                          />
                        </button>
                    </div>
                 </div>

                 <div className="p-8 md:p-10">
                    <div className="flex items-start gap-4">
                      <div className="pt-0.5">
                        <input 
                          type="checkbox" 
                          id="discoverable" 
                          defaultChecked 
                          className="h-5 w-5 bg-[var(--bg-secondary)] border-2 border-white/10 text-indigo-500 focus:ring-[rgba(99,102,241,0.12)] rounded-lg cursor-pointer" 
                        />
                      </div>
                      <label htmlFor="discoverable" className="flex-1 cursor-pointer">
                        <p className="text-sm font-bold text-white mb-1">Make AI Twin Discoverable</p>
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                          Allow other users to find and interact with your digital representative in the global directory.
                        </p>
                      </label>
                    </div>
                 </div>
              </Card>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-3 mb-8">
                 <AlertTriangle size={18} className="text-red-500/70" />
                 <h2 className="text-lg font-bold text-white tracking-tight">Danger Zone</h2>
              </div>
              
              <div className="space-y-4">
                 <Card className="p-8 border-red-500/10 bg-red-500/5 hover:border-red-500/20 transition-all">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                       <div>
                          <h3 className="text-base font-bold text-white mb-1">Export Personal Data</h3>
                          <p className="text-sm text-zinc-500 font-medium">Download a complete audit of your profile and interaction history.</p>
                       </div>
                       <Button 
                         variant="outline" 
                         onClick={handleExportData}
                         className="h-11 px-8 border-zinc-800 font-bold text-xs"
                       >
                          <Download size={16} className="mr-2" />
                          Export Data
                       </Button>
                    </div>
                 </Card>
                 
                 <Card className="p-8 border-red-500/10 bg-red-500/5 hover:border-red-500/20 transition-all">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                       <div>
                          <h3 className="text-base font-bold text-white mb-1">Reset AI Training</h3>
                          <p className="text-sm text-zinc-500 font-medium">Permanently wipe all behavioral learning and reset your AI twin to defaults.</p>
                       </div>
                       <Button 
                         variant="outline"
                         onClick={() => { setShowResetModal(true); setResetConfirmText(""); setResetError(""); }}
                         className="h-11 px-8 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-xs"
                       >
                          <RefreshCcw size={16} className="mr-2" />
                          Reset Profile
                       </Button>
                    </div>
                 </Card>

                 <Card className="p-8 border-red-500/20 bg-red-500/10 hover:border-red-500/30 transition-all">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                       <div>
                          <h3 className="text-base font-bold text-white mb-1">Delete Account</h3>
                          <p className="text-sm text-zinc-600 font-medium">Permanently erase your identity, AI representation, and all associated data.</p>
                       </div>
                       <Button 
                          variant="danger"
                          onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setDeleteError(""); }}
                          className="h-11 px-8 font-bold shadow-xl shadow-red-600/10 border-0"
                       >
                          <Trash2 size={16} className="mr-2" />
                          Delete Account
                       </Button>
                    </div>
                 </Card>
              </div>
            </motion.section>

            {/* Mobile Account Details (Visible only on small screens) */}
            <motion.section className="block xl:hidden mt-12" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center gap-3 mb-8">
                 <ShieldCheck size={18} className="text-indigo-300" />
                 <h2 className="text-lg font-bold text-white tracking-tight">Account Details</h2>
              </div>
              <Card className="p-8 md:p-10 bg-zinc-900/20 border-zinc-800/80">
                 <div className="space-y-6">
                   <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                         <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Verified User</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold">ACTIVE</Badge>
                   </div>
                   
                   <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                         <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">AI Presence</span>
                      </div>
                      <Badge className={cn(
                        "border-none font-bold",
                        isAiEnabled ? "bg-indigo-500/10 text-indigo-300" : "bg-white/5 text-[var(--text-tertiary)]"
                      )}>
                        {isAiEnabled ? "ONLINE" : "OFFLINE"}
                      </Badge>
                   </div>
                   
                   <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 bg-amber-500 rounded-full" />
                         <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Last Login</span>
                      </div>
                      <span className="text-xs font-bold text-white">Today</span>
                   </div>
                 </div>
              </Card>
            </motion.section>
          </div>
        </div>
      </div>

      <RightPanel title="Account Details" className="bg-zinc-950 border-l border-zinc-900 hidden xl:block">
        <div className="space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-indigo-300" />
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Privacy & Security</h2>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">Manage how your identity is shared across the NeuroNexis society.</p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">Account Status</h3>
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Verified User</span>
               </div>
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold">ACTIVE</Badge>
            </div>
            
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">AI Presence</span>
               </div>
               <Badge className={cn(
                 "border-none font-bold",
                 isAiEnabled ? "bg-indigo-500/10 text-indigo-300" : "bg-white/5 text-[var(--text-tertiary)]"
               )}>
                 {isAiEnabled ? 'ENABLED' : 'PAUSED'}
               </Badge>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/15">
             <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-indigo-300" />
                <span className="text-[10px] font-semibold text-indigo-200 uppercase tracking-[0.08em]">Pro Tip</span>
             </div>
             <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold uppercase tracking-tighter">
                Enable Discovery to allow other members of the society to find and message your AI twin.
             </p>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="w-full h-12 text-red-500 hover:text-red-400 hover:bg-red-500/5 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 border border-dashed border-red-500/20"
          >
             <LogOut size={16} />
             Sign out of all sessions
          </Button>
        </div>
      </RightPanel>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-24 overflow-hidden">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowDeleteModal(false)}
               className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[32px] p-10 md:p-12 shadow-2xl overflow-hidden"
             >
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Trash2 size={120} />
               </div>
               
               <div className="relative z-10">
                 <div className="h-16 w-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 mb-8">
                    <ShieldAlert size={32} />
                 </div>
                 <h2 className="text-3xl font-bold text-white tracking-tight leading-tight mb-4">Delete your account?</h2>
                 <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                    This action is irreversible. All your profile data, AI training history, and society connections will be permanently erased from the network.
                 </p>

                 <div className="space-y-4 mb-10">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                      Type <span className="text-red-500">DELETE</span> to confirm erasure
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="AUTHORIZATION_CODE"
                      className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 text-sm font-bold text-red-500 focus:outline-none focus:border-red-600 transition-all"
                      autoFocus
                    />
                    {deleteError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{deleteError}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="ghost"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={isDeleting}
                      className="h-12 font-bold text-zinc-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || isDeleting}
                      className="h-12 font-bold border-0"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Erasure Identity
                    </Button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-24 overflow-hidden">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowResetModal(false)}
               className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[32px] p-10 md:p-12 shadow-2xl overflow-hidden"
             >
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <RefreshCcw size={120} />
               </div>
               
               <div className="relative z-10">
                 <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-8">
                    <Zap size={32} />
                 </div>
                 <h2 className="text-3xl font-bold text-white tracking-tight leading-tight mb-4">Reset AI Training?</h2>
                 <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                    This will wipe all behavioral learning and personality weights of your AI representative. Future responses will revert to system defaults.
                 </p>

                 <div className="space-y-4 mb-10">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                      Type <span className="text-amber-500">RESET</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={resetConfirmText}
                      onChange={(e) => setResetConfirmText(e.target.value)}
                      className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 text-sm font-bold text-amber-500 focus:outline-none focus:border-amber-600 transition-all"
                      autoFocus
                    />
                    {resetError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{resetError}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="ghost"
                      onClick={() => setShowResetModal(false)}
                      disabled={isResetting}
                      className="h-12 font-bold text-zinc-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleResetTraining}
                      disabled={resetConfirmText !== "RESET" || isResetting}
                      className="h-12 bg-amber-600 hover:bg-amber-500 text-white font-bold border-0"
                    >
                      {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Reset Profile
                    </Button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
