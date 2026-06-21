import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { seedInitialDataIfNeeded } from './lib/firebaseSeeder';

// Child Modules
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import NotesShare from './components/NotesShare';
import PlacementTracker from './components/PlacementTracker';
import EventAnnouncements from './components/EventAnnouncements';
import AttendanceCalculator from './components/AttendanceCalculator';
import DoubtSolver from './components/DoubtSolver';
import StudyPlanner from './components/StudyPlanner';

import { 
  BookOpen, Briefcase, Calendar, CheckSquare, 
  MessageSquare, LogOut, Sun, Moon, LayoutDashboard, Menu, X, ArrowLeft, CircleHelp
} from 'lucide-react';

export default function App() {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Router: 'landing', 'auth', 'dashboard', 'notes', 'ai-solver', 'placements', 'attendance', 'events', 'planner'
  const [activeSection, setActiveSection] = useState<string>('landing');

  // Dark Mode
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Mobile menu toggle helper
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize Firebase Auth listener & DB Seeder
  useEffect(() => {
    // 1. Auth state observer
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Inoculate initial database sample benchmarks once authenticated
        seedInitialDataIfNeeded();
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data());
          } else {
            // Fallback profile if record is missing
            const fallback = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'College Student',
              department: 'Computer Science & Engineering',
              semester: '1st Semester'
            };
            setCurrentUser(fallback);
          }
          // Default authenticated section
          setActiveSection('dashboard');
        } catch (err) {
          console.error('Failed to sync auth metadata:', err);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'College Student',
            department: 'Computer Science & Engineering',
            semester: '1st Semester'
          });
          setActiveSection('dashboard');
        }
      } else {
        const savedBypass = localStorage.getItem('local_sandbox_user');
        if (savedBypass) {
          try {
            const parsed = JSON.parse(savedBypass);
            setCurrentUser(parsed);
            seedInitialDataIfNeeded();
            setActiveSection('dashboard');
          } catch (e) {
            setCurrentUser(null);
            setActiveSection('landing');
          }
        } else {
          setCurrentUser(null);
          setActiveSection('landing');
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Theme Sync effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('local_sandbox_user');
      await signOut(auth);
      setCurrentUser(null);
      setActiveSection('landing');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const selectModuleRoute = (route: string) => {
    setActiveSection(route);
    setMobileMenuOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl animate-bounce mb-4 font-display">B</div>
        <p className="text-sm font-medium animate-pulse">Synchronizing BVRITH Student Workspace...</p>
      </div>
    );
  }

  // Navigation Links for Logged-In State
  const navLinks = [
    { id: 'dashboard', label: 'Main dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { id: 'notes', label: 'Notes Box', icon: <BookOpen className="h-4.5 w-4.5" /> },
    { id: 'ai-solver', label: 'Doubt Solver', icon: <CircleHelp className="h-4.5 w-4.5" /> },
    { id: 'placements', label: 'Jobs & Placements', icon: <Briefcase className="h-4.5 w-4.5" /> },
    { id: 'events', label: 'Events hub', icon: <Calendar className="h-4.5 w-4.5" /> },
    { id: 'attendance', label: 'Attendance', icon: <CheckSquare className="h-4.5 w-4.5" /> },
    { id: 'planner', label: 'Planner', icon: <MessageSquare className="h-4.5 w-4.5" /> },
  ];

  const currentSectionDetails = navLinks.find(link => link.id === activeSection);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* 1. Unauthenticated landing and login view states */}
      {activeSection === 'landing' && (
        <LandingPage 
          onGetStarted={() => setActiveSection('auth')} 
          onLogin={() => setActiveSection('auth')} 
        />
      )}

      {activeSection === 'auth' && (
        <AuthPage 
          onAuthSuccess={(profile) => {
            setCurrentUser(profile);
            setActiveSection('dashboard');
          }}
          onBackToLanding={() => setActiveSection('landing')}
        />
      )}

      {/* 2. Authenticated Dashboard Layout */}
      {currentUser && activeSection !== 'landing' && activeSection !== 'auth' && (
        <div className="min-h-screen flex flex-col" id="app-workspace">
          
          {/* Main Global Header Navigation */}
          <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-205 dark:border-slate-800 px-6 py-3.5 flex justify-between items-center" id="global-nav">
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => selectModuleRoute('dashboard')}
                className="h-8.5 w-8.5 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-base font-display hover:scale-105 transition-transform cursor-pointer"
              >
                B
              </button>
              <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white tracking-tight hidden sm:block">BVRITH Campus Companion</span>
            </div>

            {/* Middle Nav helper back link if not on home dashboard */}
            {activeSection !== 'dashboard' && (
              <button
                onClick={() => selectModuleRoute('dashboard')}
                className="hidden md:flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-350 hover:text-blue-600 dark:hover:text-amber-500 font-medium font-sans cursor-pointer bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
              </button>
            )}

            {/* Desktop Navigation Tools */}
            <div className="hidden lg:flex items-center gap-6 text-sm">
              <div className="flex gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => selectModuleRoute(link.id)}
                    className={`font-semibold transition-colors flex items-center gap-1 cursor-pointer py-1 ${
                      activeSection === link.id 
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                        : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Action utilities spacer divider */}
              <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700"></span>

              <div className="flex items-center gap-3">
                {/* Theme Selector */}
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-slate-600 dark:text-slate-300"
                  title="Toggle Display Theme"
                >
                  {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                </button>

                {/* Secure Log Out */}
                <button
                  onClick={handleLogout}
                  className="p-2 border border-slate-250 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-600 dark:text-rose-400 cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Secure log out"
                >
                  <LogOut className="h-4.5 w-4.5" /> Logout
                </button>
              </div>
            </div>

            {/* Mobile Nav helper toggles */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200"
              >
                {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
            </div>

          </nav>

          {/* Mobile Overlay Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 select-none animate-fade-in z-45 relative">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => selectModuleRoute(link.id)}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center gap-2.5 text-sm font-semibold ${
                    activeSection === link.id 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left p-2.5 rounded-lg text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/25 flex items-center gap-2.5 text-sm font-semibold cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" /> Leave Campus Suite
              </button>
            </div>
          )}

          {/* Active section dashboard content wrapper */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8" id="workspace-viewport">
            
            {activeSection !== 'dashboard' && (
              <div className="mb-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                  <span>Workspace</span>
                  <span>/</span>
                  <span className="capitalize font-semibold text-slate-600 dark:text-slate-350">{currentUser.displayName || 'Student'}</span>
                  <span>/</span>
                  <span className="font-bold underline text-blue-600 dark:text-blue-400 font-sans">{activeSection}</span>
                </div>

                <button
                  onClick={() => selectModuleRoute('dashboard')}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  &larr; Back to Dashboard
                </button>
              </div>
            )}

            {/* Modular route switching */}
            {activeSection === 'dashboard' && (
              <Dashboard 
                currentUser={currentUser} 
                onSelectModule={selectModuleRoute} 
                onLogout={handleLogout} 
                isDark={isDark} 
                onToggleTheme={() => setIsDark(!isDark)}
                onProfileUpdate={(updated) => setCurrentUser(updated)}
              />
            )}

            {activeSection === 'notes' && (
              <NotesShare currentUser={currentUser} />
            )}

            {activeSection === 'ai-solver' && (
              <DoubtSolver />
            )}

            {activeSection === 'placements' && (
              <PlacementTracker currentUser={currentUser} />
            )}

            {activeSection === 'events' && (
              <EventAnnouncements />
            )}

            {activeSection === 'attendance' && (
              <AttendanceCalculator />
            )}

            {activeSection === 'planner' && (
              <StudyPlanner currentUser={currentUser} />
            )}

          </main>
        </div>
      )}
    </div>
  );
}
