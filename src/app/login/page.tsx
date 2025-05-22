
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
    if (!loading && user) {
      router.push("/"); // Redirect to home if already logged in
    }
  }, [user, loading, router]);

  if (loading || user) { // Show loading or nothing if user is already present (will be redirected)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
            <Briefcase className="h-16 w-16 text-primary animate-pulse" />
            <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
    );
  }

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
            disabled={loading}
          >
            <LogIn className="mr-3 h-6 w-6" /> {/* Using LogIn icon */}
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
