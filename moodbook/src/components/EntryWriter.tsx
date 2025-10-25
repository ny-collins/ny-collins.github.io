import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { type JournalEntry, type EntryType, saveEntry } from '@/lib/storage';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EntryWriterProps {
  entry: JournalEntry | null;
  title: string;
  type: EntryType;
  onSave: () => void;
  onCancel: () => void;
}

export const EntryWriter = ({ entry, title, type, onSave, onCancel }: EntryWriterProps) => {
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
      setDate(new Date(entry.date));
    } else {
      setContent('');
      setDate(new Date());
    }
  }, [entry]);

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    const now = new Date().toISOString();
    const journalEntry: JournalEntry = {
      id: entry?.id || crypto.randomUUID(),
      title,
      content: content.trim(),
      type,
      date: format(date, 'yyyy-MM-dd'),
      createdAt: entry?.createdAt || now,
      updatedAt: now,
    };

    saveEntry(journalEntry);
    toast.success(entry ? 'Entry updated' : 'Entry created');
    onSave();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{entry ? 'Edit Entry' : 'New Entry'}</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} disabled className="bg-muted" />
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            className="min-h-[400px] resize-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>
    </Card>
  );
};