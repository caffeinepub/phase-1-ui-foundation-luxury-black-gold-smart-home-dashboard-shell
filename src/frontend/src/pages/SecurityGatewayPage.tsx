import { useState } from 'react';
import { useSecurityGateway } from '../hooks/useSecurityGateway';
import { QRScannerDialog } from '../components/security/QRScannerDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, Lock, QrCode, AlertCircle } from 'lucide-react';

export function SecurityGatewayPage() {
  const { validateAndUnlock } = useSecurityGateway();
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleUnlock = () => {
    setError(null);
    setIsUnlocking(true);

    // Small delay for UX
    setTimeout(() => {
      const result = validateAndUnlock(keyInput);
      
      if (!result.success) {
        setError(result.error || 'Invalid Secret Key');
        setIsUnlocking(false);
      }
      // If success, the app will automatically transition
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyInput.trim()) {
      handleUnlock();
    }
  };

  const handleScanSuccess = (data: string) => {
    setKeyInput(data);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-gold-glow">
            <Shield className="h-8 w-8 text-background" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            WESAAM SMART HOME
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Security Gateway
          </p>
        </div>

        {/* Entrance Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Enter Secret Key
            </CardTitle>
            <CardDescription>
              Enter your 10-character alphanumeric Secret Key to unlock access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Secret Key Input */}
            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key</Label>
              <Input
                id="secret-key"
                type="text"
                placeholder="e.g., W7X9-K2P4-Q1"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                disabled={isUnlocking}
                className="font-mono text-center text-lg tracking-wider"
                maxLength={13}
              />
              <p className="text-xs text-muted-foreground">
                10 alphanumeric characters (hyphens optional)
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleUnlock}
                disabled={!keyInput.trim() || isUnlocking}
                className="w-full"
                size="lg"
              >
                {isUnlocking ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-pulse" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Unlock
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowScanner(true)}
                disabled={isUnlocking}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR
              </Button>
            </div>

            {/* Help Text */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">First time?</strong> Your Secret Key is a unique 10-character code. 
                You can scan a QR code or enter it manually.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2026. Built with love using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">caffeine.ai</a></p>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <QRScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
