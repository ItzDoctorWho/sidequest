import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateActivity } from '../redux/activitiesSlice.js';
import { addToast } from '../redux/uiSlice.js';
import Modal from './Modal.jsx';
import { getCategory, groupLabel } from './questMeta.js';

const MAX_SEGMENTS = 8;
const SPIN_MS = 4000;
const RADIUS = 96;
// Brand palette. Three colours cycle; orange only appears when the last segment would
// otherwise touch a segment of its own colour (counts like 4 or 7).
const SEGMENT_STYLES = [
  { fill: 'var(--sq-purple)', text: 'var(--on-secondary)' },
  { fill: 'var(--sq-slate)', text: 'var(--on-secondary)' },
  { fill: 'var(--sq-lime)', text: 'var(--sq-night)' }
];
const SEAM_STYLE = { fill: 'var(--sq-orange)', text: 'var(--sq-night)' };

const segmentStyle = (index, count) => {
  if (count > 1 && index === count - 1 && index % SEGMENT_STYLES.length === 0) return SEAM_STYLE;
  return SEGMENT_STYLES[index % SEGMENT_STYLES.length];
};

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Angles are measured clockwise from 12 o'clock, where the pointer sits.
const polar = (angleDeg, radius) => {
  const rad = (angleDeg * Math.PI) / 180;
  return [radius * Math.sin(rad), -radius * Math.cos(rad)];
};

const segmentPath = (index, step) => {
  const [x1, y1] = polar(index * step, RADIUS);
  const [x2, y2] = polar((index + 1) * step, RADIUS);
  return `M0 0 L${x1.toFixed(3)} ${y1.toFixed(3)} A${RADIUS} ${RADIUS} 0 ${step > 180 ? 1 : 0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
};

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/**
 * Spin-the-wheel over the user's saved activities.
 * Mount it conditionally so each open draws a fresh set of segments.
 */
export const WheelModal = ({ onClose, activities }) => {
  const dispatch = useDispatch();
  const timerRef = useRef(null);
  const reduceMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const saved = useMemo(() => (activities || []).filter((a) => a.status === 'saved'), [activities]);
  const [segments] = useState(() => shuffle(saved).slice(0, MAX_SEGMENTS));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const count = segments.length;
  const step = 360 / Math.max(count, 1);

  const spin = () => {
    if (spinning || !count) return;
    const winnerIndex = Math.floor(Math.random() * count);
    const jitter = (Math.random() - 0.5) * step * 0.6; // land anywhere inside the segment, not dead centre
    const base = Math.ceil(rotation / 360) * 360;
    const target = base + 360 * 5 + (360 - (winnerIndex + 0.5) * step + jitter);

    setWinner(null);
    setRotation(target);

    if (reduceMotion.current) {
      setWinner(segments[winnerIndex]);
      return;
    }
    setSpinning(true);
    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setWinner(segments[winnerIndex]);
    }, SPIN_MS + 100);
  };

  const handleDone = async () => {
    const result = await dispatch(updateActivity({ id: winner._id, updates: { status: 'done' } }));
    dispatch(
      addToast(
        updateActivity.rejected.match(result)
          ? { tone: 'error', message: "Couldn't update that quest. Try again." }
          : { tone: 'success', message: 'Quest completed! +15 XP' }
      )
    );
    onClose();
  };

  if (!count) {
    return (
      <Modal title="Spin the wheel" onClose={onClose}>
        <p className="muted text-sm">Accept a few quests first, then spin to let fate pick one.</p>
        <div className="mt-6 flex justify-end">
          <Link to="/" onClick={onClose} className="btn btn-primary" data-autofocus>
            Find a quest
          </Link>
        </div>
      </Modal>
    );
  }

  const fontSize = count <= 4 ? 9 : count <= 6 ? 8 : 7;
  const maxChars = count <= 4 ? 15 : count <= 6 ? 15 : 16;

  return (
    <Modal title="Spin the wheel" onClose={onClose}>
      <p className="muted text-sm">
        {saved.length > count
          ? `${count} of your ${saved.length} accepted quests are on the wheel.`
          : `Your ${count === 1 ? 'accepted quest is' : `${count} accepted quests are`} on the wheel.`}
      </p>

      <div className="relative mx-auto mt-4 w-full max-w-44 [@media(min-height:640px)]:max-w-56 [@media(min-height:760px)]:max-w-72">
        {/* Fixed pointer */}
        <svg
          viewBox="0 0 20 16"
          className="absolute top-0 left-1/2 z-10 h-4 w-5 -translate-x-1/2 -translate-y-1 text-fg"
          aria-hidden="true"
        >
          <path d="M2 0 L18 0 L10 16 Z" fill="currentColor" />
        </svg>

        <svg viewBox="-100 -100 200 200" className="block w-full" aria-hidden="true" focusable="false">
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: reduceMotion.current ? 'none' : `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.15, 1)`
            }}
          >
            {count === 1 ? (
              <circle r={RADIUS} fill={SEGMENT_STYLES[0].fill} />
            ) : (
              segments.map((item, i) => (
                <path
                  key={item._id}
                  d={segmentPath(i, step)}
                  fill={segmentStyle(i, count).fill}
                  stroke="var(--card)"
                  strokeWidth="1.5"
                />
              ))
            )}
            {segments.map((item, i) => {
              const center = count === 1 ? 0 : (i + 0.5) * step;
              return (
                <text
                  key={`label-${item._id}`}
                  transform={`rotate(${center - 90}) translate(${RADIUS - 6} 0)`}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill={segmentStyle(i, count).text}
                  fontSize={fontSize}
                  fontWeight="600"
                >
                  {truncate(item.activity, maxChars)}
                </text>
              );
            })}
          </g>
          <circle r="7" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="1" />
        </svg>
      </div>

      <div className="mt-4 min-h-14" aria-live="polite">
        {spinning && <p className="muted text-sm">Spinning…</p>}
        {winner && !spinning && (
          <>
            <p className="eyebrow">Your next quest</p>
            <p className="mt-1 font-display text-xl font-semibold">{winner.activity}</p>
            <p className="muted mt-1 text-sm">
              {getCategory(winner.type).label} · {groupLabel(winner.participants)}
            </p>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className={winner ? 'btn btn-outline' : 'btn btn-primary'}
          data-autofocus={winner ? undefined : true}
        >
          {winner ? 'Spin again' : spinning ? 'Spinning…' : 'Spin'}
        </button>
        {winner && !spinning && (
          <button type="button" onClick={handleDone} className="btn btn-primary" data-autofocus>
            Complete quest
          </button>
        )}
      </div>
    </Modal>
  );
};

export default WheelModal;
