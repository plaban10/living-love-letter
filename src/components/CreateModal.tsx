import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Copy, Share2, Send, Eye } from 'lucide-react';
import { LetterData, VisualThemeKey } from '../types';
import { THEMES, OCCASION_PRESETS } from '../data/presets';
import { generateShareUrl } from '../utils/url';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLetter: LetterData;
  onApplyLetter: (letter: LetterData) => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  currentLetter,
  onApplyLetter,
}) => {
  const [formData, setFormData] = useState<LetterData>({ ...currentLetter });
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOccasionClick = (preset: typeof OCCASION_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      occasion: preset.text,
      message: preset.message,
    }));
  };

  const handleThemeSelect = (themeKey: VisualThemeKey) => {
    setFormData((prev) => ({ ...prev, theme: themeKey }));
  };

  const handlePreview = () => {
    onApplyLetter(formData);
    onClose();
  };

  const handleCopyLink = async () => {
    onApplyLetter(formData);
    const link = generateShareUrl(formData);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2800);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2800);
    }
  };

  const handleWhatsApp = () => {
    onApplyLetter(formData);
    const link = generateShareUrl(formData);
    const text = encodeURIComponent(`🌸 I grew an enchanted blooming flower garden for you:\n${link}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    onApplyLetter(formData);
    const link = generateShareUrl(formData);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `For ${formData.to || 'My Love'} 🌸`,
          text: `A living flower letter for ${formData.to || 'you'}:`,
          url: link,
        });
      } catch {
        // Share cancelled or failed
      }
    } else {
      handleCopyLink();
    }
  };

  const activeTheme = THEMES[formData.theme] || THEMES.midnight;

  return (
    <div
      id="create-letter-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        id="create-letter-modal-content"
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-lg rounded-2xl p-5 sm:p-7 text-white shadow-2xl border my-auto max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: '#121426',
          borderColor: activeTheme.colors.cardBorder,
        }}
      >
        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <h3
            className="text-2xl sm:text-3xl font-serif text-white mb-1.5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create yours
          </h3>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Make an enchanted garden letter for someone special. They will receive the animated blooming garden.
          </p>
        </div>

        {/* Quick Occasion Tags */}
        <div className="mb-5">
          <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-2 font-medium">
            Quick Occasion
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {OCCASION_PRESETS.map((preset) => {
              const isSelected = formData.occasion.toLowerCase() === preset.text.toLowerCase();
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleOccasionClick(preset)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                      : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-white/25'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Inputs: TO & FROM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/60 mb-1.5 font-medium">
              <span>To</span>
              <span>{formData.to.length}/24</span>
            </div>
            <input
              id="input-to"
              type="text"
              maxLength={24}
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="My Love"
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 focus:border-rose-400 focus:outline-none text-white text-sm transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/60 mb-1.5 font-medium">
              <span>From</span>
              <span>{formData.from.length}/24</span>
            </div>
            <input
              id="input-from"
              type="text"
              maxLength={24}
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              placeholder="Alessio"
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 focus:border-rose-400 focus:outline-none text-white text-sm transition-colors"
            />
          </div>
        </div>

        {/* Occasion Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/60 mb-1.5 font-medium">
            <span>Occasion</span>
            <span>{formData.occasion.length}/40</span>
          </div>
          <input
            id="input-occasion"
            type="text"
            maxLength={40}
            value={formData.occasion}
            onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
            placeholder="just because"
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 focus:border-rose-400 focus:outline-none text-white text-sm transition-colors"
          />
        </div>

        {/* Message Input with separator guide */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/60 mb-1.5 font-medium">
            <span>Message — use | for new line</span>
            <span>{formData.message.length}/140</span>
          </div>
          <textarea
            id="input-message"
            rows={3}
            maxLength={140}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="I couldn't give you flowers|that last forever,|so I grew you a meadow|that never wilts."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-rose-400 focus:outline-none text-white text-sm transition-colors resize-none font-serif text-base"
          />
        </div>

        {/* Visual Theme Selector (Matching Screenshot 10) */}
        <div className="mb-6">
          <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-2.5 font-medium">
            Visual Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(THEMES) as VisualThemeKey[]).map((themeKey) => {
              const th = THEMES[themeKey];
              const isSelected = formData.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  id={`theme-swatch-${themeKey}`}
                  onClick={() => handleThemeSelect(themeKey)}
                  className={`p-2 rounded-xl border transition-all duration-200 text-center cursor-pointer flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-white bg-white/15 shadow-md scale-102'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Swatch color preview bar */}
                  <div className="flex h-5 w-full rounded-md overflow-hidden shadow-inner border border-white/10">
                    <div className="w-1/3 h-full" style={{ backgroundColor: th.colors.swatchColors[0] }} />
                    <div className="w-1/3 h-full" style={{ backgroundColor: th.colors.swatchColors[1] }} />
                    <div className="w-1/3 h-full" style={{ backgroundColor: th.colors.swatchColors[2] }} />
                  </div>
                  <span className="text-xs font-medium text-white/90 capitalize">{th.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
          <button
            id="btn-preview-letter"
            type="button"
            onClick={handlePreview}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer border border-white/15"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            id="btn-copy-link"
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer border border-white/15"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedToast ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            id="btn-whatsapp-share"
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition-colors cursor-pointer border border-emerald-500/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            id="btn-share-main"
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-slate-900 text-xs font-semibold transition-all cursor-pointer shadow-md hover:brightness-105"
            style={{
              backgroundColor: '#fed7aa',
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Copied Toast Indicator */}
        <AnimatePresence>
          {copiedToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mt-3 text-center text-xs text-emerald-400 font-medium"
            >
              ✓ Shareable link copied to clipboard! Anyone who opens it will see your custom garden.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
