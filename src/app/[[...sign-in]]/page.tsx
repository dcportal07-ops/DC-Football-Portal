'use client'

import React, { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// --- Custom Football Loader Component ---
const FootballLoader = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-slide-up">
    <div className="relative">
      {/* Spinning/Bouncing Ball */}
      <div className="text-6xl animate-spin-slow drop-shadow-lg">
        ⚽
      </div>
      {/* Shadow pulse below the ball */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/20 rounded-[100%] blur-sm animate-pulse"></div>
    </div>
    
    <div className="text-center space-y-2">
      <h3 className="text-xl font-bold text-[#005f69]">Scouting Profile...</h3>
      <p className="text-sm text-slate-400">Getting the locker room ready</p>
    </div>

    {/* Progress Bar Visual */}
    <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-[#ff6b00] animate-progress-loading w-full origin-left"></div>
    </div>
  </div>
);

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  // New state to handle the transition phase
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();

  console.log(user);

  useEffect(() => {
    // If user is signed in, trigger the loader immediately
    if (isSignedIn && user) {
      setIsRedirecting(true);
      
      const role = user?.publicMetadata.role;
      // Add a small artificial delay (optional) to let the user see the cool animation
      // or remove setTimeout to make it instant.
      const timer = setTimeout(() => {
        if (role) {
          router.push(`/${role}`);
        } else {
           // Fallback if no role is found
           router.push('/dashboard'); 
        }
      }, 1500); 

      return () => clearTimeout(timer);
    }
  }, [user, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#ff6b00] selection:text-white overflow-hidden flex items-center justify-center relative">
      
      {/* ==========================================
          AUTH MODAL OVERLAY
          This section appears only when showAuth is true
      ========================================== */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Dark Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
            onClick={() => !isRedirecting && setShowAuth(false)} // Prevent closing while loading
          ></div>

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md animate-slide-up">
            
            {/* Close Button - Hide this when loading so they can't cancel the redirect */}
            {!isRedirecting && (
              <Button
                onClick={() => setShowAuth(false)}
                className="absolute -top-12 right-0 md:-right-12 text-white/80 hover:text-white transition-colors"
              >
                <X size={32} />
              </Button>
            )}

            {/* CARD CONTENT */}
            <div className="w-full rounded-2xl bg-white px-4 py-10 shadow-2xl ring-1 ring-black/5 sm:px-8 min-h-[400px] flex items-center justify-center">
              
              {/* CONDITIONAL RENDERING: LOADER VS FORM */}
              {isRedirecting ? (
                <FootballLoader />
              ) : (
                <div className="w-full">
                  <SignIn.Root>
                    <SignIn.Step name="start" className="w-full space-y-6">
                      <header className="text-center">
                        <h1 className="mt-4 text-xl text-black font-medium tracking-tight">
                          Sign in to DCPortal
                        </h1>
                      </header>
                      <Clerk.GlobalError className="block text-sm text-red-400" />
                      <div className="space-y-4">
                        <Clerk.Field name="identifier" className="space-y-2">
                          <Clerk.Label className="text-sm font-medium text-zinc-950">Username</Clerk.Label>
                          <Clerk.Input
                            type="text"
                            required
                            className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                          />
                          <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>
                        <Clerk.Field name="password" className="space-y-2">
                          <Clerk.Label className="text-sm font-medium text-zinc-950">Password</Clerk.Label>
                          <Clerk.Input
                            type="password"
                            required
                            className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                          />
                          <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>
                      </div>
                      <SignIn.Action
                        submit
                        className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70"
                      >
                        WOOOhoooo!! Goal
                      </SignIn.Action>
                    </SignIn.Step>
                  </SignIn.Root>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          BACKGROUND & MAIN LANDING PAGE CONTENT
      ========================================== */}
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#005f69]/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff6b00]/10 rounded-full blur-3xl -z-10"></div>

      <main className="w-full max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Content */}
        <div className="space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 border border-slate-300 text-[#005f69] text-xs font-bold uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse"></span>
            Portal of Intelligence
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Master the  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005f69] to-[#008c99]">Game.</span> <br />
            With <span className="relative inline-block">
              DC Portal
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#ff6b00]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>.
          </h1>

          <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
            Experience football like never before. From grassroots academies to pro-level analytics, we bring the stadium atmosphere to your training sessions.
          </p>

          {/* CTA Container */}
          <div className="pt-8 relative inline-block">
            
            {/* The Microinteraction: Bouncing Ball & Tooltip */}
            <div 
              className={`absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out flex flex-col items-center pointer-events-none
                ${isHovered ? '-translate-y-2 opacity-100 scale-110' : 'translate-y-0 opacity-100 scale-100'}
              `}
            >
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md mb-1 shadow-lg whitespace-nowrap opacity-0 transition-opacity duration-300" style={{ opacity: isHovered ? 1 : 0 }}>
                Join the Squad!
              </div>
              <div className={`text-2xl drop-shadow-md ${isHovered ? 'animate-bounce-fast' : 'animate-bounce-slow'}`}>
                ⚽
              </div>
            </div>

            {/* Main Button with OnClick Handler */}
            <button
              onClick={() => setShowAuth(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative group bg-[#005f69] hover:bg-[#004d55] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-[0_10px_20px_-10px_rgba(0,95,105,0.4)] hover:shadow-[0_20px_30px_-15px_rgba(0,95,105,0.6)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Let's kick in</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              
              {/* Hover Fill Effect */}
              <div className="absolute inset-0 bg-[#ff6b00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out"></div>
            </button>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden`}>
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                  </div>
                ))}
              </div>
              <span>Joined by 500+ players today</span>
            </div>
          </div>
        </div>

        {/* Right Visual - Animated Transparent Card */}
        <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center perspective-1000">
          
          {/* Main Glass Card */}
          <div className="relative w-full max-w-[340px] h-[450px] bg-white/10 backdrop-blur-md border border-white/20 rounded-[30px] shadow-2xl overflow-hidden animate-float-slow z-20">
            
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

            <div className="p-6 h-full flex flex-col justify-between relative z-10">
              
              {/* Top Node: Coach */}
              <div className="flex items-start gap-4 animate-slide-in-right">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005f69] to-[#003d44] p-0.5 shadow-lg">
                   <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=coach&backgroundColor=e5e7eb" alt="Coach" />
                   </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm">
                  <p className="text-[#005f69] text-xs font-bold uppercase tracking-wider mb-1">Head Coach</p>
                  <p className="text-slate-700 text-sm font-medium italic">"Focus on your pace today."</p>
                </div>
              </div>

              {/* Connection Visualization */}
              <div className="flex-1 relative mx-6 my-2">
                 <svg className="absolute inset-0 w-full h-full" overflow="visible">
                    <path 
                      d="M 20 10 C 20 80, 150 50, 200 150" 
                      fill="none" 
                      stroke="#005f69" 
                      strokeWidth="2" 
                      strokeDasharray="6 4"
                      className="opacity-30"
                    />
                    <circle r="4" fill="#ff6b00">
                      <animateMotion 
                        dur="3s" 
                        repeatCount="indefinite" 
                        path="M 20 10 C 20 80, 150 50, 200 150"
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="linear"
                      />
                    </circle>
                 </svg>

                 <div className="absolute top-1/4 left-1/4 bg-white shadow-md px-3 py-1 rounded-full flex items-center gap-2 animate-pulse-slow">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold text-slate-600">Tactics</span>
                 </div>

                 <div className="absolute top-2/3 right-1/4 bg-white shadow-md px-3 py-1 rounded-full flex items-center gap-2 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                    <div className="w-2 h-2 rounded-full bg-[#ff6b00]"></div>
                    <span className="text-[10px] font-bold text-slate-600">Motivation</span>
                 </div>
              </div>

              {/* Bottom Node: Player */}
              <div className="flex items-end justify-end gap-4 animate-slide-in-left">
                <div className="bg-[#ff6b00]/10 backdrop-blur-sm border border-[#ff6b00]/20 p-3 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-sm text-right">
                  <p className="text-[#ff6b00] text-xs font-bold uppercase tracking-wider mb-1">Star Player</p>
                  <p className="text-slate-700 text-sm font-medium">"Understood. Training updated."</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6b00] to-[#cc5500] p-0.5 shadow-lg relative">
                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-20"></div>
                   <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=player1&backgroundColor=ffedd5" alt="Player" />
                   </div>
                </div>
              </div>

            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[380px] bg-[#005f69] rounded-[30px] -rotate-6 opacity-10 z-10 transform scale-95"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[380px] bg-[#ff6b00] rounded-[30px] rotate-6 opacity-10 z-10 transform scale-95"></div>

        </div>
      </main>
      
      {/* Add this new animation for the progress bar 
      */}
      <style jsx global>{`
        @keyframes progress-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-loading {
          animation: progress-loading 1.5s infinite linear;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        /* ... existing animations ... */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes slide-in-right {
           from { opacity: 0; transform: translateX(-20px); }
           to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-left {
           from { opacity: 0; transform: translateX(20px); }
           to { opacity: 1; transform: translateX(0); }
           animation-delay: 0.3s;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-bounce-fast {
          animation: bounce-fast 0.6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-slide-in-right {
           animation: slide-in-right 0.8s ease-out forwards;
        }
        .animate-slide-in-left {
           animation: slide-in-left 0.8s ease-out forwards;
           animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};