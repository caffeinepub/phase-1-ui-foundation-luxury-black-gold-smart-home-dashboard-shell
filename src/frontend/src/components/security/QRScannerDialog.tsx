import { useState, useEffect } from 'react';
import { useQRScanner } from '../../qr-code/useQRScanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { QrCode, X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (data: string) => void;
}

export function QRScannerDialog({ open, onOpenChange, onScanSuccess }: QRScannerDialogProps) {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: 'environment',
    scanInterval: 100,
    maxResults: 1,
  });

  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start scanning when dialog opens
  useEffect(() => {
    if (open && !hasStarted && canStartScanning) {
      startScanning().then((success) => {
        if (success) {
          setHasStarted(true);
        }
      });
    }
  }, [open, hasStarted, canStartScanning, startScanning]);

  // Handle successful scan
  useEffect(() => {
    if (qrResults.length > 0) {
      const latestResult = qrResults[0];
      onScanSuccess(latestResult.data);
      stopScanning();
      onOpenChange(false);
      setHasStarted(false);
    }
  }, [qrResults, onScanSuccess, stopScanning, onOpenChange]);

  // Cleanup on close
  useEffect(() => {
    if (!open && isActive) {
      stopScanning();
      setHasStarted(false);
    }
  }, [open, isActive, stopScanning]);

  const handleClose = () => {
    stopScanning();
    setHasStarted(false);
    onOpenChange(false);
  };

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isSupported === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Scanner
            </DialogTitle>
            <DialogDescription>
              Camera not supported in this browser
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser does not support camera access. Please enter the Secret Key manually or try a different browser.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Position the QR code within the camera frame
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 animate-pulse text-primary" />
                  <p className="text-sm text-muted-foreground">Initializing camera...</p>
                </div>
              </div>
            )}

            {/* Scanning Indicator */}
            {isScanning && !isLoading && (
              <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
                Scanning...
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.type === 'permission' && 'Camera permission denied. Please allow camera access and try again.'}
                {error.type === 'not-found' && 'No camera found. Please connect a camera and try again.'}
                {error.type === 'not-supported' && 'Camera not supported in this browser.'}
                {error.type === 'unknown' && `Camera error: ${error.message}`}
              </AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              {!isActive && !isLoading && (
                <Button
                  onClick={() => startScanning()}
                  disabled={!canStartScanning}
                  variant="default"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              )}
              
              {isMobile && isActive && (
                <Button
                  onClick={() => switchCamera()}
                  disabled={isLoading}
                  variant="outline"
                >
                  Switch Camera
                </Button>
              )}
            </div>

            <Button onClick={handleClose} variant="ghost">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            The Secret Key will be automatically filled when a QR code is detected
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
