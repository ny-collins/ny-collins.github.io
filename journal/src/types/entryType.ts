import { BookOpen, Lightbulb, Bell, Target } from 'lucide-react';

export type EntryType = 'facts' | 'reminder' | 'goal' | 'casual';

export interface EntryTypeInfo {
  value: EntryType;
  label: string;
  description: string;
  icon: typeof BookOpen;
  color: string;
  bgColor: string;
}

export const ENTRY_TYPES: Record<EntryType, EntryTypeInfo> = {
  facts: {
    value: 'facts',
    label: 'Facts & Learning',
    description: 'Things I learned today',
    icon: Lightbulb,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  reminder: {
    value: 'reminder',
    label: 'Reminder',
    description: 'Things to remember',
    icon: Bell,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  goal: {
    value: 'goal',
    label: 'Goal',
    description: 'Goals and aspirations',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  casual: {
    value: 'casual',
    label: 'Casual Writing',
    description: 'General thoughts and reflections',
    icon: BookOpen,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  }
};

export const ENTRY_TYPE_LIST: EntryType[] = ['facts', 'reminder', 'goal', 'casual'];