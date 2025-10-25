import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette } from 'lucide-react';
import { getSettings, saveSettings, type AppSettings } from '@/lib/storage';
import { toast } from 'sonner';

const themes = [
  { value: 'calm', label: 'Calm', description: 'Peaceful & centered' },
  { value: 'sombre', label: 'Sombre', description: 'Deep & contemplative' },
  { value: 'jovial', label: 'Jovial', description: 'Bright & energetic' },
  { value: 'serious', label: 'Serious', description: 'Focused & professional' },
  { value: 'bored', label: 'Bored', description: 'Neutral & relaxed' },
  { value: 'mad', label: 'Mad', description: 'Intense & passionate' },
] as const;

export const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState<AppSettings['theme']>(getSettings().theme);

  const handleThemeChange = (theme: AppSettings['theme']) => {
    const settings = getSettings();
    saveSettings({ ...settings, theme });
    setCurrentTheme(theme);
    toast.success(`Theme changed to ${theme}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Change mood theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className={currentTheme === theme.value ? 'bg-accent' : ''}
          >
            <div className="flex flex-col">
              <span className="font-medium">{theme.label}</span>
              <span className="text-xs text-muted-foreground">{theme.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};