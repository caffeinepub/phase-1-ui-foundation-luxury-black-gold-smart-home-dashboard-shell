import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useEffect, useRef } from 'react';

export interface UseAutoProvisionUserReturn {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  retry: () => void;
}

/**
 * Hook that auto-provisions authenticated users with the #user role.
 * Runs once per actor creation when user is authenticated.
 * Idempotent - safe to call multiple times.
 */
export function useAutoProvisionUser(): UseAutoProvisionUserReturn {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const hasRunRef = useRef(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      
      // Call the backend provisioning method
      await actor.initializeAccess();
    },
    retry: false,
  });

  // Auto-trigger provisioning once when actor is ready and user is authenticated
  useEffect(() => {
    const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
    const shouldProvision = 
      isAuthenticated && 
      !!actor && 
      !actorFetching && 
      !hasRunRef.current &&
      mutation.status === 'idle';

    if (shouldProvision) {
      hasRunRef.current = true;
      mutation.mutate();
    }
  }, [actor, actorFetching, identity, mutation]);

  // Reset hasRunRef when actor changes (new session)
  useEffect(() => {
    hasRunRef.current = false;
  }, [actor]);

  // Map React Query's 'pending' status to 'loading' for consistency
  const status = mutation.status === 'pending' ? 'loading' : mutation.status;

  return {
    status,
    error: mutation.error,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    retry: () => {
      hasRunRef.current = false;
      mutation.reset();
      mutation.mutate();
    },
  };
}
