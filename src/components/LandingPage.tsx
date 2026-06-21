import React from 'react';
import { BookOpen, Briefcase, Calendar, CheckSquare, LogIn, Code, ArrowRight, CircleHelp } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Notes Share Hub",
      description: "Easily upload, search, download, and bookmark peer-provided study materials categorized by subject and semester."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Placement Tracker",
      description: "Stay ahead of career deadlines with customized listings of active job postings, eligibility criteria, and direct application links."
    },
    {
      icon: <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Event Hub",
      description: "Never miss BVRIT Hyderabad College of Engineering for Women workshops, cultural programs, seminars, sports meets, or technical activities."
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      title: "Attendance Calculator",
      description: "Manage targets (75% or 80%) instantly. Find out exactly how many succeeding classes must be attended to stay safe."
    },
    {
      icon: <CircleHelp className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      title: "AI Doubt Solver",
      description: "Get smart, structured explanations, academic breakdowns, and expert study suggestions with our custom AI-powered mentor."
    },
    {
      icon: <Code className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
      title: "Study Planner",
      description: "Organize custom learning sessions and assignments. Categorize tasks by priority and monitor daily course completion."
    }
  ];

  const testimonials = [
    {
      quote: "The Notes Sharing Module saved me during mid-semesters! Having peer summaries categorized by syllabus was extremely useful.",
      author: "Sneha Reddy",
      department: "CSE, Year 3",
      avatarBg: "bg-blue-100 text-blue-800"
    },
    {
      quote: "No more tracking dead-ends. The Placement Tracker notified me about the Google off-campus drive right in time to apply.",
      author: "Kartik Nair",
      department: "ECE, Year 4",
      avatarBg: "bg-purple-100 text-purple-800"
    },
    {
      quote: "I use the Attendance Calculator weekly. It calculates exactly how many classes I can afford to miss or must attend to stay at 75%.",
      author: "Aditi Rao",
      department: "IT, Year 2",
      avatarBg: "bg-emerald-100 text-emerald-800"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100" id="landing-container">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-6 py-4 flex justify-between items-center" id="landing-nav">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg font-display">
            B
          </div>
          <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            BVRITH Campus Companion
          </span>
        </div>

        {/* Desktop Links & Authentication buttons */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold select-none">
          <a href="#features-section" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
            Features
          </a>
          <a href="#testimonials-section" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
            Testimonials
          </a>
          
          <span className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></span>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 hover:bg-slate-150 rounded-lg transition-all duration-200 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile Authentication buttons */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onLogin}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 px-6 sm:px-12 text-center lg:py-28 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_50%)]"></div>
        <div className="relative max-w-4xl mx-auto animate-fade-in" id="hero-content">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-900/30">
            <BookOpen className="h-4 w-4" /> Streamlining Campus Life
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight" id="hero-tagline">
            One Platform for <span className="text-blue-600 dark:text-blue-400">Every</span> Student Need.
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-350 max-w-2xl mx-auto leading-relaxed">
            Boost academics, track placements, optimize class attendance, and clear concepts with your server-hosted AI academic tutor. Designed for 1000+ students.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-base duration-200 cursor-pointer"
              id="get-started-btn"
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-3.5 rounded-lg border border-slate-300 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-850 transition-all flex items-center gap-2 text-base cursor-pointer"
              id="login-landing-btn"
            >
              <LogIn className="h-5 w-5" /> Student Login
            </button>
          </div>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24" id="features-section">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white sm:text-4xl">
            Packed with Powerful Modules
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            A comprehensive web ecosystem addressing all regular pain points of university learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 tech-glow hover:translate-y-[-4px] transition-all duration-300"
              id={`feature-card-${idx}`}
            >
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit mb-5">
                {feat.icon}
              </div>
              <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2">
                {feat.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition Statistics */}
      <div className="bg-slate-100 dark:bg-slate-900/60 py-16 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center" id="stats-section">
          <div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-blue-600 dark:text-blue-400">1000+</div>
            <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active Campus Users</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">4.9/5</div>
            <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User Productivity Grade</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-display font-extrabold text-purple-600 dark:text-purple-400">99.9%</div>
            <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Academics Deadline Accuracy</div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24" id="testimonials-section">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            Loved by BVRITH Students
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            See how BVRITH Campus Companion simplifies daily academic workflows for our engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
              id={`testimonial-card-${idx}`}
            >
              <p className="text-slate-600 dark:text-slate-350 italic text-sm leading-relaxed mb-6">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${test.avatarBg}`}>
                  {test.author.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {test.author}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {test.department}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
