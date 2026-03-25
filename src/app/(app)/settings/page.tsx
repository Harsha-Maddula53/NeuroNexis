'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isTogglingAi, setIsTogglingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Load real user data on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setIsAiEnabled(data.user?.aiEnabled ?? false);
          setUserName(data.user?.name || "");
          setUserEmail(data.user?.email || "");
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
    setSaveMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email: userEmail }),
      });
      if (res.ok) {
        setSaveMessage("Profile updated successfully!");
        // Force session refresh so sidebar and all session consumers update immediately
        await updateSession({ name: userName, email: userEmail });
      } else {
        setSaveMessage("Failed to update profile.");
      }
    } catch (err) {
      setSaveMessage("Error saving profile.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 md:p-8">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account preferences, privacy, and data.</p>
      </header>

      <div className="space-y-8">
        
        {/* Profile Settings */}
        <Card>
          <CardHeader className="bg-white border-b border-gray-100 pb-5">
            <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
            <CardDescription>Update your personal details. This information is kept private.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6 mb-8">
               <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl shrink-0">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
               </div>
               <div>
                  <div className="flex gap-2">
                     <Button variant="outline" size="sm">Upload new avatar</Button>
                     <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">Remove</Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
               </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Full Name</label>
                   <input 
                     type="text" 
                     value={userName} 
                     onChange={(e) => setUserName(e.target.value)}
                     className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Email Address</label>
                   <input 
                     type="email" 
                     value={userEmail}
                     onChange={(e) => setUserEmail(e.target.value)}
                     className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                   />
                </div>
              </div>
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {saveMessage}
                </p>
              )}
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Deployment Settings */}
        <Card>
          <CardHeader className="bg-white border-b border-gray-100 pb-5">
            <CardTitle className="text-xl font-bold text-purple-700">AI Deployment Control</CardTitle>
            <CardDescription>Master controls for your active AI representation.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
               <div>
                 <h3 className="font-bold text-gray-900 mb-1">Global AI Status</h3>
                 <p className="text-sm text-gray-600 max-w-lg">
                   When disabled, your AI will immediately stop responding to incoming messages. Your connections will see you as offline and away.
                 </p>
               </div>
               <button 
                 onClick={toggleAi}
                 disabled={isTogglingAi}
                 className={`relative inline-flex h-8 w-16 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isAiEnabled ? 'bg-purple-600' : 'bg-gray-300'} ${isTogglingAi ? 'opacity-50' : ''}`}
               >
                 <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAiEnabled ? 'translate-x-9' : 'translate-x-1'}`} />
               </button>
            </div>
            
            <div className="pt-2">
               <h3 className="font-medium text-gray-900 mb-3">AI Discovery</h3>
               <div className="flex items-start space-x-2">
                 <input type="checkbox" id="discoverable" defaultChecked className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                 <label htmlFor="discoverable" className="text-sm text-gray-700 leading-tight">
                   Allow my AI to be discoverable in the Society directory. Turning this off restricts chat to only your accepted connections.
                 </label>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 shadow-sm">
          <CardHeader className="bg-red-50 border-b border-red-100 pb-5 rounded-t-xl">
            <CardTitle className="text-xl font-bold text-red-700">Danger Zone</CardTitle>
            <CardDescription className="text-red-600">Irreversible destructive actions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
             
             <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-4">
                <div>
                   <h3 className="font-bold text-gray-900 mb-1">Export My Data</h3>
                   <p className="text-sm text-gray-600">Download a JSON file containing all your conversations and behavior profiles.</p>
                </div>
                <Button variant="outline" size="sm" className="opacity-50 cursor-not-allowed" disabled>Coming Soon</Button>
             </div>

             <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-4">
                <div>
                   <h3 className="font-bold text-gray-900 mb-1">Reset AI Training</h3>
                   <p className="text-sm text-gray-600">Delete all feedback and interaction history. Behavior profile reverts to initial setup state.</p>
                </div>
                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 opacity-50 cursor-not-allowed" disabled>Coming Soon</Button>
             </div>

             <div className="flex items-center justify-between py-2">
                <div>
                   <h3 className="font-bold text-gray-900 mb-1">Delete Account</h3>
                   <p className="text-sm text-gray-600 max-w-sm">Permanently remove your personal account, your AI identity, and all conversation data from NeuroNexis.</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 opacity-50 cursor-not-allowed" disabled>Coming Soon</Button>
             </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
