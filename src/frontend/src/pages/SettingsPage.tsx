import { useState } from 'react';
import { Palette, Shield, Eye, EyeOff, Copy, Check, Zap } from 'lucide-react';
import { useSecurityGateway } from '../hooks/useSecurityGateway';
import { useCustomSidebarAction, type CustomActionType } from '../hooks/useCustomSidebarAction';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const ACTION_OPTIONS: { value: CustomActionType; label: string }[] = [
  { value: 'navigate-dashboard', label: 'Navigate to Dashboard' },
  { value: 'navigate-rooms', label: 'Navigate to Rooms' },
  { value: 'navigate-settings', label: 'Navigate to Settings' },
  { value: 'lock-session', label: 'Lock the app session' },
];

export function SettingsPage() {
  const { secretKey } = useSecurityGateway();
  const { config, setConfig } = useCustomSidebarAction();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyKey = async () => {
    if (secretKey) {
      try {
        await navigator.clipboard.writeText(secretKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleCustomActionNameChange = (name: string) => {
    setConfig({ ...config, name });
  };

  const handleCustomActionTypeChange = (action: CustomActionType) => {
    setConfig({ ...config, action });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="mt-2 text-muted-foreground">
          Configure your smart home preferences and system settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Appearance */}
        <GlassCard disableTilt>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground">Currently using Dark Mode (Premium Black & Gold)</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-gold-glow-sm" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Accent Color</p>
                <p className="text-sm text-muted-foreground">Metallic Gold</p>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Custom Sidebar Action */}
        <GlassCard disableTilt>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Custom Sidebar Action</CardTitle>
                <CardDescription>Configure your quick action button in the sidebar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action-name">Button Name</Label>
              <Input
                id="action-name"
                value={config.name}
                onChange={(e) => handleCustomActionNameChange(e.target.value)}
                placeholder="Enter button name"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                This name will appear on the custom action button in the sidebar
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="action-type">Action</Label>
              <Select value={config.action} onValueChange={handleCustomActionTypeChange}>
                <SelectTrigger id="action-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose what happens when you click the custom action button
              </p>
            </div>
          </CardContent>
        </GlassCard>

        {/* Security */}
        <GlassCard disableTilt>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage access control and authentication</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Secret Key Display */}
            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground">Secret Key</p>
                <p className="text-sm text-muted-foreground">Your unique access key for this smart home</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={secretKey || ''}
                    readOnly
                    className="font-mono pr-10"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  disabled={!secretKey}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {copied && (
                <p className="text-xs text-green-500">Secret Key copied to clipboard!</p>
              )}
            </div>

            <Separator />

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                Keep your Secret Key safe. You'll need it to access your smart home system.
                Store it securely or scan the QR code for quick access.
              </p>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
}
