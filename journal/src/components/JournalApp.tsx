import { useState, useEffect } from 'react';
import { LogOut, BookOpen, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Journal } from '../lib/superbase';
import Calendar from './Calendar';
import JournalEditor from './JournalEditor';
import EntryList from './EntryList';
import { formatDate } from '../utils/dateUtils';
import { Mood, MOOD_THEMES } from '../types/mood';
import { EntryType } from '../types/entryType';

export default function JournalApp() {
  const { user, signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [journals, setJournals] = useState<Journal[]>([]);
  const [allJournals, setAllJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState<Mood>('neutral');
  const [showEntryList, setShowEntryList] = useState(false);

  const theme = MOOD_THEMES[currentMood];

  useEffect(() => {
    if (user) {
      loadJournals();
      loadAllJournals();
    }
  }, [user, currentYear, currentMonth]);

  const loadJournals = async () => {
    setLoading(true);

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .gte('entry_date', formatDate(startDate))
      .lte('entry_date', formatDate(endDate))
      .order('entry_date', { ascending: false });

    if (!error && data) {
      setJournals(data);
    }

    setLoading(false);
  };

  const loadAllJournals = async () => {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .order('entry_date', { ascending: false });

    if (!error && data) {
      setAllJournals(data);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setSelectedDate(null);
  };

  const handleSaveEntry = async (title: string, content: string, mood: Mood, entryType: EntryType) => {
    if (!selectedDate || !user) return;

    const dateStr = formatDate(selectedDate);
    const existingEntry = journals.find(j => j.entry_date === dateStr);

    if (existingEntry) {
      const { error } = await supabase
        .from('journals')
        .update({
          title,
          content,
          mood,
          entry_type: entryType,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id);

      if (!error) {
        await loadJournals();
        await loadAllJournals();
      }
    } else {
      const { error } = await supabase
        .from('journals')
        .insert({
          user_id: user.id,
          title,
          content,
          mood,
          entry_type: entryType,
          entry_date: dateStr
        });

      if (!error) {
        await loadJournals();
        await loadAllJournals();
      }
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedDate) return;

    const dateStr = formatDate(selectedDate);
    const existingEntry = journals.find(j => j.entry_date === dateStr);

    if (existingEntry) {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', existingEntry.id);

      if (!error) {
        setSelectedDate(null);
        await loadJournals();
        await loadAllJournals();
      }
    }
  };

  const currentEntry = selectedDate
    ? journals.find(j => j.entry_date === formatDate(selectedDate))
    : null;

  if (currentEntry && currentEntry.mood !== currentMood) {
    setCurrentMood(currentEntry.mood as Mood);
  }

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500 p-4`}>
      <div className="max-w-7xl mx-auto">
        <header className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Journal</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEntryList(!showEntryList)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg transition"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{showEntryList ? 'Hide' : 'Show'} All</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {showEntryList ? (
          <EntryList
            journals={allJournals}
            onEntrySelect={(dateStr) => {
              const date = new Date(dateStr);
              setCurrentYear(date.getFullYear());
              setCurrentMonth(date.getMonth());
              setSelectedDate(date);
              setShowEntryList(false);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:sticky lg:top-4 lg:self-start">
              <Calendar
                year={currentYear}
                month={currentMonth}
                selectedDate={selectedDate}
                journals={journals}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />
            </div>

            <div>
            {selectedDate ? (
              <JournalEditor
                date={selectedDate}
                existingEntry={currentEntry || null}
                onSave={handleSaveEntry}
                onDelete={handleDeleteEntry}
                onClose={() => setSelectedDate(null)}
                currentMood={currentMood}
                onMoodChange={setCurrentMood}
              />
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500 font-medium">
                    Select a date to start journaling
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Click on any day in the calendar to create or view an entry
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}