import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAutoProvisionUser } from '../../hooks/useAutoProvisionUser';

interface AccessIssueCalloutProps {
  message: string;
  onRetryComplete?: () => void;
}

/**
 * Reusable callout for authorization/provisioning failures.
 * Shows a clear English message and provides a "Retry Setup" action.
 */
export function AccessIssueCallout({ message, onRetryComplete }: AccessIssueCalloutProps) {
  const { retry, isLoading } = useAutoProvisionUser();

  const handleRetry = async () => {
    retry();
    // Give a small delay for the provisioning to complete
    setTimeout(() => {
      if (onRetryComplete) {
        onRetryComplete();
      }
    }, 500);
  };

  return (
    <Alert variant="destructive" className="glass-surface border-destructive/60">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Access Issue</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{message}</p>
        <Button
          onClick={handleRetry}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Setting up...' : 'Retry Setup'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
