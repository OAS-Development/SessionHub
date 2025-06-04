import React from 'react'
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SessionHub.ai - AI Development Platform',
  description: 'Professional AI development platform for session-based coding, testing, and collaboration. Build smarter with SessionHub.ai.',
  keywords: 'AI development, session-based coding, AI assistant, development platform, coding tools, SessionHub',
  authors: [{ name: 'SessionHub.ai Team' }],
  creator: 'SessionHub.ai',
  publisher: 'SessionHub.ai',
  metadataBase: new URL('https://sessionhub.ai'),
  alternates: {
    canonical: 'https://sessionhub.ai',
  },
  openGraph: {
    title: 'SessionHub.ai - AI Development Platform',
    description: 'Professional AI development platform for session-based coding, testing, and collaboration.',
    url: 'https://sessionhub.ai',
    siteName: 'SessionHub.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SessionHub.ai - AI Development Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SessionHub.ai - AI Development Platform',
    description: 'Professional AI development platform for session-based coding, testing, and collaboration.',
    images: ['/twitter-card.png'],
    creator: '@sessionhubai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#0F172A',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F8FAFC',
          colorInputText: '#0F172A',
          colorText: '#374151',
          colorTextSecondary: '#6B7280',
          colorDanger: '#DC2626',
          colorSuccess: '#059669',
          colorWarning: '#D97706',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          formButtonPrimary: 
            'bg-slate-900 hover:bg-slate-800 text-sm font-medium py-2 px-4 rounded-lg transition-colors',
          formButtonSecondary: 
            'border border-gray-300 hover:bg-gray-50 text-sm font-medium py-2 px-4 rounded-lg transition-colors',
          card: 'shadow-xl border border-gray-200 rounded-xl',
          headerTitle: 'text-slate-900 text-xl font-semibold',
          headerSubtitle: 'text-slate-600 text-sm',
          socialButtonsBlockButton: 
            'border border-gray-300 hover:bg-gray-50 rounded-lg py-2 px-4 text-sm font-medium transition-colors',
          formFieldInput: 
            'border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent',
          formFieldLabel: 'text-sm font-medium text-gray-700',
          dividerLine: 'bg-gray-200',
          dividerText: 'text-gray-500 text-sm',
          footerActionLink: 'text-slate-600 hover:text-slate-900 text-sm font-medium',
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0F172A" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "SessionHub.ai",
                "description": "Professional AI development platform for session-based coding, testing, and collaboration.",
                "url": "https://sessionhub.ai",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              })
            }}
          />
        </head>
        <body className={inter.className}>
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    SessionHub.ai
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 rounded-full",
                        }
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
