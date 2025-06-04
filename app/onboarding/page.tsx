"use client";

import React, { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface OnboardingData {
  role: string;
  experience: string;
  interests: string[];
  primaryLanguage: string;
  aiToolsUsed: string[];
}

export default function OnboardingPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    role: "",
    experience: "",
    interests: [],
    primaryLanguage: "",
    aiToolsUsed: [],
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      // Here you would typically save the onboarding data to your database
      // For now, we'll just redirect to the dashboard
      console.log("Onboarding data:", data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    const currentArray = data[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateData(field, newArray);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to the Platform!</h1>
            <p className="mt-2 text-lg text-gray-600">
              Let's set up your profile to get you started
            </p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded-full ${
                      i <= step ? "bg-slate-900" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">What's your role?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Frontend Developer",
                    "Backend Developer",
                    "Full-Stack Developer",
                    "Mobile Developer",
                    "DevOps Engineer",
                    "Data Scientist",
                    "Student",
                    "Other"
                  ].map((role) => (
                    <button
                      key={role}
                      onClick={() => updateData("role", role)}
                      className={`p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                        data.role === role
                          ? "border-slate-900 bg-slate-50"
                          : "border-gray-200"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Experience Level</h2>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: "beginner", label: "Beginner (0-1 years)", desc: "Just starting my coding journey" },
                    { value: "intermediate", label: "Intermediate (2-5 years)", desc: "Comfortable with core concepts" },
                    { value: "advanced", label: "Advanced (5+ years)", desc: "Experienced with complex projects" },
                    { value: "expert", label: "Expert (10+ years)", desc: "Senior level with deep expertise" }
                  ].map((exp) => (
                    <button
                      key={exp.value}
                      onClick={() => updateData("experience", exp.value)}
                      className={`p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                        data.experience === exp.value
                          ? "border-slate-900 bg-slate-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="font-medium">{exp.label}</div>
                      <div className="text-sm text-gray-600">{exp.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Primary Programming Language</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "JavaScript", "TypeScript", "Python", "Java",
                    "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Other"
                  ].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateData("primaryLanguage", lang)}
                      className={`p-3 text-center border rounded-lg hover:bg-gray-50 transition-colors ${
                        data.primaryLanguage === lang
                          ? "border-slate-900 bg-slate-50"
                          : "border-gray-200"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Which AI tools have you used?</h2>
                <p className="text-gray-600">Select all that apply</p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "GitHub Copilot",
                    "Cursor AI",
                    "ChatGPT",
                    "Claude",
                    "Amazon CodeWhisperer",
                    "Tabnine",
                    "Codeium",
                    "None yet"
                  ].map((tool) => (
                    <button
                      key={tool}
                      onClick={() => toggleArrayItem("aiToolsUsed", tool)}
                      className={`p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                        data.aiToolsUsed.includes(tool)
                          ? "border-slate-900 bg-slate-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                            data.aiToolsUsed.includes(tool)
                              ? "bg-slate-900 border-slate-900"
                              : "border-gray-300"
                          }`}
                        >
                          {data.aiToolsUsed.includes(tool) && (
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        {tool}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !data.role) ||
                  (step === 2 && !data.experience) ||
                  (step === 3 && !data.primaryLanguage)
                }
                className="px-6 py-2 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 4 ? "Complete Setup" : "Next"}
              </button>
            </div>
          </div>

          {/* Skip option */}
          <div className="text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 