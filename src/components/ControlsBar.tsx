import React from 'react';
import { Volume2, VolumeX, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react';
import { VisualTheme } from '../types';

interface ControlsBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCardVisible: boolean;
  onToggleCard: () => void;
  onReplay: () => void;
  onOpenCreate: () => void;
  theme: VisualTheme;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  soundEnabled,
  onToggleSound,
  isCardVisible,
  onToggleCard,
  onReplay,
  onOpenCreate,
  theme,
}) => {
  return (
    <div
      id="meadow-bottom-controls"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-full backdrop-blur-xl border shadow-xl max-w-[95vw] overflow-x-auto select-none"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.cardBorder,
      }}
    >
      {/* Sound Toggle */}
      <button
        id="btn-sound-toggle"
        onClick={onToggleSound}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase font-medium transition-all duration-300 hover:bg-white/10 text-white/85 cursor-pointer whitespace-nowrap"
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>Sound On</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-white/50" />
            <span>Sound Off</span>
          </>
        )}
      </button>

      <div className="w-[1px] h-4 bg-white/15" />

      {/* Hide / Show Card */}
      <button
        id="btn-card-toggle"
        onClick={onToggleCard}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase font-medium transition-all duration-300 hover:bg-white/10 text-white/85 cursor-pointer whitespace-nowrap"
      >
        {isCardVisible ? (
          <>
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide Card</span>
          </>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5 text-amber-200" />
            <span>Show Card</span>
          </>
        )}
      </button>

      <div className="w-[1px] h-4 bg-white/15" />

      {/* Replay */}
      <button
        id="btn-replay"
        onClick={onReplay}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase font-medium transition-all duration-300 hover:bg-white/10 text-white/85 cursor-pointer whitespace-nowrap"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Replay</span>
      </button>

      <div className="w-[1px] h-4 bg-white/15" />

      {/* Create Yours */}
      <button
        id="btn-create-yours"
        onClick={onOpenCreate}
        className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-sm hover:brightness-110"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primaryPetal}, ${theme.colors.secondaryPetal})`,
          color: '#ffffff',
        }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Create Yours</span>
      </button>
    </div>
  );
};
