"use client";

import React from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireEmailVerification?: boolean;
}

export default function ProtectedRoute({
  children,
  fallback,
  requireEmailVerification = false,
}: ProtectedRouteProps) {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Check email verification if required
  if (requireEmailVerification && user && user.emailAddresses[0]?.verification?.status !== "verified") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verification Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please verify your email address to continue using the platform.
          </p>
          <button
            onClick={() => user.emailAddresses[0]?.prepareVerification({ strategy: "email_code" })}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Hook for getting authentication state
export function useAuthState() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user } = useUser();

  return {
    isLoaded,
    isAuthenticated: isSignedIn && !!userId,
    user,
    userId,
  };
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireEmailVerification?: boolean;
    fallback?: React.ReactNode;
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute
        requireEmailVerification={options?.requireEmailVerification}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
} 