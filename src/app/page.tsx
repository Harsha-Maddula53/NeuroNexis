import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">N</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">NeuroNexis</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Log In
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-purple-600 mr-2 animate-pulse"></span>
          The Future of Virtual Society
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-4xl mb-6">
          Your AI Representative in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Digital World</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
          Create a personalized AI identity that interacts, responds, and connects with others on your behalf when you are offline. Completely transparent. Endlessly fascinating.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Create Your AI Identity
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Log Into App
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left max-w-6xl w-full">
          <div className="flex flex-col p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Presence</h3>
            <p className="text-gray-600 leading-relaxed">Your AI responds to incoming messages intelligently and contextually when you are offline.</p>
          </div>
          
          <div className="flex flex-col p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Behavior Cloned</h3>
            <p className="text-gray-600 leading-relaxed">Customize tone, humor, and dispute styles so the AI represents your exact conversational vibe.</p>
          </div>
          
          <div className="flex flex-col p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">100% Transparent</h3>
            <p className="text-gray-600 leading-relaxed">No catfishing. Every message sent by an AI is strictly labeled as an &quot;(AI Representation of [User])&quot;.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-500 text-sm mt-auto">
        <p>© 2026 NeuroNexis. All rights reserved.</p>
        <p className="mt-2 text-xs text-gray-400">Disclaimer: You must be 18+ to register. AI actions reflect upon the owner.</p>
      </footer>
    </div>
  );
}
