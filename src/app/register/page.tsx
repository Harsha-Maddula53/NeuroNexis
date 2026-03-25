"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const email = data.email as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Automatically sign in after registration
        const signInResponse = await signIn("credentials", {
          email,
          password: data.password as string,
          redirect: false,
        });

        if (signInResponse?.error) {
          setError("Account created, but failed to log in automatically. Please try logging in manually.");
          router.push("/login");
        } else {
          router.push("/setup/identity");
          router.refresh();
        }
      } else {
        const message = await response.text();
        setError(message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-secondary p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-2xl leading-none">N</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your details below to create your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" placeholder="John" required disabled={isLoading} />
                <Input label="Last Name" name="lastName" placeholder="Doe" required disabled={isLoading} />
              </div>
              
              <Input label="Email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
              
              <Input label="Password" name="password" type="password" required disabled={isLoading} />
              <Input label="Confirm Password" name="confirmPassword" type="password" required disabled={isLoading} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date of Birth" name="dob" type="date" required disabled={isLoading} />
                <div className="w-full flex flex-col gap-1.5 justify-end">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select 
                    name="gender" 
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" 
                    required
                    disabled={isLoading}
                  >
                    <option value="" disabled selected>Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  name="terms" 
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50" 
                  required 
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-tight">
                  I confirm that I am 18 years of age or older and agree to the Terms of Service and Privacy Policy.
                </label>
              </div>

              <Button type="submit" fullWidth className="mt-6" loading={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
