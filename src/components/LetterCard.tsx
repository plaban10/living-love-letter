import React from 'react';
import { motion } from 'motion/react';
import { LetterData, VisualTheme } from '../types';

interface LetterCardProps {
  letter: LetterData;
  theme: VisualTheme;
  isVisible: boolean;
  onClose?: () => void;
}

export const LetterCard: React.FC<LetterCardProps> = ({
  letter,
  theme,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Split message by '|' or '\n'
  const messageLines = letter.message
    .split(/\||\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <motion.div
      id="enchanted-letter-card"
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 15 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full max-w-[420px] mx-4 rounded-2xl p-7 sm:p-9 text-center backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] border"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.cardBorder,
      }}
    >
      {/* Decorative Top Sparkles */}
      <div className="flex items-center justify-center gap-2 mb-3 select-none">
        <span className="text-xs" style={{ color: theme.colors.accentText }}>✦</span>
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.colors.accentText }} />
        <span className="text-xs" style={{ color: theme.colors.accentText }}>✦</span>
      </div>

      {/* Occasion / Eyebrow */}
      <p
        className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-medium mb-3 select-none"
        style={{ color: theme.colors.accentText }}
      >
        JUST FOR YOU • {letter.occasion || 'JUST BECAUSE'}
      </p>

      {/* Recipient Title */}
      <h2
        className="font-serif text-3xl sm:text-4xl text-white tracking-wide font-normal mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {letter.to}
      </h2>

      {/* Elegant Divider */}
      <div className="w-16 h-[1px] mx-auto mb-6 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Poetic Message */}
      <div
        className="space-y-4 font-serif text-lg sm:text-xl text-[#f7f2ea] leading-relaxed italic"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {messageLines.map((line, idx) => (
          <p key={idx} className="tracking-wide">
            {line}
          </p>
        ))}
      </div>

      {/* Signature */}
      {letter.from && (
        <div className="mt-7 pt-2 flex justify-center items-center">
          <p
            className="font-serif text-base sm:text-lg italic tracking-wider"
            style={{ color: theme.colors.accentText, fontFamily: "'Cormorant Garamond', serif" }}
          >
            — {letter.from}
          </p>
        </div>
      )}
    </motion.div>
  );
};
