import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Calendar as CalendarIcon, MapPin, ExternalLink, Filter, Plus, CheckCircle2, AlertCircle, Grid, List } from 'lucide-react';
import { CollegeEvent } from '../types';

export default function EventAnnouncements() {
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // View mode and filters
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedType, setSelectedType] = useState<string>('All');
  
  // Status message
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'workshop' | 'hackathon' | 'cultural' | 'sports' | 'seminar'>('workshop');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRegLink, setNewRegLink] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsCol = collection(db, 'events');
      const eventsSnap = await getDocs(eventsCol);
      const list = eventsSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as CollegeEvent[];
      // Sort in ascending order (upcoming first)
      const sorted = list.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(sorted);
    } catch (err) {
      console.error('Error fetching college events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim() || !newLocation.trim()) {
      setStatusMsg({ type: 'error', text: 'Title, Date and Location are required.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const eventsCol = collection(db, 'events');
      const payload = {
        title: newTitle,
        type: newType,
        description: newDescription,
        date: newDate,
        location: newLocation,
        registrationLink: newRegLink,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(eventsCol, payload);
      setEvents(prev => [...prev, { id: docRef.id, ...payload }].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

      // Reset
      setNewTitle('');
      setNewType('workshop');
      setNewDescription('');
      setNewDate('');
      setNewLocation('');
      setNewRegLink('');
      setShowAddForm(false);
      setStatusMsg({ type: 'success', text: 'College event posted successfully!' });
    } catch (err) {
      console.error('Error adding event:', err);
      setStatusMsg({ type: 'error', text: 'Error posting event to Firestore.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    return selectedType === 'All' ? true : e.type === selectedType;
  });

  // Calendar Helpers
  // Returns calendar representation of the current month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayIndex = (month: number, year: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday ...
  };

  const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOffset = getFirstDayIndex(currentMonth, currentYear);

  // Generate calendar cells arrays
  const calendarCells = [];
  // Empty offsets
  for (let i = 0; i < firstDayOffset; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    calendarCells.push(dayNum);
  }

  // Get active events on a specific day of the current month
  const getEventsForDay = (day: number) => {
    const targetDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === targetDateStr);
  };

  const eventTypesColors = {
    workshop: 'border-blue-600 bg-blue-50 text-blue-750 dark:bg-blue-950/40 dark:text-blue-300',
    hackathon: 'border-purple-600 bg-purple-50 text-purple-755 dark:bg-purple-950/40 dark:text-purple-300',
    cultural: 'border-rose-600 bg-rose-50 text-rose-755 dark:bg-rose-950/40 dark:text-rose-300',
    sports: 'border-emerald-600 bg-emerald-50 text-emerald-755 dark:bg-emerald-950/40 dark:text-emerald-300',
    seminar: 'border-amber-600 bg-amber-50 text-amber-705 dark:bg-amber-950/40 dark:text-amber-300'
  };

  return (
    <div className="space-y-6 animate-fade-in" id="events-hub-container">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> BVRITH Activity Hub
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-sans">
            Browse activity updates for BVRIT Hyderabad College of Engineering for Women: workshops, technical events, cultural programs, and sports meets.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-slate-600 dark:text-slate-350 flex items-center gap-1 text-sm cursor-pointer"
            title={viewMode === 'list' ? 'Switch to Calendar View' : 'Switch to List View'}
          >
            {viewMode === 'list' ? <Grid className="h-4.5 w-4.5" /> : <List className="h-4.5 w-4.5" />}
            <span className="text-xs font-medium uppercase font-sans tracking-wide">
              {viewMode === 'list' ? 'Calendar View' : 'List View'}
            </span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="h-4.5 w-4.5" /> Launch Event
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border flex gap-2 text-sm ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-905/30' : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-905/30'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Add event Form */}
      {showAddForm && (
        <form onSubmit={handleCreateEvent} className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl relative space-y-4 animate-fade-in" id="add-event-form">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="font-semibold text-slate-900 dark:text-white text-base">Announce College Event</h4>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-405 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">Event Title</label>
              <input
                type="text"
                required
                placeholder="E.g., CSE Techfest 2026 Coding Round"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 font-sans">Event Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all cursor-pointer font-sans"
              >
                <option value="workshop">Workshop</option>
                <option value="hackathon">Hackathon</option>
                <option value="cultural">Cultural Festival</option>
                <option value="sports">Sports Match</option>
                <option value="seminar">Seminar / Panel</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">Event Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all cursor-pointer font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550">BVRITH Campus Location / Aud</label>
              <input
                type="text"
                required
                placeholder="E.g., BVRITH CSE Seminar Hall, E-Block Lab 2"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-750 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-550 font-sans">Registration Link (Google Forms / Website URL)</label>
              <input
                type="url"
                placeholder="https://forms.gle/..."
                value={newRegLink}
                onChange={(e) => setNewRegLink(e.target.value)}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-755 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-550">Detailed Narrative / Rules</label>
            <textarea
              placeholder="Provide agenda, team limits, speaker bio, or certification benefits."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-205 dark:border-slate-755 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all h-20 resize-none font-sans"
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow cursor-pointer disabled:opacity-40"
            >
              {submitting ? 'Announcing event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      )}

      {/* Type Filters bar */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
        {['All', 'workshop', 'hackathon', 'cultural', 'sports', 'seminar'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${selectedType === type ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-350'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-450 italic">Syncing college events directory...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
          <p className="text-slate-400 font-medium">No events scheduled under this category.</p>
        </div>
      ) : viewMode === 'list' ? (
        // LIST VIEW of events (including details expanded cards)
        <div className="space-y-4" id="events-list-container">
          {filteredEvents.map((evt) => {
            const isCompleted = new Date(evt.date) < new Date();
            return (
              <div
                key={evt.id}
                className={`p-6 border rounded-2xl bg-white dark:bg-slate-900 transition-all ${
                  eventTypesColors[evt.type] ? 'border-l-[6px] ' + eventTypesColors[evt.type].split(' ')[0] : 'border-slate-200'
                } shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                id={`event-item-${evt.id}`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {evt.type}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <CalendarIcon className="h-3 w-3" /> {evt.date} {isCompleted && '(Passed)'}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-lg">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl font-sans leading-relaxed">
                    {evt.description || "No description provided for this BVRITH event."}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                    <MapPin className="h-3.5 w-3.5" /> <span>Venue: <b className="text-slate-700 dark:text-slate-300 font-medium">{evt.location}</b></span>
                  </div>
                </div>

                {evt.registrationLink && (
                  <a
                    href={evt.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-xl transition-all ${isCompleted ? 'bg-slate-100 hover:bg-slate-200 text-slate-450 dark:bg-slate-800 dark:text-slate-450' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'}`}
                  >
                    Register Slot <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // CALENDAR-STYLE VIEW (Syllabus monthly calendar showing active markers)
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="events-calendar-container">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <span className="text-xs text-slate-500">Highlighted days have scheduled activities</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 tracking-wider font-sans">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-20 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg"></div>;
              }

              const dayEvents = getEventsForDay(day);
              const isToday = day === today.getDate();

              return (
                <div
                  key={`day-${day}`}
                  className={`h-20 p-1 rounded-lg border text-left flex flex-col justify-between overflow-hidden select-none ${
                    isToday 
                      ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20' 
                      : dayEvents.length > 0 
                        ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/10 dark:bg-emerald-950/10' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30'
                  }`}
                >
                  <span className={`text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-450 dark:text-slate-400'}`}>
                    {day}
                  </span>

                  <div className="flex-1 overflow-y-auto space-y-0.5 mt-1">
                    {dayEvents.map(e => (
                      <div 
                        key={e.id}
                        className={`text-[9px] px-1 truncate rounded leading-normal border-l-2 font-medium ${
                          e.type === 'hackathon' 
                            ? 'bg-purple-50 text-purple-700 border-purple-500 dark:bg-purple-950/40 dark:text-purple-300' 
                            : e.type === 'cultural'
                              ? 'bg-rose-50 text-rose-700 border-rose-500 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
