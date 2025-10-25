import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Journal } from '../lib/supabase';
import { ENTRY_TYPES, EntryType } from '../types/entryType';
import { MOOD_THEMES, Mood } from '../types/mood';

interface EntryListProps {
  journals: Journal[];
  onEntrySelect: (date: string) => void;
}

export default function EntryList({ journals, onEntrySelect }: EntryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EntryType | 'all'>('all');

  const filteredJournals = journals.filter(journal => {
    const matchesSearch =
      journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || journal.entry_type === selectedType;

    return matchesSearch && matchesType;
  });

  const formatEntryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-800">All Entries</h3>
        <span className="text-sm text-gray-500">{filteredJournals.length} entries</span>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${selectedType === 'all'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            All
          </button>
          {Object.values(ENTRY_TYPES).map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${selectedType === type.value
                    ? `${type.bgColor} ${type.color} shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-3 h-3" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredJournals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedType !== 'all' ? 'No entries match your filters' : 'No entries yet'}
          </div>
        ) : (
          filteredJournals.map((journal) => {
            const entryTypeInfo = ENTRY_TYPES[journal.entry_type as EntryType];
            const EntryIcon = entryTypeInfo?.icon;
            const moodTheme = MOOD_THEMES[journal.mood as Mood];

            return (
              <button
                key={journal.id}
                onClick={() => onEntrySelect(journal.entry_date)}
                className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all hover:shadow-md group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {EntryIcon && (
                      <div className={`p-1.5 rounded ${entryTypeInfo.bgColor}`}>
                        <EntryIcon className={`w-4 h-4 ${entryTypeInfo.color}`} />
                      </div>
                    )}
                    <h4 className="font-semibold text-gray-800 group-hover:text-amber-700 transition">
                      {journal.title || 'Untitled'}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatEntryDate(journal.entry_date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {truncateContent(journal.content)}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${moodTheme?.primary} text-white
                  `}>
                    {moodTheme?.name || 'Neutral'}
                  </span>
                  {entryTypeInfo && (
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${entryTypeInfo.bgColor} ${entryTypeInfo.color}
                    `}>
                      {entryTypeInfo.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}