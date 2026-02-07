import { useEffect, useState } from 'react';

export function useWASDMovement(enabled: boolean = true) {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!enabled) {
      setKeys({ forward: false, backward: false, left: false, right: false });
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          setKeys((prev) => ({ ...prev, forward: true }));
          break;
        case 's':
          setKeys((prev) => ({ ...prev, backward: true }));
          break;
        case 'a':
          setKeys((prev) => ({ ...prev, left: true }));
          break;
        case 'd':
          setKeys((prev) => ({ ...prev, right: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          setKeys((prev) => ({ ...prev, forward: false }));
          break;
        case 's':
          setKeys((prev) => ({ ...prev, backward: false }));
          break;
        case 'a':
          setKeys((prev) => ({ ...prev, left: false }));
          break;
        case 'd':
          setKeys((prev) => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);

  return keys;
}
