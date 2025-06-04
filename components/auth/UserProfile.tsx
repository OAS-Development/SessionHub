"use client";

import React from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

interface UserProfileProps {
  showFullProfile?: boolean;
  className?: string;
}

export default function UserProfile({ 
  showFullProfile = false, 
  className = "" 
}: UserProfileProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!showFullProfile) {
    return (
      <div className={className}>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
              userButtonPopoverCard: "shadow-xl border",
              userButtonPopoverActions: "space-y-1",
              userButtonPopoverActionButton: "text-sm hover:bg-gray-50",
              userButtonPopoverFooter: "hidden",
            },
          }}
          afterSignOutUrl="/sign-in"
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white text-lg font-semibold">
              {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0) || "U"}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {user.primaryEmailAddress?.emailAddress}
          </p>
          <p className="text-xs text-gray-500">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Email verification status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Email Status</span>
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              user.primaryEmailAddress?.verification?.status === "verified"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {user.primaryEmailAddress?.verification?.status === "verified" ? "Verified" : "Pending"}
          </span>
        </div>

        {/* Account creation date */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Account Created</span>
          <span className="text-sm text-gray-600">
            {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>

        {/* Last sign in */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Last Sign In</span>
          <span className="text-sm text-gray-600">
            {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "First time"}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
        <button
          onClick={() => window.open("/user-profile", "_blank")}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          Edit Profile
        </button>
        <button
          onClick={() => signOut()}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Utility function to get user display name
export function getUserDisplayName(user: any): string {
  if (user?.fullName) return user.fullName;
  if (user?.firstName || user?.lastName) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }
  if (user?.primaryEmailAddress?.emailAddress) {
    return user.primaryEmailAddress.emailAddress.split("@")[0];
  }
  return "User";
}

// Hook for user profile data
export function useUserProfile() {
  const { user, isLoaded } = useUser();
  
  return {
    user,
    isLoaded,
    displayName: user ? getUserDisplayName(user) : "",
    isEmailVerified: user?.primaryEmailAddress?.verification?.status === "verified",
    profileImageUrl: user?.imageUrl,
    email: user?.primaryEmailAddress?.emailAddress,
    createdAt: user?.createdAt,
    lastSignInAt: user?.lastSignInAt,
  };
} 