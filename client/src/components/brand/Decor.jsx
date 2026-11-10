import React from 'react';
import { QuestSymbol } from './Logo.jsx';

/** Four-point discovery star. Colour comes from `currentColor`. */
export const Sparkle = ({ className = 'size-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <path d="M12 0Q14.4 9.6 24 12Q14.4 14.4 12 24Q9.6 14.4 0 12Q9.6 9.6 12 0Z" fill="currentColor" />
  </svg>
);

/** Dotted quest path ending in a map marker. Decorative. */
export const QuestPath = ({ className = '' }) => (
  <svg viewBox="0 0 240 130" className={className} aria-hidden="true" focusable="false" fill="none">
    <path
      d="M6 112C54 24 96 128 146 70S206 30 222 38"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeDasharray="0.5 9"
      strokeLinecap="round"
    />
    <path
      d="M222 8c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16Z"
      fill="currentColor"
      opacity=".9"
    />
    <circle cx="222" cy="24" r="5.5" fill="var(--card)" />
  </svg>
);

/** A few stars joined by hairlines. Decorative. */
export const Constellation = ({ className = '' }) => (
  <svg viewBox="0 0 160 110" className={className} aria-hidden="true" focusable="false" fill="none">
    <path
      d="M10 86 40 52 78 66 112 24 150 38"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity=".5"
      strokeLinecap="round"
    />
    {[
      [10, 86, 3],
      [40, 52, 4.5],
      [78, 66, 3],
      [112, 24, 6],
      [150, 38, 3.5]
    ].map(([x, y, r]) => (
      <path
        key={`${x}-${y}`}
        d={`M${x} ${y - r * 1.6}Q${x + r * 0.35} ${y - r * 0.35} ${x + r * 1.6} ${y}Q${x + r * 0.35} ${y + r * 0.35} ${x} ${y + r * 1.6}Q${x - r * 0.35} ${y + r * 0.35} ${x - r * 1.6} ${y}Q${x - r * 0.35} ${y - r * 0.35} ${x} ${y - r * 1.6}Z`}
        fill="currentColor"
      />
    ))}
  </svg>
);

/** "Quest completed" star burst. Plays once on mount, hidden under reduced motion. */
export const StarBurst = ({ className = '' }) => (
  <span className={`pointer-events-none absolute ${className}`} aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => (
      <Sparkle
        key={i}
        className="burst-star text-action"
        style={{ '--a': `${i * 45}deg`, '--d': `${(i % 2) * 60}ms` }}
      />
    ))}
  </span>
);

/** Loading state: the compass spins while we look for a quest. */
export const CompassLoader = ({ label = 'Finding a quest…' }) => (
  <div className="flex flex-col items-center gap-3 py-2" role="status">
    <span className="compass-spin inline-block rounded-2xl">
      <QuestSymbol className="size-14" gap="var(--card)" />
    </span>
    <p className="muted text-sm">{label}</p>
  </div>
);
