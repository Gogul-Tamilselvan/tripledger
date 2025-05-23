
"use client";

import type * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, LogIn } from "lucide-react"; // Using LogIn for Google

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect handles redirecting the user to the main page if they are authenticated
    // and no longer in a loading state.
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    // Case 1: Authentication state is loading (e.g., initial check, during Google Sign-In process)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
            <Briefcase className="h-16 w-16 text-primary animate-pulse" />
            <p className="mt-4 text-lg text-muted-foreground">Authenticating...</p>
        </div>
    );
  }

  if (user) {
    // Case 2: User is authenticated (and loading is false), but we are still on the login page.
    // This state should ideally be brief as the useEffect above should be redirecting.
    // Showing a "Redirecting..." message provides feedback if the redirect is not instantaneous.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
        <Briefcase className="h-16 w-16 text-primary" /> {/* No pulse, user object loaded */}
        <p className="mt-4 text-lg text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Case 3: Not loading and no user, so show the actual login form.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center bg-card p-3 mx-auto mb-4">
            <Briefcase className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to ProLedger</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Sign in to manage your professional expenses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={loginWithGoogle}
            className="w-full text-lg py-6"
            variant="default"
            disabled={loading} // Button should be disabled if auth state is loading
          >
            <LogIn className="mr-3 h-6 w-6" />
            Sign In with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            Secure and easy access to your financial records.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
