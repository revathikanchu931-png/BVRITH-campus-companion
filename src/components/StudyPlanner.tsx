import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Calendar, CheckSquare, Plus, Trash2, BookOpen, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { StudyTask } from '../types';

interface StudyPlannerProps {
  currentUser: any;
}

export default function StudyPlanner({ currentUser }: StudyPlannerProps) {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Add Task Inputs
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState(() => {
    // Default today in local YYYY-MM-DD
    const local = new Date();
    return local.toISOString().split('T')[0];
  });
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Subjects for study selector
  const availableSubjects = [
    'Computer Networks',
    'Data Structures & Algorithms',
    'Operating Systems',
    'Mathematics',
    'Engineering Physics',
    'Chemistry',
    'Other elective / Project'
  ];

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'study_tasks'), where('userId', '==', currentUser.uid));
      const querySnap = await getDocs(q);
      const list = querySnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as StudyTask[];

      // Sort by date ascending (soonest first)
      const sorted = list.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTasks(sorted);
    } catch (err) {
      console.error('Error fetching study tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim() || !newDate.trim()) {
      setStatusMsg({ type: 'error', text: 'Task title, subject, and date are required.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const payload = {
        userId: currentUser.uid,
        title: newTitle,
        subject: newSubject,
        date: newDate,
        completed: false,
        priority: newPriority,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'study_tasks'), payload);
      setTasks(prev => [...prev, { id: docRef.id, ...payload }].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

      // Reset
      setNewTitle('');
      setNewSubject('');
      setNewPriority('medium');
      setStatusMsg({ type: 'success', text: 'Study task added!' });
    } catch (err) {
      console.error('Error adding task:', err);
      setStatusMsg({ type: 'error', text: 'Could not serialize study task.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      const docRef = doc(db, 'study_tasks', taskId);
      await updateDoc(docRef, { completed: !currentStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
    } catch (err) {
      console.error('Toggle complete failed:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const docRef = doc(db, 'study_tasks', taskId);
      await deleteDoc(docRef);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Delete task failed:', err);
    }
  };

  // Progress metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityClasses = {
    high: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300',
    medium: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300',
    low: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300'
  };

  return (
    <div className="space-y-6 animate-fade-in" id="study-planner-container">
      {/* Header card with completion tracking metric */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        
        <div className="md:col-span-2">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-rose-600 dark:text-rose-450" /> Scholastic Study Planner
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Map out revision tasks, exam goals, or homework. Focus on high priority items first.
          </p>
        </div>

        {/* Dynamic Progression widget */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>STUDY PROGRESSION</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{completedTasks} of {totalTasks} finished</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden select-none">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-semibold mt-1">
            {completionPercentage}% Task Completion Ratio
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Add task form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit space-y-4">
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Schedule New Task</h3>
          
          {statusMsg.text && (
            <div className={`p-3.5 rounded-lg border flex gap-1.5 text-xs ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20' : 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20'}`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Concept / Task Name</label>
              <input
                type="text"
                required
                placeholder="E.g., Revise Dijkstra code syntax"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-rose-500 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 uppercase tracking-wider font-sans">Subject Category</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-rose-500 cursor-pointer font-sans"
              >
                <option value="">-- Choose Subject --</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-semibold text-slate-550 uppercase tracking-wider font-sans">Target Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-rose-500 cursor-pointer font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-555 uppercase tracking-wider font-sans">Priority Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setNewPriority(prio)}
                    className={`py-2 text-xs rounded-lg font-bold border capitalize cursor-pointer transition-colors ${
                      newPriority === prio
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4.5 w-4.5" /> Schedule Task
            </button>
          </form>
        </div>

        {/* Right columns: Study Task entries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-base">Allocated Tasks</h3>
            <span className="text-xs text-slate-400 font-mono">Sorted chronologically</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-450 italic">Syncing personal study schedules...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium">Your study planner is completely clear!</p>
              <p className="text-xs text-slate-500 mt-1">Excellent job staying ahead of deadlines. Add tasks to revise.</p>
            </div>
          ) : (
            <div className="space-y-3" id="study-tasks-list">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4 transition-all ${task.completed ? 'opacity-65' : ''}`}
                  id={`study-task-item-${task.id}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTaskComplete(task.id, task.completed)}
                      className={`h-5.5 w-5.5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${task.completed ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 dark:border-slate-700 hover:border-rose-500'}`}
                      title={task.completed ? "Mark Incomplete" : "Mark Task Complete"}
                    >
                      {task.completed && <CheckCircle2 className="h-4.5 w-4.5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-bold leading-snug truncate font-sans text-slate-900 dark:text-white ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 font-sans">
                        <span className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-450 uppercase font-sans">
                          {task.subject}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${priorityClasses[task.priority]}`}>
                          {task.priority} Prio
                        </span>
                        <span className="text-[10px] text-slate-430 flex items-center gap-1 font-mono pl-1">
                          <Calendar className="h-3 w-3" /> {task.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete scheduled task"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
