import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to your AI Development Assistant Platform
          </p>
        </div>
        
        <div className="mt-8">
          <SignIn 
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
            redirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
          />
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>
            New to the platform?{" "}
            <a 
              href="/sign-up" 
              className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 