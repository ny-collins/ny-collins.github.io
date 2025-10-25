import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Lightbulb, Bell, Target } from 'lucide-react';
import { type EntryType } from '@/lib/storage';

interface NewEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, type: EntryType) => void;
}

const entryTypes: { value: EntryType; label: string; icon: typeof BookOpen }[] = [
  { value: 'casual', label: 'Casual', icon: BookOpen },
  { value: 'fact', label: 'Fact', icon: Lightbulb },
  { value: 'reminder', label: 'Reminder', icon: Bell },
  { value: 'goal', label: 'Goal', icon: Target },
];

export const NewEntryDialog = ({ isOpen, onClose, onConfirm }: NewEntryDialogProps) => {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<EntryType>('casual');

  const handleConfirm = () => {
    if (!title.trim()) return;
    onConfirm(title, selectedType);
    setTitle('');
    setSelectedType('casual');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title..."
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {entryTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setSelectedType(type.value)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};