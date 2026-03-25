'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function BehaviorEditorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/behavior");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching behavior profile:", error);
      } finally {
        setIsFetching(false);
      }
    }
    fetchProfile();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/user/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Behavior profile successfully updated!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating behavior profile:", error);
      alert("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) return <div className="p-8 text-center text-gray-500">Loading your AI behavior profile...</div>;

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 md:p-8">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Behavior Settings</h1>
          <p className="text-gray-500 mt-2">Fine-tune the parameters that dictate how your AI clone behaves in conversations.</p>
        </div>
      </header>

      <Card>
        <CardHeader className="bg-white border-b border-gray-100 pb-5">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Core Personality Directives
          </CardTitle>
          <CardDescription>
            Changes here apply immediately to all new incoming messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Profession / Current Role" 
                name="profession" 
                defaultValue={profile?.profession || "Software Engineer"} 
                required 
              />
              <Input 
                label="Languages Spoken" 
                name="languages" 
                defaultValue={profile?.languages || "English, Spanish"} 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Conversational Tone</label>
                <select name="tone" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={profile?.tone || "Professional"}>
                  <option value="Casual">Casual & Relaxed</option>
                  <option value="Formal">Formal & Polished</option>
                  <option value="Professional">Professional & Direct</option>
                  <option value="Friendly">Friendly & Enthusiastic</option>
                </select>
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Humor Level</label>
                <select name="humorLevel" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={profile?.humorLevel || "Moderate"}>
                  <option value="None">None (Serious)</option>
                  <option value="Light">Light (Occasional jokes)</option>
                  <option value="Moderate">Moderate (Witty)</option>
                  <option value="Frequent">Frequent (Very playful)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Response Length Preference</label>
                <select name="responseLength" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={profile?.responseLength || "Medium"}>
                  <option value="Short">Short & Concise</option>
                  <option value="Medium">Medium (Balanced)</option>
                  <option value="Detailed">Detailed & Thorough</option>
                </select>
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Emotional Sensitivity</label>
                <select name="emotionalSensitivity" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={profile?.emotionalSensitivity || "Medium"}>
                  <option value="Low">Low (Logical/Detached)</option>
                  <option value="Medium">Medium (Empathetic)</option>
                  <option value="High">High (Highly Supportive)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Disagreement Style</label>
                <select name="disagreementStyle" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={profile?.disagreementStyle || "Diplomatic"}>
                  <option value="Assertive">Assertive (Stands ground)</option>
                  <option value="Diplomatic">Diplomatic (Finds middle ground)</option>
                  <option value="Avoidant">Avoidant (Changes subject)</option>
                </select>
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Identity Transparency</label>
                <select name="identityTransparency" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={profile?.identityTransparency || "High"}>
                  <option value="High">High (Constantly reminds they are AI)</option>
                  <option value="Medium">Medium (Mentions when relevant)</option>
                  <option value="Low">Low (Only uses mandatory prefix)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Core Ambition in Life" 
                name="ambition" 
                defaultValue={profile?.ambition || "Building great products"} 
                required 
              />
              
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Marital / Relationship Status</label>
                <select name="maritalStatus" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" defaultValue={profile?.maritalStatus || "In a relationship"}>
                  <option value="Single">Single</option>
                  <option value="In a relationship">In a relationship</option>
                  <option value="Married">Married</option>
                  <option value="It's complicated">It&apos;s complicated</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
               <Button type="submit" disabled={isLoading} className="px-8">
                 {isLoading ? "Saving changes..." : "Save Configuration"}
               </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
      
    </div>
  );
}
