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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { getSettings, saveSettings, setPin, clearPin, hasPin } from '@/lib/storage';
import { toast } from 'sonner';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  const settings = getSettings();
  const [isPinEnabled, setIsPinEnabled] = useState(settings.isPinEnabled || hasPin());
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSavePin = () => {
    if (!isPinEnabled) {
      clearPin();
      const updatedSettings = { ...getSettings(), isPinEnabled: false };
      saveSettings(updatedSettings);
      toast.success('PIN protection disabled');
      return;
    }

    if (pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setPin(pin);
    const updatedSettings = { ...getSettings(), isPinEnabled: true };
    saveSettings(updatedSettings);
    toast.success('PIN protection enabled');
    setPinValue('');
    setConfirmPin('');
  };

  const handlePinToggle = (enabled: boolean) => {
    setIsPinEnabled(enabled);
    if (!enabled) {
      clearPin();
      const updatedSettings = { ...getSettings(), isPinEnabled: false };
      saveSettings(updatedSettings);
      toast.success('PIN protection disabled');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Security</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <Label htmlFor="pin-toggle">PIN Protection</Label>
                <p className="text-sm text-muted-foreground">
                  Secure your journal with a PIN
                </p>
              </div>
              <Switch
                id="pin-toggle"
                checked={isPinEnabled}
                onCheckedChange={handlePinToggle}
              />
            </div>

            {isPinEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="pin">New PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter PIN (min 4 digits)"
                    value={pin}
                    onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-pin">Confirm PIN</Label>
                  <Input
                    id="confirm-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <Button onClick={handleSavePin} className="w-full">
                  Save PIN
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2">About</h3>
            <p className="text-sm text-muted-foreground">
              My Journal - A personal journaling app
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              All data is stored locally on your device
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};