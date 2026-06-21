import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { BookOpen, Search, Filter, Plus, Bookmark, BookmarkCheck, ExternalLink, Download, User, Calendar, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudyNote, SavedItem } from '../types';

interface NotesShareProps {
  currentUser: any;
}

export default function NotesShare({ currentUser }: NotesShareProps) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  
  // Search / filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterBranch, setFilterBranch] = useState(currentUser.department || 'All');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBranch, setNewBranch] = useState(currentUser.department || 'Computer Science & Engineering');
  const [newSemester, setNewSemester] = useState('1st Semester');
  const [newDescription, setNewDescription] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const semesters = [
    'All', '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
    '5th Semester', '6th Semester', '7th Semester', '8th Semester'
  ];

  const subjects = [
    'All', 'Computer Networks', 'Data Structures & Algorithms', 
    'Operating Systems', 'Mathematics', 'Engineering Physics', 'Chemistry'
  ];

  const branches = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence & Machine Learning',
    'Other Sciences / Humanities'
  ];

  // Fetch Notes & Bookmarks from Firestore
  const fetchData = async () => {
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      // 1. Fetch all notes
      const notesCol = collection(db, 'notes');
      const notesSnapshot = await getDocs(notesCol);
      const notesList = notesSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as StudyNote[];
      setNotes(notesList);

      // 2. Fetch user's bookmarked note items
      const savedCol = collection(db, 'saved_items');
      const q = query(savedCol, where('userId', '==', currentUser.uid), where('itemType', '==', 'note'));
      const savedSnapshot = await getDocs(q);
      const savedList = savedSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as SavedItem[];
      setSavedItems(savedList);
    } catch (err: any) {
      console.error('Error fetching study notes:', err);
      setStatusMsg({ type: 'error', text: 'Failed to synchronize study resources. Check internet.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Bookmark toggling
  const handleToggleBookmark = async (noteId: string) => {
    const existingBookmark = savedItems.find(item => item.itemId === noteId);
    
    try {
      if (existingBookmark) {
        // Delete bookmark from Firestore
        const docRef = doc(db, 'saved_items', existingBookmark.id);
        await deleteDoc(docRef);
        setSavedItems(prev => prev.filter(item => item.id !== existingBookmark.id));
      } else {
        // Create new bookmark in Firestore
        const savedCol = collection(db, 'saved_items');
        const newSaved = {
          userId: currentUser.uid,
          itemType: 'note' as const,
          itemId: noteId,
          savedAt: new Date().toISOString()
        };
        const docRef = await addDoc(savedCol, newSaved);
        setSavedItems(prev => [...prev, { id: docRef.id, ...newSaved }]);
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  // Add notes form submission
  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim() || !newFileUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in Title, Subject and Link.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const notesCol = collection(db, 'notes');
      const notePayload = {
        title: newTitle,
        subject: newSubject,
        branch: newBranch,
        semester: newSemester,
        description: newDescription,
        fileUrl: newFileUrl,
        uploadedBy: currentUser.uid,
        uploadedByName: currentUser.displayName || 'Contributor',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(notesCol, notePayload);
      
      setNotes(prev => [{ id: docRef.id, ...notePayload }, ...prev]);
      
      // Reset form
      setNewTitle('');
      setNewSubject('');
      setNewBranch(currentUser.department || 'Computer Science & Engineering');
      setNewSemester('1st Semester');
      setNewDescription('');
      setNewFileUrl('');
      setShowAddForm(false);
      setStatusMsg({ type: 'success', text: 'Note uploaded successfully! Thank you for contributing.' });
    } catch (err: any) {
      console.error('Error uploading note:', err);
      setStatusMsg({ type: 'error', text: 'Failed to upload note to Firestore.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter notes in client side
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSemester = filterSemester === 'All' || note.semester === filterSemester;
    const matchesSubject = filterSubject === 'All' || note.subject.toLowerCase().includes(filterSubject.toLowerCase());
    const noteBranch = note.branch || 'All';
    const matchesBranch = filterBranch === 'All' || noteBranch === 'All' || noteBranch === filterBranch;

    return matchesSearch && matchesSemester && matchesSubject && matchesBranch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="notes-hub-container">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Syllabus Notes Exchange
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Access, upload, bookmark, and study handcrafted peer materials or teacher handouts.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4.5 w-4.5" /> Upload Notes Link
        </button>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border flex gap-2 text-sm ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-905/30' : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-905/30'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Add note Form (overlay drawer look alike but inline-polished) */}
      {showAddForm && (
        <form onSubmit={handleAddNoteSubmit} className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl relative space-y-4 animate-fade-in" id="note-upload-form">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="font-semibold text-slate-900 dark:text-white text-base">Contribute Study Material</h4>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">Notes Title</label>
              <input
                type="text"
                required
                placeholder="E.g., Computer Networks Unit 3 subnetting"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 font-sans">Subject Category</label>
              <input
                type="text"
                required
                placeholder="E.g., Operating Systems, DSA, Mathematics"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">Branch</label>
              <select
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all cursor-pointer font-sans"
              >
                {branches.filter(branch => branch !== 'All').map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">Recommended Semester</label>
              <select
                value={newSemester}
                onChange={(e) => setNewSemester(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all cursor-pointer font-sans"
              >
                {semesters.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">Study Material Share Link (PDF/Google Drive/Drive folder)</label>
              <input
                type="url"
                required
                placeholder="https://drive.google.com/file/d/... or any education link"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-755 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-550">Brief Description</label>
            <textarea
              placeholder="What topics does this note cover? Is there anything specific code or formula inside?"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-755 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all h-20 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow cursor-pointer disabled:opacity-40"
            >
              {submitting ? 'Sharing link...' : 'Share with College'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-100/50 dark:bg-slate-900/40 p-4 border border-slate-200/50 dark:border-slate-800/60 rounded-xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            className="w-full bg-white dark:bg-slate-850 border border-slate-205 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-sm outline-none text-slate-900 dark:text-white focus:border-blue-500 font-sans"
            placeholder="Search notes, topics, or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 shrink-0">Sem:</span>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="w-full bg-white dark:bg-slate-850 border border-slate-205 dark:border-slate-800 rounded-lg py-2 px-3 text-sm outline-none text-slate-900 dark:text-white cursor-pointer"
          >
            {semesters.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 shrink-0 font-sans">Branch:</span>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="w-full bg-white dark:bg-slate-850 border border-slate-205 dark:border-slate-800 rounded-lg py-2 px-3 text-sm outline-none text-slate-900 dark:text-white cursor-pointer"
          >
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 shrink-0 font-sans">Subject:</span>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full bg-white dark:bg-slate-850 border border-slate-205 dark:border-slate-800 rounded-lg py-2 px-3 text-sm outline-none text-slate-900 dark:text-white cursor-pointer"
          >
            {subjects.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading list */}
      {loading ? (
        <div className="text-center py-12 text-slate-450 italic">Syncing study materials across departments...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 space-y-2">
          <p className="text-slate-400 font-medium">No shared notes found matching active search criteria.</p>
          <button onClick={() => { setSearchQuery(''); setFilterSemester('All'); setFilterSubject('All'); setFilterBranch('All'); }} className="text-xs text-blue-600 font-semibold cursor-pointer">Reset all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="notes-grid-view">
          {filteredNotes.map((note) => {
            const isBookmarked = savedItems.some(item => item.itemId === note.id);
            return (
              <div 
                key={note.id} 
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                id={`note-item-card-${note.id}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {note.subject}
                    </span>
                    <button
                      onClick={() => handleToggleBookmark(note.id)}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'}`}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark student link"}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                    </button>
                  </div>

                  <h3 className="font-display font-bold text-slate-905 dark:text-white text-lg">
                    {note.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-400">{note.semester}</span>
                  <span className="ml-2 text-xs font-medium text-slate-400">{note.branch || 'All Branches'}</span>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                    {note.description || "No description provided. Click the study link below to inspect document details."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                    <User className="h-3.5 w-3.5" />
                    <span>Uploaded by: <b className="text-slate-700 dark:text-slate-300 font-medium">{note.uploadedByName}</b></span>
                  </div>
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    Study Link <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
