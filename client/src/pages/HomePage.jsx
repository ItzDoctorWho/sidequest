import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, Dices, X } from 'lucide-react';
import Filters, { CategoryTiles } from '../components/Filters.jsx';
import QuestCard from '../components/QuestCard.jsx';
import {
  fillQueue,
  filtersKey,
  resetFilters,
  restoreSuggestion,
  showNextSuggestion
} from '../redux/suggestionSlice.js';
import { saveActivity } from '../redux/activitiesSlice.js';
import { addToast } from '../redux/uiSlice.js';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CompassLoader, Constellation, QuestPath, Sparkle } from '../components/brand/Decor.jsx';

const EMPTY_FILTERS = { type: '', participants: '', maxDuration: '' };

export const HomePage = () => {
  const dispatch = useDispatch();
  const cardRef = useRef(null);
  const questRef = useRef(null);
  const scrollPending = useRef(false);
  const [cardVersion, setCardVersion] = useState(0);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const { current, currentSource, queue, queueKey, filters, status, error } = useSelector((state) => state.suggestion);
  const { token } = useSelector((state) => state.auth);

  const isLoading = status === 'loading';
  const hasFilters = Boolean(filters.type || filters.participants || filters.maxDuration);
  const canSwipe = Boolean(current) && !error && !isLoading;
  const showQuest = isLoading || Boolean(current) || Boolean(error);
  // The quest waiting behind the current one, if it matches the active filters.
  const upNext = queueKey === filtersKey(filters) ? queue[0] : undefined;

  // Takes the next quest from the queue when one is ready, otherwise fetches it.
  const loadNext = (nextFilters = filters, { scroll = false } = {}) => {
    scrollPending.current = scroll;
    return dispatch(showNextSuggestion(nextFilters));
  };

  // Keep a couple of quests loaded behind the one on screen, so swiping never waits on the network.
  useEffect(() => {
    if (current && !error) dispatch(fillQueue(filters));
  }, [dispatch, current, error, filters]);

  // When a quest is requested from the hero or a category, bring the new card into view.
  useEffect(() => {
    if (!scrollPending.current || !showQuest) return;
    scrollPending.current = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    questRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }, [showQuest, isLoading, current]);

  const record = async (activity, decision) => {
    if (!activity) return;

    // Exploring is open to everyone; only keeping a quest needs an account.
    if (!token) {
      if (decision === 'saved') {
        setCardVersion((v) => v + 1); // bring the card back
        setIsSignInOpen(true);
      } else {
        loadNext();
      }
      return;
    }

    // Swiping left just skips to the next activity without saving to any list.
    if (decision === 'skipped') {
      loadNext();
      return;
    }

    // Move on right away; the decision is saved in the background.
    loadNext();

    const result = await dispatch(
      saveActivity({
        apiKey: activity.key,
        activity: activity.activity,
        type: activity.type,
        participants: activity.participants,
        price: activity.price,
        availability: activity.availability,
        accessibility: activity.accessibility,
        duration: activity.duration,
        kidFriendly: activity.kidFriendly,
        link: activity.link,
        status: decision
      })
    );

    if (saveActivity.rejected.match(result)) {
      dispatch(
        addToast({
          tone: 'error',
          message: "Couldn't accept that quest. It'll come around again."
        })
      );
      dispatch(restoreSuggestion(activity)); // back to the front of the line, not lost
      return;
    }

    dispatch(
      addToast({
        message: `Quest accepted: ${activity.activity}`,
        action: { label: 'Undo', type: 'undo', activityId: result.payload._id }
      })
    );
  };

  const handleSave = (activity) => record(activity || current, 'saved');
  const handleSkip = (activity) => record(activity || current, 'skipped');

  const swipeRight = () => (cardRef.current ? cardRef.current.swipeRight() : handleSave());
  const swipeLeft = () => (cardRef.current ? cardRef.current.swipeLeft() : handleSkip());

  // Keyboard: ← skip, → accept.
  useEffect(() => {
    if (!canSwipe) return undefined;
    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, select, textarea, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        cardRef.current?.swipeRight();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        cardRef.current?.swipeLeft();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [canSwipe]);

  return (
    <div className="page">
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden rounded-xl border border-line bg-card px-6 py-10 sm:px-12 sm:py-14"
      >
        <div className="hero-glow absolute inset-0" aria-hidden="true" />
        <div className="topo" aria-hidden="true" />
        <Constellation className="absolute top-6 right-8 hidden w-40 text-fg-muted md:block" />
        <QuestPath className="absolute right-8 bottom-6 hidden w-56 text-accent md:block" />
        <Sparkle className="absolute top-8 right-6 size-5 text-accent md:right-52" />

        <div className="relative max-w-xl">
          <h1 id="hero-title" className="text-5xl leading-[1.05] sm:text-6xl">
            Hey, adventurer!
          </h1>
          <p className="muted mt-4 text-lg">Feeling bored? Let&rsquo;s find something worth doing.</p>

          {!current && !isLoading && (
            <>
              <button type="button" onClick={() => loadNext(filters, { scroll: true })} className="btn btn-primary btn-lg mt-7">
                <Dices className="size-5" aria-hidden="true" />
                Find a random quest
              </button>
              {!token && <p className="muted mt-3 text-sm">No account needed to explore.</p>}
            </>
          )}
        </div>
      </section>

      {showQuest && (
        <section ref={questRef} aria-label="Your next quest" className="mt-8 scroll-mt-36 lg:scroll-mt-24">
          <h2 className="mb-3 text-xl">Your next quest</h2>

          {isLoading ? (
            <div className="surface flex min-h-72 items-center justify-center" aria-busy="true">
              <CompassLoader />
            </div>
          ) : error ? (
            <EmptyState title="Your next adventure is hiding somewhere" text={error}>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(resetFilters());
                    loadNext(EMPTY_FILTERS);
                  }}
                  className="btn btn-outline"
                >
                  Reset filters
                </button>
              )}
              <button type="button" onClick={() => loadNext()} className="btn btn-primary">
                <Dices className="size-4" aria-hidden="true" />
                Roll again
              </button>
            </EmptyState>
          ) : (
            <QuestCard
              key={`${current.key || current.activity}-${cardVersion}`}
              ref={cardRef}
              activity={current}
              next={upNext}
              instant={currentSource === 'queue'}
              onSwipeRight={handleSave}
              onSwipeLeft={handleSkip}
            />
          )}

          <div className="sr-only" aria-live="polite">
            {canSwipe ? `Quest: ${current.activity}` : ''}
          </div>

          {canSwipe && (
            <>
              {/* Sticky on phones so the main actions never fall below the fold. */}
              <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-line bg-page px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:z-auto sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex items-center justify-center gap-3">
                  <button type="button" onClick={swipeLeft} className="btn btn-outline btn-lg" aria-label="Skip quest">
                    <X className="size-5" aria-hidden="true" />
                    Skip
                  </button>
                  <button type="button" onClick={swipeRight} className="btn btn-primary btn-lg">
                    Accept quest
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-col items-center gap-1">
                <button type="button" onClick={() => loadNext()} className="btn btn-ghost btn-sm">
                  <Dices className="size-4" aria-hidden="true" />
                  Roll again
                </button>
                <p className="muted text-sm">Drag the card, or use the ← → keys.</p>
              </div>
            </>
          )}
        </section>
      )}

      <section aria-labelledby="explore-title" className="mt-12">
        <h2 id="explore-title" className="text-2xl">
          Explore quests
        </h2>
        <p className="muted mt-1">Pick a vibe and we&rsquo;ll deal you a matching quest.</p>

        <div className="mt-5">
          <CategoryTiles
            disabled={isLoading}
            onPick={(partial) => loadNext({ ...filters, ...partial }, { scroll: true })}
          />
        </div>

        <div className="mt-6">
          <Filters
            disabled={isLoading}
            onChange={(partial) => {
              // Once a quest is on screen, filter changes deal a fresh one.
              if (current || error) loadNext({ ...filters, ...partial });
            }}
          />
        </div>
      </section>

      {isSignInOpen && (
        <Modal title="Sign in to accept quests" onClose={() => setIsSignInOpen(false)}>
          <p className="muted text-sm">
            Create a free account to keep this quest in your adventures and take on weekly challenges. You can keep
            exploring without one.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setIsSignInOpen(false)} className="btn btn-ghost">
              Keep exploring
            </button>
            <Link to="/register" state={{ from: '/' }} className="btn btn-outline">
              Create account
            </Link>
            <Link to="/login" state={{ from: '/' }} className="btn btn-primary" data-autofocus>
              Sign in
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HomePage;
