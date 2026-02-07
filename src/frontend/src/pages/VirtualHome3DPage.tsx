import { useEffect, useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { VirtualHomeScene } from '../components/virtual-home/VirtualHomeScene';
import { VirtualHome2DMap } from '../components/virtual-home/VirtualHome2DMap';
import { VirtualHomeErrorBoundary } from '../components/virtual-home/VirtualHomeErrorBoundary';
import { VirtualHomeModeToggle } from '../components/virtual-home/VirtualHomeModeToggle';
import { RoomSelector } from '../components/virtual-home/RoomSelector';
import { SmartRoomSidebar } from '../components/virtual-home/SmartRoomSidebar';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { useGetAllRooms, useGetDevicesByRoom } from '../hooks/useQueries';
import type { RoomId } from '../backend';

interface VirtualHome3DPageProps {
  onExit: () => void;
}

type ViewMode = '2d' | '3d';

/**
 * Full-screen dual-mode virtual home with 2D floorplan and 3D walkthrough, room selector, smart sidebar, and 3D surface-click room selection.
 */
export function VirtualHome3DPage({ onExit }: VirtualHome3DPageProps) {
  const [renderError, setRenderError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [activeRoomId, setActiveRoomId] = useState<RoomId | null>(null);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [teleportTarget, setTeleportTarget] = useState<RoomId | null>(null);

  const { isSupported: webglSupported, error: webglError } = useWebGLSupport();
  
  // Fetch all rooms for selector and 2D map
  const { data: rooms = [], isLoading: roomsLoading } = useGetAllRooms();
  
  // Fetch devices for active room (for sidebar) - only when activeRoomId is set
  const { data: activeRoomDevices = [] } = useGetDevicesByRoom(
    activeRoomId !== null ? activeRoomId : undefined as any
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showRoomSelector) {
          setShowRoomSelector(false);
        } else if (activeRoomId !== null) {
          setActiveRoomId(null);
        } else {
          onExit();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onExit, showRoomSelector, activeRoomId]);

  // Auto-open room selector when entering 3D mode
  useEffect(() => {
    if (viewMode === '3d' && !showRoomSelector && activeRoomId === null) {
      setShowRoomSelector(true);
    }
  }, [viewMode, showRoomSelector, activeRoomId]);

  const handleRenderError = (error: string) => {
    console.error('3D Render Error:', error);
    setRenderError(error);
  };

  const handleRoomSelect = (roomId: RoomId) => {
    setActiveRoomId(roomId);
    if (viewMode === '3d') {
      setTeleportTarget(roomId);
    }
    setShowRoomSelector(false);
  };

  const handleSurfaceSelectRoom = (roomId: RoomId) => {
    setActiveRoomId(roomId);
  };

  const handleCloseSidebar = () => {
    setActiveRoomId(null);
  };

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Keep active room when switching modes
  };

  const handleClearSelection = () => {
    setActiveRoomId(null);
  };

  // Determine if we're still loading prerequisites
  const isLoading = webglSupported === null || roomsLoading;
  
  // Determine if we should show the scene
  const canRenderScene = webglSupported === true && !renderError;

  // Modal open state for joystick disable
  const isModalOpen = showRoomSelector;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Exit Button - always visible */}
      <Button
        onClick={onExit}
        variant="outline"
        size="icon"
        className="absolute left-4 top-4 z-50 glass-surface border-primary/60 hover:bg-primary/20"
        aria-label="Exit Virtual Home"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Mode Toggle - visible when scene is ready */}
      {canRenderScene && !isLoading && (
        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2">
          <VirtualHomeModeToggle
            mode={viewMode}
            onChange={handleModeChange}
          />
        </div>
      )}

      {/* Room Selector Button - visible in 3D mode */}
      {canRenderScene && !isLoading && viewMode === '3d' && (
        <Button
          onClick={() => setShowRoomSelector(true)}
          className="absolute right-4 top-4 z-50 glass-surface border-primary/60 bg-primary/10 hover:bg-primary/20"
          aria-label="Select Room"
        >
          Select Room
        </Button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="glass-surface max-w-md rounded-lg border border-primary/50 p-8 text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Loading Virtual Home
            </h2>
            <p className="text-sm text-muted-foreground">
              Initializing navigation system...
            </p>
          </div>
        </div>
      )}

      {/* WebGL Not Supported */}
      {!isLoading && webglSupported === false && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="glass-surface max-w-md rounded-lg border border-destructive/50 p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              WebGL Not Supported
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {webglError || 'Your browser does not support WebGL, which is required for 3D graphics.'}
            </p>
            <Button onClick={onExit} variant="default" className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Render Error Fallback */}
      {!isLoading && renderError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/90">
          <div className="glass-surface max-w-md rounded-lg border border-destructive/50 p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              3D Rendering Error
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {renderError}
            </p>
            <Button onClick={onExit} variant="default" className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* 2D Map View */}
      {canRenderScene && !isLoading && viewMode === '2d' && (
        <VirtualHome2DMap
          rooms={rooms}
          activeRoomId={activeRoomId}
          onRoomSelect={handleRoomSelect}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* 3D Scene - only render when ready and in 3D mode */}
      {canRenderScene && !isLoading && viewMode === '3d' && (
        <div className="h-full w-full">
          <VirtualHomeErrorBoundary onError={handleRenderError}>
            <VirtualHomeScene 
              rooms={rooms}
              activeRoomId={activeRoomId}
              teleportTarget={teleportTarget}
              onTeleportComplete={() => setTeleportTarget(null)}
              onSurfaceSelectRoom={handleSurfaceSelectRoom}
              onError={handleRenderError}
            />
          </VirtualHomeErrorBoundary>
        </div>
      )}

      {/* Room Selector Dialog */}
      {showRoomSelector && (
        <RoomSelector
          rooms={rooms}
          open={showRoomSelector}
          onClose={() => setShowRoomSelector(false)}
          onSelectRoom={handleRoomSelect}
        />
      )}

      {/* Smart Room Sidebar */}
      {activeRoomId !== null && (
        <SmartRoomSidebar
          roomId={activeRoomId}
          devices={activeRoomDevices}
          onClose={handleCloseSidebar}
        />
      )}
    </div>
  );
}
