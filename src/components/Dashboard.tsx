import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { updateDoc, doc, collection, getDocs } from 'firebase/firestore';
import { getDailyQuote } from '../utils/quotes';
import { 
  BookOpen, Briefcase, Calendar, CheckSquare, 
  MessageSquare, User, GraduationCap, ChevronRight, BellRing, CircleHelp
} from 'lucide-react';

interface DashboardProps {
  currentUser: any;
  onSelectModule: (moduleName: string) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onProfileUpdate: (updatedDetails: any) => void;
}

export default function Dashboard({ 
  currentUser, 
  onSelectModule, 
  onLogout, 
  isDark, 
  onToggleTheme,
  onProfileUpdate 
}: DashboardProps) {
  
  const dailyQuote = getDailyQuote();

  // Profile edit toggling
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.displayName || '');
  const [editDepartment, setEditDepartment] = useState(currentUser.department || 'Computer Science & Engineering');
  const [editSemester, setEditSemester] = useState(currentUser.semester || '1st Semester');
  const [profileLoading, setProfileLoading] = useState(false);

  // Notifications summary derived from live data counts
  const [counts, setCounts] = useState({ notes: 0, placements: 0, events: 0 });

  const fetchLiveCounts = async () => {
    try {
      const notesSnap = await getDocs(collection(db, 'notes'));
      const placementsSnap = await getDocs(collection(db, 'placements'));
      const eventsSnap = await getDocs(collection(db, 'events'));
      setCounts({
        notes: notesSnap.size,
        placements: placementsSnap.size,
        events: eventsSnap.size
      });
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
    }
  };

  useEffect(() => {
    fetchLiveCounts();
  }, [currentUser]);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence & Machine Learning',
    'Other Sciences / Humanities'
  ];

  const semesters = [
    '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
    '5th Semester', '6th Semester', '7th Semester', '8th Semester'
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setProfileLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        ...currentUser,
        displayName: editName,
        department: editDepartment,
        semester: editSemester
      };

      await updateDoc(userDocRef, {
        displayName: editName,
        department: editDepartment,
        semester: editSemester
      });

      onProfileUpdate(updatedData);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update student profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const modules = [
    {
      id: 'notes',
      title: "Notes Share Hub",
      badgeCount: counts.notes,
      description: "Search notes, verify syllabi, and save peer summaries.",
      icon: <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      colorClass: "hover:border-blue-500/50 hover:bg-blue-50/10"
    },
    {
      id: 'ai-solver',
      title: "AI Doubt Solver",
      badgeCount: 0,
      description: "Ask academic questions, program logic, or derivation tips.",
      icon: <CircleHelp className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      colorClass: "hover:border-purple-500/50 hover:bg-purple-50/10"
    },
    {
      id: 'placements',
      title: "Placement Opportunities",
      badgeCount: counts.placements,
      description: "Review active corporate drives, criteria, and apply pointers.",
      icon: <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      colorClass: "hover:border-indigo-500/50 hover:bg-indigo-50/10"
    },
    {
      id: 'attendance',
      title: "Attendance Planner",
      badgeCount: 0,
      description: "Input attended and total classes to find safety margins.",
      icon: <CheckSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      colorClass: "hover:border-amber-500/50 hover:bg-amber-50/10"
    },
    {
      id: 'events',
      title: "College Activity Hub",
      badgeCount: counts.events,
      description: "Check BVRITH workshops, cultural programs, sports meets, and technical activities.",
      icon: <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      colorClass: "hover:border-emerald-500/50 hover:bg-emerald-50/10"
    },
    {
      id: 'planner',
      title: "Study Task Planner",
      badgeCount: 0,
      description: "Set daily milestones, allocate exams, check progress.",
      icon: <MessageSquare className="h-6 w-6 text-rose-600 dark:text-rose-450" />,
      colorClass: "hover:border-rose-500/50 hover:bg-rose-50/10"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-hub">
      
      {/* Top Banner with Personalized welcome & notification counts */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden" id="dashboard-hero-card">
        
        {/* Decorative elements in student banner */}
        <div className="absolute top-0 right-0 h-44 w-44 bg-white/5 rounded-full translate-x-12 translate-y-[-10px] select-none"></div>
        <div className="absolute bottom-0 left-12 h-20 w-20 bg-white/5 rounded-full select-none"></div>

        <div className="space-y-2 relative" id="greeting-details">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-100 bg-white/10 px-3 py-1 rounded-full w-fit flex items-center gap-1.5 font-sans">
            <GraduationCap className="h-4 w-4" /> B.Tech Academic Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black leading-tight">
            Hi, {currentUser.displayName || 'Student'}!
          </h2>
          <p className="text-sm text-blue-50/90 leading-relaxed font-sans max-w-xl">
            You are enrolled in <span className="font-semibold text-white underline decoration-wavy decoration-emerald-400">{currentUser.department}</span>, <span className="font-semibold text-white">{currentUser.semester}</span>. Let's make today productive!
          </p>
        </div>

        {/* Short motivational Quote card on the right */}
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl max-w-sm border border-white/10 shrink-0 self-stretch flex flex-col justify-between" id="quote-card">
          <div className="text-xs text-blue-200 uppercase tracking-widest font-extrabold flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Motivational Anchor
          </div>
          <p className="text-xs italic text-white/95 mt-2 line-clamp-3 leading-relaxed font-sans">
            "{dailyQuote.text}"
          </p>
          <span className="text-[10px] text-right text-blue-100 font-bold block mt-2 font-mono">— {dailyQuote.author}</span>
        </div>
      </div>

      {/* Grid containing Profile update panel & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Profile Information panel and department editor */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <h3 className="font-display font-semibold text-slate-905 dark:text-white text-base flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" /> Student profile
            </h3>
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              {isEditingProfile ? 'Cancel' : 'Edit details'}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-4 text-sm" id="profile-text-fields">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-blue-300 rounded-2xl flex items-center justify-center font-black text-base uppercase font-display">
                  {currentUser.displayName ? currentUser.displayName.slice(0,2) : 'ST'}
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white leading-normal text-base">{currentUser.displayName || 'Registered Student'}</h4>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono select-none flex items-center gap-1">
                    ● Premium Active Student
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 select-none border-t border-slate-50 dark:border-slate-800">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Department</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{currentUser.department}</span>
                </div>
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Semester</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{currentUser.semester}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-3" id="profile-edit-fields">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-201 dark:border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-201 dark:border-slate-850 rounded-lg py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Semester</label>
                <select
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-201 dark:border-slate-850 rounded-lg py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  {profileLoading ? 'Syncing...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right side: Interactive Notifications panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative">
          <h3 className="font-display font-semibold text-slate-905 dark:text-white text-base mb-4 flex items-center gap-1.5">
            <BellRing className="h-5 w-5 text-indigo-500" /> Recent Campus Activities
          </h3>

          <div className="space-y-3.5" id="notifications-summary-widget">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 text-xs flex gap-3 text-slate-600 dark:text-slate-350">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 shrink-0 w-8 text-center font-bold">1</span>
              <p className="leading-relaxed">
                Welcome to **BVRITH Campus Companion**! Our database is populated with academic files. There are currently <b className="text-slate-805 dark:text-slate-100">{counts.notes} resource note files</b> available for study reviews!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 text-xs flex gap-3 text-slate-600 dark:text-slate-350">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 shrink-0 w-8 text-center font-bold">2</span>
              <p className="leading-relaxed">
                Active job drives matching eligible CGPA criteria: **{counts.placements} active career listings** found from recruiters like Google, Microsoft, and Infosys.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 text-xs flex gap-3 text-slate-600 dark:text-slate-350">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 shrink-0 w-8 text-center font-bold">3</span>
              <p className="leading-relaxed">
                Stay updated! There are **{counts.events} BVRITH workshops, cultural programs, and technical activities** announced.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bento Grid: Quick access cards to other modules */}
      <div className="space-y-4" id="modules-access-section">
        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-lg">
          Explore Campus Utility Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between group ${mod.colorClass}`}
              id={`quick-access-${mod.id}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-105 transition-transform">
                    {mod.icon}
                  </div>
                  
                  {mod.badgeCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-820 dark:bg-blue-900/40 dark:text-blue-300">
                      {mod.badgeCount} Live
                    </span>
                  )}
                </div>

                <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  {mod.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100/60 dark:border-slate-800/60 flex items-center gap-1 text-xs text-slate-405 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold uppercase tracking-wider font-sans">
                Open Dash <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
