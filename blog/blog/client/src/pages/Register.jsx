/**
 * Register Page
 * New user registration
 */

import { Link } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { Sparkles } from 'lucide-react';

const Register = () => {
  

  return (
    <div className="min-h-screen flex bg-mesh-gradient bg-surface-50 dark:bg-surface-950">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text">BlogAI</h1>
              <p className="text-sm text-surface-500">AI-Powered Writing</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-surface-900 dark:text-surface-100 mb-2">
              Create your account
            </h2>
            <p className="text-surface-600 dark:text-surface-400">
              Start writing with AI assistance today
            </p>
          </div>

          <div className="space-y-5">
            <SignUp />
          </div>

          <p className="mt-8 text-center text-surface-600 dark:text-surface-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 via-primary-600 to-accent-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">BlogAI</h1>
              <p className="text-white/70">AI-Powered Writing</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
            Join Thousands of<br />
            Content Creators
          </h2>
          
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Experience the future of content writing with AI-powered suggestions 
            that help you create engaging, SEO-optimized blog posts.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-3xl font-bold text-white">AI</p>
              <p className="text-sm text-white/70">Powered</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-3xl font-bold text-white">SEO</p>
              <p className="text-sm text-white/70">Optimized</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-white/70">Your Control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
