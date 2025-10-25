import { useState, useEffect } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import { Journal } from '../lib/superbase';
import { MOODS, MOOD_THEMES, Mood } from '../types/mood';
import { ENTRY_TYPES, EntryType } from '../types/entryType';
import { formatDate } from '../utils/dateUtils';

interface JournalEditorProps {
  date: Date;
  existingEntry: Journal | null;
  onSave: (title: string, content: string, mood: Mood, entryType: EntryType) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  currentMood: Mood;
  onMoodChange: (mood: Mood) => void;
}

export default function JournalEditor({
  date,
  existingEntry,
  onSave,
  onDelete,
  onClose,
  currentMood,
  onMoodChange
}: JournalEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>(currentMood);
  const [entryType, setEntryType] = useState<EntryType>('casual');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title);
      setContent(existingEntry.content);
      setMood(existingEntry.mood as Mood);
      setEntryType((existingEntry.entry_type as EntryType) || 'casual');
    } else {
      setTitle('');
      setContent('');
      setMood(currentMood);
      setEntryType('casual');
    }
  }, [existingEntry, date, currentMood]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    setSaving(true);
    await onSave(title, content, mood, entryType);
    onMoodChange(mood);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!existingEntry || !confirm('Are you sure you want to delete this entry?')) return;

    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  const handleMoodChange = (newMood: Mood) => {
    setMood(newMood);
  };

  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-800">{dateString}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Close editor"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling?
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {MOODS.map((m) => {
            const theme = MOOD_THEMES[m];
            return (
              <button
                key={m}
                onClick={() => handleMoodChange(m)}
                className={`
                  px-3 py-2 rounded-lg text-xs md:text-sm font-medium
                  transition-all duration-200
                  ${mood === m
                    ? `${theme.primary} text-white shadow-md scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {theme.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entry Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.values(ENTRY_TYPES).map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setEntryType(type.value)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${entryType === type.value
                    ? `${type.bgColor} ${type.color} ring-2 ring-offset-1 ring-current shadow-md`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your entry a title..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="flex-1 flex flex-col mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Your thoughts
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your day..."
          className="flex-1 min-h-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || (!title.trim() && !content.trim())}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Entry'}
        </button>

        {existingEntry && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition disabled:opacity-50"
          >
            {deleting ? <span className="w-5 h-5 inline-block" /> : <Trash2 className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}