import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SecurityGatewayContextValue {
  secretKey: string | null;
  isUnlocked: boolean;
  validateAndUnlock: (key: string) => { success: boolean; error?: string };
  setSecretKey: (key: string) => void;
  lock: () => void;
}

const SecurityGatewayContext = createContext<SecurityGatewayContextValue | null>(null);

// Validate Secret Key: exactly 10 alphanumeric characters (hyphens ignored)
function validateSecretKey(key: string): { valid: boolean; error?: string } {
  if (!key) {
    return { valid: false, error: 'Secret Key is required' };
  }
  
  // Remove hyphens for validation
  const cleanKey = key.replace(/-/g, '');
  
  // Check if exactly 10 alphanumeric characters
  if (cleanKey.length !== 10) {
    return { valid: false, error: 'Secret Key must be exactly 10 alphanumeric characters' };
  }
  
  // Check if only alphanumeric
  if (!/^[A-Za-z0-9]+$/.test(cleanKey)) {
    return { valid: false, error: 'Secret Key must contain only letters and numbers' };
  }
  
  return { valid: true };
}

export function SecurityGatewayProvider({ children }: { children: ReactNode }) {
  // Initialize state synchronously from storage to prevent flash
  const [secretKey, setSecretKeyState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wesaam_secret_key');
    } catch {
      return null;
    }
  });
  
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('wesaam_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const setSecretKey = useCallback((key: string) => {
    try {
      localStorage.setItem('wesaam_secret_key', key);
      setSecretKeyState(key);
    } catch (error) {
      console.error('Failed to save secret key:', error);
    }
  }, []);

  const validateAndUnlock = useCallback((key: string): { success: boolean; error?: string } => {
    const validation = validateSecretKey(key);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Save the key and unlock
    setSecretKey(key);
    setIsUnlocked(true);
    
    try {
      sessionStorage.setItem('wesaam_unlocked', 'true');
    } catch (error) {
      console.error('Failed to save unlock state:', error);
    }
    
    return { success: true };
  }, [setSecretKey]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('wesaam_unlocked');
    } catch (error) {
      console.error('Failed to clear unlock state:', error);
    }
  }, []);

  return (
    <SecurityGatewayContext.Provider
      value={{
        secretKey,
        isUnlocked,
        validateAndUnlock,
        setSecretKey,
        lock,
      }}
    >
      {children}
    </SecurityGatewayContext.Provider>
  );
}

export function useSecurityGateway() {
  const context = useContext(SecurityGatewayContext);
  if (!context) {
    throw new Error('useSecurityGateway must be used within SecurityGatewayProvider');
  }
  return context;
}
