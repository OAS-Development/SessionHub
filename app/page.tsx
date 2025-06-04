import React from "react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <main className="relative pt-20">
        <div className="container-wide section-padding">
          <div className="text-center animate-fade-in">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8 animate-scale-in">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Transform Your AI Development Workflow
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-8 leading-tight animate-slide-up">
              Master <span className="gradient-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">AI-Powered</span>
              <br />
              Development
            </h1>
            
            {/* Hero Subtitle */}
            <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up text-balance">
              Track, test, and optimize your AI coding tools. Compare performance across{" "}
              <strong className="text-neutral-800">Cursor, GitHub Copilot, ChatGPT</strong>, and more to boost your development productivity.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
              <SignedOut>
                <SignUpButton mode="redirect" redirectUrl="/onboarding">
                  <button className="btn btn-primary btn-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 transition-all duration-300">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Free Trial
                  </button>
                </SignUpButton>
                <SignInButton mode="redirect" redirectUrl="/dashboard">
                  <button className="btn btn-secondary btn-xl glass border border-white/30 hover:bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    Sign In
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="btn btn-primary btn-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Social Proof / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-neutral-600">Developers Tracking</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">10k+</div>
                <div className="text-neutral-600">AI Sessions Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">85%</div>
                <div className="text-neutral-600">Productivity Increase</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container-wide section-padding-sm">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Everything you need to master AI development
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 text-balance">
              Comprehensive AI Development{" "}
              <span className="gradient-text bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Analytics</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto text-pretty">
              Professional tools to track, analyze, and improve your AI-assisted development workflow with precision and insight
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <div className="card card-hover group animate-fade-in">
              <div className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Project Tracking
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  Monitor your development projects with detailed session tracking, 
                  code metrics, and AI tool usage analytics.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  Learn more{" "}
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover group animate-fade-in">
              <div className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  AI Tool Testing
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  Compare performance across different AI tools with structured tests, 
                  response time tracking, and success rate analysis.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  Learn more{" "}
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover group animate-fade-in">
              <div className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Learning Insights
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  Capture and organize development insights, patterns, and best practices 
                  discovered during your AI-assisted coding sessions.
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  Learn more{" "}
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
          <div className="container-wide section-padding text-center relative">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
                Ready to optimize your{" "}
                <span className="gradient-text bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AI workflow</span>?
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto text-pretty">
                Join developers who are already tracking and improving their AI-assisted coding productivity with professional insights and analytics
              </p>
              <SignedOut>
                <SignUpButton mode="redirect" redirectUrl="/onboarding">
                  <button className="btn btn-xl glass bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl shadow-2xl hover:shadow-white/10 hover:-translate-y-1 transition-all duration-300">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get Started Free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="btn btn-xl glass bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl shadow-2xl hover:shadow-white/10 hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200">
        <div className="container-wide py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-neutral-900">AI Dev Assistant</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Professional AI development analytics for modern developers.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/features" className="hover:text-neutral-900 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-neutral-900 transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-neutral-900 transition-colors">Integrations</Link></li>
                <li><Link href="/changelog" className="hover:text-neutral-900 transition-colors">Changelog</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/docs" className="hover:text-neutral-900 transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-neutral-900 transition-colors">Blog</Link></li>
                <li><Link href="/guides" className="hover:text-neutral-900 transition-colors">Guides</Link></li>
                <li><Link href="/support" className="hover:text-neutral-900 transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/about" className="hover:text-neutral-900 transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-neutral-900 transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-neutral-900 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-8 text-center text-neutral-600">
            <p>&copy; 2024 AI Development Assistant Platform. Built for developers, by developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 