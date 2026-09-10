import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BloomStage, VisualTheme } from '../types';

interface BloomingFlowerProps {
  stage: BloomStage;
  theme: VisualTheme;
  onClick?: () => void;
}

export const BloomingFlower: React.FC<BloomingFlowerProps> = ({ stage, theme, onClick }) => {
  const isBud = stage === 0;

  // Petal color gradients based on theme
  const { primaryPetal, secondaryPetal, accentPetal } = theme.colors;

  // Render petal geometry for concentric layers
  const renderPetalRing = (count: number, radius: number, petalWidth: number, petalHeight: number, rotationOffset: number, delay: number, opacity: number = 0.95) => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i * (360 / count)) + rotationOffset;
      return (
        <motion.g
          key={`${count}-${i}`}
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{
            scale: 1,
            opacity,
            rotate: angle,
          }}
          transition={{
            duration: 1.1,
            delay: delay + (i * 0.03),
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ originX: '150px', originY: '150px' }}
        >
          {/* Heart/teardrop shaped petal */}
          <path
            d={`M 150 150 
                C ${150 - petalWidth} ${150 - radius * 0.4}, ${150 - petalWidth * 0.9} ${150 - radius}, 150 ${150 - petalHeight}
                C ${150 + petalWidth * 0.9} ${150 - radius}, ${150 + petalWidth} ${150 - radius * 0.4}, 150 150 Z`}
            fill={`url(#petalGrad-${theme.id})`}
            stroke={secondaryPetal}
            strokeWidth="0.75"
            strokeOpacity="0.4"
            filter="url(#flowerShadow)"
          />
        </motion.g>
      );
    });
  };

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      onClick={onClick}
      id="blooming-flower-container"
    >
      {/* Concentric expanding energy ripples in Stage 3 and beyond */}
      <AnimatePresence>
        {stage >= 3 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={`ripple-${ring}`}
                className="absolute rounded-full border border-white/20"
                style={{
                  width: `${240 + ring * 120}px`,
                  height: `${240 + ring * 120}px`,
                  borderColor: `${secondaryPetal}33`,
                }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{
                  scale: [0.85, 1.15, 0.85],
                  opacity: [0.25, 0.5, 0.25],
                }}
                transition={{
                  duration: 4 + ring,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Atmospheric glowing aura behind flower */}
      <motion.div
        className="absolute rounded-full filter blur-2xl pointer-events-none"
        style={{
          background: primaryPetal,
          width: isBud ? '130px' : '280px',
          height: isBud ? '130px' : '280px',
        }}
        animate={{
          opacity: isBud ? [0.35, 0.55, 0.35] : [0.4, 0.65, 0.4],
          scale: isBud ? [0.95, 1.05, 0.95] : [1, 1.1, 1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* SVG Flower Rendering */}
      <svg
        viewBox="0 0 300 300"
        className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px] relative z-10 transition-transform duration-700"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Main Petal Gradient */}
          <linearGradient id={`petalGrad-${theme.id}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={primaryPetal} />
            <stop offset="65%" stopColor={secondaryPetal} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>

          {/* Stem & Leaf Gradient */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e583b" />
            <stop offset="50%" stopColor="#2b7e55" />
            <stop offset="100%" stopColor="#194830" />
          </linearGradient>

          {/* Center Stamen Glow */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentPetal} />
            <stop offset="70%" stopColor={primaryPetal} />
            <stop offset="100%" stopColor="#220011" />
          </radialGradient>

          <filter id="flowerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* STAGE 0: Closed Bud, Stem, and Leaves (Matching Screenshot 1) */}
        {isBud ? (
          <g>
            {/* Gentle Stem extending downwards */}
            <motion.path
              d="M 150 170 Q 148 220 150 290"
              stroke="url(#stemGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />

            {/* Left Leaf */}
            <motion.path
              d="M 149 205 Q 120 195 125 185 Q 140 185 149 205 Z"
              fill="url(#stemGrad)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            {/* Right Leaf */}
            <motion.path
              d="M 150 215 Q 178 205 174 195 Q 160 195 150 215 Z"
              fill="url(#stemGrad)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            {/* Sepal cup holding the bud */}
            <path
              d="M 142 166 Q 150 175 158 166 Q 150 170 142 166 Z"
              fill="#226242"
            />

            {/* Closed Flower Bud (tulip/rose shape) */}
            <motion.g
              animate={{
                scale: [1, 1.04, 1],
                y: [0, -3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ originX: '150px', originY: '160px' }}
            >
              {/* Back Bud Petal */}
              <ellipse
                cx="150"
                cy="140"
                rx="18"
                ry="36"
                fill={primaryPetal}
                opacity="0.8"
              />

              {/* Left Wing Petal */}
              <path
                d="M 150 168 C 130 160 132 120 146 112 C 150 130 148 155 150 168 Z"
                fill={`url(#petalGrad-${theme.id})`}
                filter="url(#flowerShadow)"
              />

              {/* Right Wing Petal */}
              <path
                d="M 150 168 C 170 160 168 120 154 112 C 150 130 152 155 150 168 Z"
                fill={`url(#petalGrad-${theme.id})`}
                filter="url(#flowerShadow)"
              />

              {/* Center overlapping bud petal with highlight */}
              <ellipse
                cx="150"
                cy="142"
                rx="14"
                ry="30"
                fill={`url(#petalGrad-${theme.id})`}
              />
            </motion.g>
          </g>
        ) : (
          /* STAGES 1 TO 5: Blooming Open Layers (Matching Screenshots 2 - 6) */
          <g>
            {/* Stage 1: Initial 5-petal blossom */}
            {stage === 1 && (
              <g id="bloom-stage-1">
                {renderPetalRing(5, 75, 34, 75, 0, 0.05, 0.95)}
                {/* Center pistil */}
                <circle cx="150" cy="150" r="14" fill="url(#centerGlow)" />
                <circle cx="150" cy="150" r="7" fill={accentPetal} />
              </g>
            )}

            {/* Stage 2: Multi-layer lotus blossom */}
            {stage === 2 && (
              <g id="bloom-stage-2">
                {/* Outer ring */}
                {renderPetalRing(8, 95, 38, 95, 0, 0.05, 0.88)}
                {/* Middle ring */}
                {renderPetalRing(8, 75, 32, 75, 22.5, 0.15, 0.92)}
                {/* Inner ring */}
                {renderPetalRing(6, 50, 26, 50, 0, 0.25, 0.98)}
                {/* Center core */}
                <circle cx="150" cy="150" r="18" fill="url(#centerGlow)" />
                <circle cx="150" cy="150" r="9" fill={accentPetal} />
              </g>
            )}

            {/* Stage 3+: Full luxuriant dahlia/lotus bloom with 32 petals */}
            {stage >= 3 && (
              <motion.g
                id="bloom-stage-full"
                animate={{
                  rotate: [0, 2, 0, -2, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ originX: '150px', originY: '150px' }}
              >
                {/* Outermost Layer 1 (8 wide petals) */}
                {renderPetalRing(8, 115, 46, 115, 0, 0.02, 0.85)}

                {/* Layer 2 (8 offset petals) */}
                {renderPetalRing(8, 96, 40, 96, 22.5, 0.08, 0.9)}

                {/* Layer 3 (8 mid petals) */}
                {renderPetalRing(8, 76, 34, 76, 11.25, 0.16, 0.95)}

                {/* Layer 4 (8 inner petals) */}
                {renderPetalRing(8, 54, 26, 54, 33.75, 0.24, 0.98)}

                {/* Center Flower Stamen & Pistils */}
                <circle cx="150" cy="150" r="22" fill="url(#centerGlow)" />
                {/* Golden pollen specks around center */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x = 150 + Math.cos(angle) * 12;
                  const y = 150 + Math.sin(angle) * 12;
                  return (
                    <circle
                      key={`stamen-${i}`}
                      cx={x}
                      cy={y}
                      r="2"
                      fill={accentPetal}
                      opacity="0.9"
                    />
                  );
                })}
                <circle cx="150" cy="150" r="8" fill="#fff7b8" />
              </motion.g>
            )}
          </g>
        )}
      </svg>

      {/* Floating Falling Petals Particles underneath (visible from stage 2+) */}
      {stage >= 2 && (
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`falling-petal-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${12 + (i % 3) * 4}px`,
                height: `${18 + (i % 3) * 6}px`,
                background: `linear-gradient(135deg, ${primaryPetal}, ${secondaryPetal})`,
                borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
                opacity: 0.8,
              }}
              initial={{
                x: (i - 4) * 24,
                y: 40,
                opacity: 0,
                scale: 0.6,
                rotate: i * 35,
              }}
              animate={{
                y: [40, 110 + (i * 12), 160],
                x: [(i - 4) * 24, (i - 4) * 28 + Math.sin(i) * 30, (i - 4) * 34],
                opacity: [0, 0.9, 0],
                scale: [0.6, 1, 0.8],
                rotate: [i * 35, i * 35 + 80, i * 35 + 160],
              }}
              transition={{
                duration: 3.5 + (i * 0.4),
                repeat: Infinity,
                delay: i * 0.45,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
