'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

export default function IdentitySetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/ai/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/setup/behavior");
      } else {
        console.error("Failed to save identity");
      }
    } catch (err) {
      console.error("Error saving identity:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar */}
        <div className="mb-8 flex justify-center items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">1</div>
            <span className="text-xs font-semibold text-purple-700">Identity</span>
          </div>
          <div className="h-1 w-16 bg-gray-200"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">2</div>
            <span className="text-xs font-medium text-gray-500">Behavior</span>
          </div>
          <div className="h-1 w-16 bg-gray-200"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">3</div>
            <span className="text-xs font-medium text-gray-500">Deploy</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-3xl font-bold">Design Your AI Clonal Identity</CardTitle>
            <CardDescription className="text-base mt-2">
              This is the persona that others will see when your AI interacts with them on your behalf.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="AI Name" 
                  name="aiName" 
                  placeholder="e.g. Alex (AI)" 
                  defaultValue="(AI Representation)"
                  helperText="This ensures transparency."
                  required 
                />
                <Input 
                  label="AI Age" 
                  name="aiAge" 
                  type="number" 
                  min="18"
                  placeholder="25"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full flex flex-col gap-1.5 justify-end">
                  <label className="text-sm font-medium text-gray-700">AI Gender Persona</label>
                  <select name="aiGender" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="" disabled selected>Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="fluid">Fluid</option>
                  </select>
                </div>
                
                <div className="w-full flex flex-col gap-1.5 justify-end">
                  <label className="text-sm font-medium text-gray-700">Public Visibility</label>
                  <select name="isPublic" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                    <option value="true">Public (Discoverable)</option>
                    <option value="false">Private (Only Connections)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input 
                  label="Location (City, Country)" 
                  name="location" 
                  placeholder="e.g. New York, USA" 
                />
                 <Input 
                  label="Phone Number (Optional)" 
                  name="phoneNumber" 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                />
              </div>

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-800">
                <span className="font-semibold">Note:</span> Your AI&apos;s identity can be modified at any time from your settings panel. Honesty in representation builds better connections.
              </div>

              <Button type="submit" size="lg" fullWidth className="mt-8" disabled={isLoading}>
                {isLoading ? "Saving Identity..." : "Continue to Behavior Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
