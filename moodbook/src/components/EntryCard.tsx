import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, BookOpen, Lightbulb, Bell, Target } from 'lucide-react';
import { type JournalEntry } from '@/lib/storage';
import { format } from 'date-fns';

interface EntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const typeIcons = {
  casual: BookOpen,
  fact: Lightbulb,
  reminder: Bell,
  goal: Target,
};

const typeColors = {
  casual: 'bg-primary/10 text-primary border-primary/20',
  fact: 'bg-accent/10 text-accent-foreground border-accent/20',
  reminder: 'bg-secondary text-secondary-foreground',
  goal: 'bg-muted text-muted-foreground',
};

export const EntryCard = ({ entry, onEdit, onDelete }: EntryCardProps) => {
  const Icon = typeIcons[entry.type];
  
  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1">{entry.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={typeColors[entry.type]}>
                <Icon className="h-3 w-3 mr-1" />
                {entry.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(entry.date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(entry)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
          {entry.content}
        </p>
      </CardContent>
    </Card>
  );
};