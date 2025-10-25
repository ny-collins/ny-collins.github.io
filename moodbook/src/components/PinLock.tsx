import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { verifyPin, hasPin } from '@/lib/storage';
import { toast } from 'sonner';
import journalLogo from '@/assets/journal-logo.png';

interface PinLockProps {
  onUnlock: () => void;
}

export const PinLock = ({ onUnlock }: PinLockProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Auto-unlock if no PIN is set
    if (!hasPin()) {
      onUnlock();
    }
  }, [onUnlock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verifyPin(pin)) {
      setError(false);
      toast.success('Welcome back!');
      onUnlock();
    } else {
      setError(true);
      setPin('');
      toast.error('Incorrect PIN');
    }
  };

  if (!hasPin()) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-8 space-y-6 shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <img src={journalLogo} alt="Journal" className="w-20 h-20" />
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">My Journal</h1>
            <p className="text-muted-foreground text-sm">Enter your PIN to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError(false);
              }}
              className={`pl-10 text-center text-lg tracking-widest ${
                error ? 'border-destructive' : ''
              }`}
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" disabled={pin.length < 4}>
            Unlock
          </Button>
        </form>
      </Card>
    </div>
  );
};