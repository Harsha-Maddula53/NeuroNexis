'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DeployChoicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function onDeploy() {
    setIsLoading('deploy');
    try {
      const res = await fetch("/api/ai/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });

      if (res.ok) {
        router.push("/society");
      } else {
        console.error("Failed to deploy AI");
      }
    } catch (err) {
      console.error("Error deploying AI:", err);
    } finally {
      setIsLoading(null);
    }
  }

  function onTrain() {
    setIsLoading('train');
    router.push("/training");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-4xl">
        
        {/* Progress Bar */}
        <div className="mb-12 flex justify-center items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">1</div>
            <span className="text-xs font-semibold text-purple-700">Identity</span>
          </div>
          <div className="h-1 w-16 bg-purple-600"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">2</div>
            <span className="text-xs font-semibold text-purple-700">Behavior</span>
          </div>
          <div className="h-1 w-16 bg-purple-600"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">3</div>
            <span className="text-xs font-semibold text-purple-700">Deploy</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your AI is Ready.</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your representation has been generated based on your identity and behavior parameters. What would you like to do next?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Deploy Option */}
          <Card className={`border-2 transition-all ${isLoading === 'deploy' ? 'border-purple-500 shadow-md ring-4 ring-purple-100' : 'border-transparent hover:border-purple-200 hover:shadow-md'}`}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m19 12-7-7-7 7"/></svg>
              </div>
              <CardTitle className="text-2xl font-bold">Deploy to Society</CardTitle>
              <CardDescription className="text-base mt-2">
                Release your AI immediately. It will start responding on your behalf based on your defined parameters right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-4">
              <Button 
                size="lg" 
                className="w-[80%]" 
                onClick={onDeploy} 
                disabled={isLoading !== null}
              >
                {isLoading === 'deploy' ? 'Deploying...' : 'Deploy Now'}
              </Button>
            </CardContent>
          </Card>

          {/* Train Option */}
          <Card className={`border-2 transition-all ${isLoading === 'train' ? 'border-purple-500 shadow-md ring-4 ring-purple-100' : 'border-transparent hover:border-purple-200 hover:shadow-md'}`}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4 shadow-sm border border-purple-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 3-10 4 4"/><path d="M22 12h-2l-2-4-2 10-3-18-5 13H2"/></svg>
              </div>
              <CardTitle className="text-2xl font-bold">Test & Train Mode</CardTitle>
              <CardDescription className="text-base mt-2">
                Enter a private chat session with your AI. See how it responds to various questions before releasing it to the public.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-[80%] border-purple-200 text-purple-700 hover:bg-purple-50" 
                onClick={onTrain} 
                disabled={isLoading !== null}
              >
                {isLoading === 'train' ? 'Loading Chat...' : 'Test AI Responses'}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Skip to Dashboard Option */}
        <div className="mt-12 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-purple-700 font-medium transition-colors hover:bg-purple-50 px-6 py-2 rounded-full"
          >
            Skip for now & Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
