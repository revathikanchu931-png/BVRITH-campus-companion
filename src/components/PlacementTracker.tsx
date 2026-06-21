import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { Briefcase, Calendar, ExternalLink, Bookmark, BookmarkCheck, Search, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { PlacementOpportunity, SavedItem } from '../types';

interface PlacementTrackerProps {
  currentUser: any;
}

export default function PlacementTracker({ currentUser }: PlacementTrackerProps) {
  const [placements, setPlacements] = useState<PlacementOpportunity[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  
  // Search and status
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Add Form fields
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEligibility, setNewEligibility] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newApplyLink, setNewApplyLink] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      // 1. Fetch placements
      const placementsCol = collection(db, 'placements');
      const placementsSnapshot = await getDocs(placementsCol);
      const list = placementsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as PlacementOpportunity[];
      // Sort placements by deadline closer first or date created
      setPlacements(list);

      // 2. Fetch saved items
      const savedCol = collection(db, 'saved_items');
      const q = query(savedCol, where('userId', '==', currentUser.uid), where('itemType', '==', 'placement'));
      const savedSnapshot = await getDocs(q);
      const savedList = savedSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as SavedItem[];
      setSavedItems(savedList);
    } catch (err) {
      console.error('Error fetching placements:', err);
      setStatusMsg({ type: 'error', text: 'Could not synchronize career updates.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleToggleSave = async (placementId: string) => {
    const existing = savedItems.find(item => item.itemId === placementId);

    try {
      if (existing) {
        const docRef = doc(db, 'saved_items', existing.id);
        await deleteDoc(docRef);
        setSavedItems(prev => prev.filter(item => item.id !== existing.id));
      } else {
        const savedCol = collection(db, 'saved_items');
        const payload = {
          userId: currentUser.uid,
          itemType: 'placement' as const,
          itemId: placementId,
          savedAt: new Date().toISOString()
        };
        const docRef = await addDoc(savedCol, payload);
        setSavedItems(prev => [...prev, { id: docRef.id, ...payload }]);
      }
    } catch (err) {
      console.error('Save placement toggle failed:', err);
    }
  };

  const handleAddPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim() || !newDeadline.trim() || !newApplyLink.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in Company Name, Role, deadline and apply URL.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const placementsCol = collection(db, 'placements');
      const payload = {
        companyName: newCompany,
        role: newRole,
        eligibility: newEligibility,
        deadline: newDeadline,
        applyLink: newApplyLink,
        description: newDescription,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(placementsCol, payload);
      setPlacements(prev => [{ id: docRef.id, ...payload }, ...prev]);

      // Reset
      setNewCompany('');
      setNewRole('');
      setNewEligibility('');
      setNewDeadline('');
      setNewApplyLink('');
      setNewDescription('');
      setShowAddForm(false);
      setStatusMsg({ type: 'success', text: 'Placement opportunity posted successfully!' });
    } catch (err) {
      console.error('Error posting placement:', err);
      setStatusMsg({ type: 'error', text: 'Failed to upload job opportunity to Firestore.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Client search
  const filteredPlacements = placements.filter(place => {
    const term = searchQuery.toLowerCase();
    return (
      place.companyName.toLowerCase().includes(term) ||
      place.role.toLowerCase().includes(term) ||
      place.eligibility.toLowerCase().includes(term) ||
      place.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in" id="placements-tracker-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /> Placement Tracker
          </h2>
          <p className="text-sm text-slate-605 dark:text-slate-400 mt-1">
            Stay updated with active off-campus and on-campus career drives, eligibility bounds, and registration links.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4.5 w-4.5" /> Post Job Drive
        </button>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border flex gap-2 text-sm ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-905/30' : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-905/30'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Post job Form overlay */}
      {showAddForm && (
        <form onSubmit={handleAddPlacement} className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl relative space-y-4 animate-fade-in" id="add-placement-form">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="font-semibold text-slate-900 dark:text-white text-base">Announce Placement Opportunity</h4>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-405 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">Company Name</label>
              <input
                type="text"
                required
                placeholder="E.g., Microsoft India"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 font-sans">Role / Title</label>
              <input
                type="text"
                required
                placeholder="E.g., Software Dev Associate"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-semibold text-slate-550 font-sans">Eligibility Criteria</label>
              <input
                type="text"
                required
                placeholder="E.g., CGPA > 8.0, B.Tech CSE branch only"
                value={newEligibility}
                onChange={(e) => setNewEligibility(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 font-sans">Application Deadline</label>
              <input
                type="date"
                required
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all cursor-pointer font-sans"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-550 font-sans">Direct Application / Registration URL</label>
              <input
                type="url"
                required
                placeholder="https://company.com/careers/opportunities"
                value={newApplyLink}
                onChange={(e) => setNewApplyLink(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-550">Job Description & Skills Preferred</label>
            <textarea
              placeholder="Provide information about online coding test, technical rounds, basic language stack (Java, Python, C++ etc.)."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all h-20 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-medium cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow cursor-pointer disabled:opacity-40"
            >
              {submitting ? 'Adding Drive details...' : 'Publish Job Opportunity'}
            </button>
          </div>
        </form>
      )}

      {/* Search Input for placements */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none text-slate-900 dark:text-white focus:border-indigo-500 font-sans shadow-sm"
          placeholder="Filter opportunities (e.g. Google, Python, B.Tech)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-450 italic">Syncing live career drives with Placement Cell...</div>
      ) : filteredPlacements.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
          <p className="text-slate-400 font-medium">No placement listings matched your keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="placements-grid">
          {filteredPlacements.map((drive) => {
            const isSaved = savedItems.some(item => item.itemId === drive.id);
            const isDeadlinePassed = new Date(drive.deadline) < new Date();

            return (
              <div 
                key={drive.id} 
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                id={`drive-card-${drive.id}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-lg font-display">
                        {drive.companyName[0]}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                          {drive.companyName}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{drive.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSave(drive.id)}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${isSaved ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                      title={isSaved ? "Saved to Profile" : "Save opportunity"}
                    >
                      {isSaved ? <BookmarkCheck className="h-5.5 w-5.5" /> : <Bookmark className="h-5.5 w-5.5" />}
                    </button>
                  </div>

                  <div className="space-y-3 mt-4 text-xs select-none">
                    {/* Eligibility criteria visual indicators */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                      <div className="flex gap-2">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-16">Eligibility:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-sans">{drive.eligibility || 'Open to all streams'}</span>
                      </div>
                      <div className="flex gap-2 font-sans">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-16">Deadline:</span>
                        <span className={`font-semibold font-sans ${isDeadlinePassed ? 'text-rose-600 dark:text-rose-450' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {drive.deadline} {isDeadlinePassed && '(Expired)'}
                        </span>
                      </div>
                    </div>

                    {drive.description && (
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {drive.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                    <Calendar className="h-3 w-3" /> Posted {new Date(drive.createdAt || '').toLocaleDateString()}
                  </span>

                  <a
                    href={drive.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isDeadlinePassed ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400' : 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-sm'}`}
                  >
                    Apply Now <ExternalLink className="h-3 w-3" />
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
