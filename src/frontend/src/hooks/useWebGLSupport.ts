import { useState, useEffect } from 'react';

interface WebGLSupportResult {
  isSupported: boolean | null;
  error: string | null;
}

export function useWebGLSupport(): WebGLSupportResult {
  const [result, setResult] = useState<WebGLSupportResult>({
    isSupported: null,
    error: null,
  });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setResult({
          isSupported: false,
          error: 'WebGL is not supported in your browser. Please try a different browser or update your graphics drivers.',
        });
      } else {
        setResult({
          isSupported: true,
          error: null,
        });
      }
    } catch (e) {
      setResult({
        isSupported: false,
        error: 'Failed to initialize WebGL. Your browser or device may not support 3D graphics.',
      });
    }
  }, []);

  return result;
}
