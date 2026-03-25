'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function BehaviorSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/ai/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/setup/deploy");
      } else {
        console.error("Failed to save behavior");
      }
    } catch (err) {
      console.error("Error saving behavior:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-secondary p-4 py-12">
      <div className="w-full max-w-3xl">
        
        {/* Progress Bar */}
        <div className="mb-8 flex justify-center items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">1</div>
            <span className="text-xs font-semibold text-purple-700">Identity</span>
          </div>
          <div className="h-1 w-16 bg-purple-600"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">2</div>
            <span className="text-xs font-semibold text-purple-700">Behavior</span>
          </div>
          <div className="h-1 w-16 bg-gray-200"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">3</div>
            <span className="text-xs font-medium text-gray-500">Deploy</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-3xl font-bold">Train Your AI&apos;s Behavior</CardTitle>
            <CardDescription className="text-base mt-2">
              Define how your AI responds. This ensures they sound and act exactly like you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Profession / Current Role" 
                  name="profession" 
                  placeholder="e.g. Software Engineer, Student" 
                  required 
                />
                <Input 
                  label="Languages Spoken" 
                  name="languages" 
                  placeholder="e.g. English, Spanish (Fluent)" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Conversational Tone</label>
                  <select name="tone" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select tone...</option>
                    <option value="Casual">Casual & Relaxed</option>
                    <option value="Formal">Formal & Polished</option>
                    <option value="Professional">Professional & Direct</option>
                    <option value="Friendly">Friendly & Enthusiastic</option>
                  </select>
                </div>

                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Humor Level</label>
                  <select name="humorLevel" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select humor level...</option>
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
                  <select name="responseLength" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select length...</option>
                    <option value="Short">Short & Concise</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="Detailed">Detailed & Thorough</option>
                  </select>
                </div>

                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Emotional Sensitivity</label>
                  <select name="emotionalSensitivity" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select sensitivity...</option>
                    <option value="Low">Low (Logical/Detached)</option>
                    <option value="Medium">Medium (Empathetic)</option>
                    <option value="High">High (Highly Supportive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Disagreement Style</label>
                  <select name="disagreementStyle" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select style...</option>
                    <option value="Assertive">Assertive (Stands ground)</option>
                    <option value="Diplomatic">Diplomatic (Finds middle ground)</option>
                    <option value="Avoidant">Avoidant (Changes subject)</option>
                  </select>
                </div>

                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Identity Transparency</label>
                  <select name="identityTransparency" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select level...</option>
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
                  placeholder="e.g. Building great products, traveling" 
                  required 
                />
                
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Marital / Relationship Status</label>
                  <select name="maritalStatus" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select status...</option>
                    <option value="Single">Single</option>
                    <option value="In a relationship">In a relationship</option>
                    <option value="Married">Married</option>
                    <option value="It&apos;s complicated">It&apos;s complicated</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <Button type="submit" size="lg" fullWidth className="mt-8" disabled={isLoading}>
                {isLoading ? "Saving Behavior Profile..." : "Continue to Deployment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
