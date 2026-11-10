import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Clock, Dices, ExternalLink, Gauge, Users, Wallet } from 'lucide-react';
import { difficultyLabel, durationLabel, getCategory, groupLabel } from './questMeta.js';

const SWIPE_THRESHOLD = 90;
const FLICK_DISTANCE = 40; // a quick flick counts even if it didn't travel far...
const FLICK_SPEED = 0.55; // ...as long as it was this fast (px per ms)
const EXIT_MS = 220;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (n) => Math.min(1, Math.max(0, n));

const Fact = ({ icon: Icon, label, children }) => (
  <li className="fact">
    <Icon aria-hidden="true" />
    <span className="sr-only">{label}: </span>
    {children}
  </li>
);

/** Cover strip plus details. Shared by the live card and the "up next" card behind it. */
const CardBody = ({ activity, interactive = true }) => {
  const category = getCategory(activity.type);
  const CategoryIcon = category.icon;
  const duration = durationLabel(activity.duration);

  return (
    <>
      <div className="cat-cover relative h-28 overflow-hidden sm:h-36" aria-hidden="true">
        <div className="topo opacity-80" />
        <CategoryIcon className="absolute -right-2 -bottom-5 size-32 opacity-30 sm:size-40" strokeWidth={1.25} />
        <span className="badge badge-purple absolute bottom-4 left-5">
          <Dices className="size-3.5" />
          Random quest
        </span>
      </div>

      <div className="p-5 sm:p-7">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="cat-icon inline-flex size-7 items-center justify-center rounded-full" aria-hidden="true">
            <CategoryIcon className="size-4" />
          </span>
          <span className="sr-only">Category: </span>
          {category.label}
        </p>

        <h2 className="mt-3 text-2xl leading-tight sm:text-3xl">{activity.activity}</h2>

        {activity.link && (
          <a
            href={activity.link}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={interactive ? undefined : -1}
            className="focus-ring mt-3 inline-flex w-fit items-center gap-1 rounded text-sm font-semibold text-accent hover:underline"
          >
            Learn more
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        )}

        <ul className="mt-5 flex flex-wrap gap-2">
          {duration && (
            <Fact icon={Clock} label="Duration">
              {duration}
            </Fact>
          )}
          <Fact icon={Users} label="Group">
            {groupLabel(activity.participants)}
          </Fact>
          <Fact icon={Gauge} label="Difficulty">
            {difficultyLabel(activity.accessibility)}
          </Fact>
          {activity.priceLabel && (
            <Fact icon={Wallet} label="Cost">
              {activity.priceLabel}
            </Fact>
          )}
        </ul>
      </div>
    </>
  );
};

/**
 * A quest waiting to be accepted. Drag or flick right to accept, left for "maybe later".
 * `next` is the quest queued behind it: it waits underneath and rises into place as you drag.
 * `instant` skips the entrance animation for cards that were already visible underneath.
 * Mount it with a `key` per quest so each card starts fresh.
 */
export const QuestCard = forwardRef(({ activity, next, instant = false, onSwipeRight, onSwipeLeft }, ref) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null); // 'left' | 'right' | null
  const startX = useRef(0);
  const lastMove = useRef({ x: 0, t: 0, velocity: 0 });
  const exiting = useRef(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const triggerExit = (direction) => {
    if (exiting.current) return;
    exiting.current = true;
    setIsDragging(false);
    setExitDirection(direction);
    const done = () => (direction === 'right' ? onSwipeRight(activity) : onSwipeLeft(activity));
    if (prefersReducedMotion()) {
      done();
    } else {
      timer.current = setTimeout(done, EXIT_MS);
    }
  };

  useImperativeHandle(ref, () => ({
    swipeRight: () => triggerExit('right'),
    swipeLeft: () => triggerExit('left')
  }));

  const handlePointerDown = (e) => {
    if (exiting.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Let links and buttons inside the card behave normally.
    if (e.target.closest('a, button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    lastMove.current = { x: e.clientX, t: e.timeStamp, velocity: 0 };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dt = e.timeStamp - lastMove.current.t;
    if (dt > 0) {
      // Smoothed so one jittery event can't fake a flick.
      const instantSpeed = (e.clientX - lastMove.current.x) / dt;
      lastMove.current.velocity = lastMove.current.velocity * 0.6 + instantSpeed * 0.4;
    }
    lastMove.current.x = e.clientX;
    lastMove.current.t = e.timeStamp;
    setDragX(e.clientX - startX.current);
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const { velocity } = lastMove.current;
    if (dragX > SWIPE_THRESHOLD || (dragX > FLICK_DISTANCE && velocity > FLICK_SPEED)) {
      triggerExit('right');
    } else if (dragX < -SWIPE_THRESHOLD || (dragX < -FLICK_DISTANCE && velocity < -FLICK_SPEED)) {
      triggerExit('left');
    } else {
      setDragX(0);
    }
  };

  const acceptOpacity = exitDirection === 'right' ? 1 : clamp01(dragX / SWIPE_THRESHOLD);
  const skipOpacity = exitDirection === 'left' ? 1 : clamp01(-dragX / SWIPE_THRESHOLD);
  // 0 when the card is at rest, 1 once it is leaving: drives the card underneath.
  const progress = exitDirection ? 1 : Math.max(acceptOpacity, skipOpacity);

  let transform = `translate3d(${dragX}px, 0, 0) rotate(${dragX * 0.04}deg)`;
  let opacity = 1;
  if (exitDirection) {
    const sign = exitDirection === 'right' ? 1 : -1;
    transform = `translate3d(${sign * 120}%, 0, 0) rotate(${sign * 8}deg)`;
    opacity = 0;
  }

  const category = getCategory(activity.type);
  const animate = !isDragging && !prefersReducedMotion();
  const nextCategory = next ? getCategory(next.type) : null;

  return (
    <div className="relative pb-4">
      {next && (
        // The next quest, already loaded. `inert` keeps it out of the tab order and the accessibility tree.
        <div
          inert
          aria-hidden="true"
          style={{
            transform: `translateY(${(1 - progress) * 14}px) scale(${0.94 + progress * 0.06})`,
            transformOrigin: 'bottom center',
            opacity: 0.65 + progress * 0.35,
            transition: animate ? `transform ${EXIT_MS}ms ease-out, opacity ${EXIT_MS}ms ease-out` : 'none'
          }}
          className={`cat-${nextCategory.accent} surface pointer-events-none absolute inset-x-0 top-0 bottom-4 overflow-hidden select-none`}
        >
          <CardBody activity={next} interactive={false} />
        </div>
      )}

      <article
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          transform,
          opacity,
          transition: animate ? `transform ${EXIT_MS}ms ease-out, opacity ${EXIT_MS}ms ease-out` : 'none'
        }}
        className={`cat-${category.accent} surface ${instant ? '' : 'deal'} relative cursor-grab touch-pan-y overflow-hidden shadow-[var(--shadow-pop)] select-none active:cursor-grabbing`}
      >
        <span
          aria-hidden="true"
          style={{ opacity: acceptOpacity }}
          className="pointer-events-none absolute top-5 left-5 z-10 -rotate-6 rounded-md border-2 border-action bg-action px-3 py-1 font-display text-lg font-bold text-on-action"
        >
          Accept
        </span>
        <span
          aria-hidden="true"
          style={{ opacity: skipOpacity }}
          className="pointer-events-none absolute top-5 right-5 z-10 rotate-6 rounded-md border-2 border-line-strong bg-card px-3 py-1 font-display text-lg font-bold text-fg"
        >
          Maybe later
        </span>

        <CardBody activity={activity} />
      </article>
    </div>
  );
});

QuestCard.displayName = 'QuestCard';

export default QuestCard;
