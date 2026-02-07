import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface ProvisioningStateCardProps {
  state: 'loading' | 'error' | 'setup-required';
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * Reusable glass-themed state card for provisioning-related UI states.
 * Provides consistent layout, typography, spacing, and button styling.
 */
export function ProvisioningStateCard({
  state,
  message,
  onRetry,
  isRetrying = false,
}: ProvisioningStateCardProps) {
  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
      case 'error':
      case 'setup-required':
        return <AlertCircle className="h-8 w-8 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'loading':
        return 'Setting Up Your Account';
      case 'error':
        return 'Setup Error';
      case 'setup-required':
        return 'Setup Required';
    }
  };

  const getDefaultMessage = () => {
    switch (state) {
      case 'loading':
        return 'Please wait while we prepare your account...';
      case 'error':
        return 'Failed to initialize your account. Please try again.';
      case 'setup-required':
        return 'Your account setup is not complete. Please retry the setup process.';
    }
  };

  return (
    <GlassCard disableTilt>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{getTitle()}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {message || getDefaultMessage()}
            </p>
          </div>
          {state !== 'loading' && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="shadow-gold-glow-sm gap-2"
              disabled={isRetrying}
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry Setup'}
            </Button>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
