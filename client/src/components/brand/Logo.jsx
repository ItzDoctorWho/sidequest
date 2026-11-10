import React from 'react';
import { brandPaths } from './brandPaths.js';

const { side, quest, box, symbol: s } = brandPaths;

/**
 * The Quest Compass symbol: ring (compass) + arrow (movement) + stars (discovery).
 * 64x64 box. `gap` is the colour the ring is knocked out with around the arrow,
 * so it must match whatever the symbol sits on.
 */
export const QuestSymbol = ({ className = '', gap = 'var(--sq-night)' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
    <path d={s.ringPurple} fill="none" stroke="var(--sq-purple)" strokeWidth="5" strokeLinecap="round" />
    <path d={s.ringLime} fill="none" stroke="var(--sq-lime)" strokeWidth="5" strokeLinecap="round" />
    <path d={s.arrowAll} fill={gap} stroke={gap} strokeWidth="5" strokeLinejoin="round" />
    <path d={s.arrowA} fill="var(--sq-lime)" stroke="var(--sq-lime)" strokeWidth="1.6" strokeLinejoin="round" />
    <path d={s.arrowB} fill="var(--sq-lime-shade)" stroke="var(--sq-lime-shade)" strokeWidth="1.6" strokeLinejoin="round" />
    <path d={s.starBig} fill="var(--sq-lime)" />
    <path d={s.starMid} fill="var(--sq-lime)" />
    <path d={s.starSmall} fill="var(--sq-lime)" />
  </svg>
);

/** App-icon version: the symbol on a night tile. Works on any page background. */
export const LogoIcon = ({ className = 'size-9' }) => (
  <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
    <rect width="96" height="96" rx="24" fill="var(--sq-night)" />
    <rect x="1" y="1" width="94" height="94" rx="23" fill="none" stroke="var(--sq-purple)" strokeOpacity=".55" strokeWidth="2" />
    <g transform="translate(16 16)">
      <path d={s.ringPurple} fill="none" stroke="var(--sq-purple)" strokeWidth="5" strokeLinecap="round" />
      <path d={s.ringLime} fill="none" stroke="var(--sq-lime)" strokeWidth="5" strokeLinecap="round" />
      <path d={s.arrowAll} fill="var(--sq-night)" stroke="var(--sq-night)" strokeWidth="5" strokeLinejoin="round" />
      <path d={s.arrowA} fill="var(--sq-lime)" stroke="var(--sq-lime)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d={s.arrowB} fill="var(--sq-lime-shade)" stroke="var(--sq-lime-shade)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d={s.starBig} fill="var(--sq-lime)" />
      <path d={s.starMid} fill="var(--sq-lime)" />
      <path d={s.starSmall} fill="var(--sq-lime)" />
    </g>
  </svg>
);

/** Outlined SideQuest wordmark. "Side" follows the text colour, "Quest" the theme accent. */
export const Wordmark = ({ className = 'h-5' }) => (
  <svg
    viewBox={`${box[0]} ${box[1]} ${box[2]} ${box[3]}`}
    className={`w-auto ${className}`}
    aria-hidden="true"
    focusable="false"
  >
    <path d={side} className="fill-fg" />
    <path d={quest} className="fill-accent" />
  </svg>
);

/** Horizontal lockup for headers: icon + wordmark. */
export const Logo = ({ className = '', iconClass = 'size-9', wordmarkClass = 'h-5' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoIcon className={iconClass} />
    <Wordmark className={wordmarkClass} />
    <span className="sr-only">SideQuest</span>
  </span>
);

export default Logo;
