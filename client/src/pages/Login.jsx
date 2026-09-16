import { SignIn } from '@clerk/clerk-react';
import { Sparkles } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-surface-950">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.07%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">BlogAI</h1>
              <p className="text-white/80">AI-Powered Writing Platform</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
            Write Better Content<br />
            with AI Assistance
          </h2>
          
          <p className="text-lg text-white/90 mb-8 max-w-md">
            Create compelling blog posts with intelligent suggestions for titles, 
            instant speech-to-text dictation, and cover image generation.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-white font-semibold">1</span>
              </div>
              <p className="text-white/90">Instant Speech-to-Text dictation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-white font-semibold">2</span>
              </div>
              <p className="text-white/90">Automated AI Cover Image generation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-white font-semibold">3</span>
              </div>
              <p className="text-white/90">SEO analysis & Social Media auto-sharing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-12 bg-slate-50 dark:bg-surface-950">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text">BlogAI</h1>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <SignIn routing="path" path="/login" signUpUrl="/register" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
