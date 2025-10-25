export type Mood = 'jovial' | 'sombre' | 'serious' | 'bored' | 'excited' | 'calm' | 'neutral';

export interface MoodTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
}

export const MOOD_THEMES: Record<Mood, MoodTheme> = {
  jovial: {
    name: 'Jovial',
    primary: 'bg-yellow-400',
    secondary: 'bg-orange-300',
    accent: 'bg-pink-400',
    bg: 'bg-gradient-to-br from-yellow-100 to-orange-200',
    text: 'text-yellow-900',
    border: 'border-yellow-500'
  },
  sombre: {
    name: 'Sombre',
    primary: 'bg-slate-600',
    secondary: 'bg-gray-500',
    accent: 'bg-slate-700',
    bg: 'bg-gradient-to-br from-gray-300 to-slate-400',
    text: 'text-slate-900',
    border: 'border-slate-600'
  },
  serious: {
    name: 'Serious',
    primary: 'bg-blue-700',
    secondary: 'bg-cyan-600',
    accent: 'bg-blue-800',
    bg: 'bg-gradient-to-br from-blue-100 to-cyan-200',
    text: 'text-blue-900',
    border: 'border-blue-700'
  },
  bored: {
    name: 'Bored',
    primary: 'bg-gray-400',
    secondary: 'bg-neutral-400',
    accent: 'bg-gray-500',
    bg: 'bg-gradient-to-br from-gray-200 to-neutral-300',
    text: 'text-gray-800',
    border: 'border-gray-500'
  },
  excited: {
    name: 'Excited',
    primary: 'bg-rose-500',
    secondary: 'bg-red-400',
    accent: 'bg-rose-600',
    bg: 'bg-gradient-to-br from-rose-200 to-red-300',
    text: 'text-rose-900',
    border: 'border-rose-600'
  },
  calm: {
    name: 'Calm',
    primary: 'bg-teal-400',
    secondary: 'bg-emerald-400',
    accent: 'bg-teal-500',
    bg: 'bg-gradient-to-br from-teal-100 to-emerald-200',
    text: 'text-teal-900',
    border: 'border-teal-500'
  },
  neutral: {
    name: 'Neutral',
    primary: 'bg-amber-500',
    secondary: 'bg-orange-400',
    accent: 'bg-amber-600',
    bg: 'bg-gradient-to-br from-amber-100 to-orange-200',
    text: 'text-amber-900',
    border: 'border-amber-500'
  }
};

export const MOODS: Mood[] = Object.keys(MOOD_THEMES) as Mood[];