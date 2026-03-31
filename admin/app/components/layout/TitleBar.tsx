import { Minus, Square, X } from 'lucide-react';
import { Button } from '../ui/button';
import { isElectron } from '../../../lib/platform';

/**
 * Custom TitleBar for Electron
 * Provides window controls (minimize, maximize, close)
 * Only renders in Electron mode
 */
export function TitleBar() {
  // Không render nếu đang chạy web mode
  if (!isElectron()) {
    return null;
  }

  const handleMinimize = () => {
    window.conveyor?.window.windowMinimize();
  };

  const handleMaximize = () => {
    window.conveyor?.window.windowMaximizeToggle();
  };

  const handleClose = () => {
    window.conveyor?.window.windowClose();
  };

  return (
    <div className="flex h-8 items-center justify-between bg-card border-b border-border select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Left - App Title */}
      <div className="flex items-center px-4">
        <span className="text-xs font-medium text-muted-foreground">
          LinVNix Admin
        </span>
      </div>

      {/* Right - Window Controls */}
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="h-8 w-10 rounded-none hover:bg-accent"
          aria-label="Minimize"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMaximize}
          className="h-8 w-10 rounded-none hover:bg-accent"
          aria-label="Maximize"
        >
          <Square className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-10 rounded-none hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
