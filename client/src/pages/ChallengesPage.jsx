import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Circle, Flag } from 'lucide-react';
import { fetchCurrentChallenge, createChallenge } from '../redux/challengeSlice.js';
import { fetchActivities, updateActivity } from '../redux/activitiesSlice.js';
import { addToast } from '../redux/uiSlice.js';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getCategory } from '../components/questMeta.js';

const daysLeft = (weekEnd) => {
  if (!weekEnd) return 0;
  const days = Math.ceil((new Date(weekEnd) - new Date()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

export const ChallengesPage = () => {
  const dispatch = useDispatch();
  const { current, status, error } = useSelector((state) => state.challenge);
  const { items } = useSelector((state) => state.activities);

  useEffect(() => {
    dispatch(fetchCurrentChallenge());
    dispatch(fetchActivities());
  }, [dispatch]);

  const savedCount = items.filter((i) => i.status === 'saved').length;
  const isLoading = status === 'loading';

  const handleMarkDone = async (activity) => {
    const willComplete = current.completedCount + 1 >= current.goal;
    const result = await dispatch(updateActivity({ id: activity._id, updates: { status: 'done' } }));
    if (updateActivity.rejected.match(result)) {
      dispatch(addToast({ tone: 'error', message: "Couldn't update that quest. Try again." }));
      return;
    }
    dispatch(
      addToast({
        tone: 'success',
        message: willComplete
          ? 'Weekly challenge complete! +50 XP and the Challenge Champion badge.'
          : `Quest completed: ${activity.activity}`
      })
    );
    dispatch(fetchCurrentChallenge());
  };

  const progressPercent = current ? Math.min(100, Math.round((current.completedCount / current.goal) * 100)) : 0;
  const isCompleted = current?.status === 'completed';

  return (
    <div className="page">
      <h1 className="mb-6 text-3xl sm:text-4xl">Weekly challenge</h1>

      {error && <Alert className="mb-4">{error}</Alert>}

      {isLoading && !current ? (
        <div className="surface space-y-4 p-6 motion-safe:animate-pulse" aria-busy="true">
          <span className="sr-only">Loading your challenge</span>
          <div className="h-6 w-1/2 rounded bg-muted-fill" aria-hidden="true" />
          <div className="h-3 w-full rounded-full bg-muted-fill" aria-hidden="true" />
          <div className="h-12 w-full rounded bg-muted-fill" aria-hidden="true" />
        </div>
      ) : current ? (
        <div className="surface p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow flex items-center gap-1.5">
                <Flag className="size-3.5" aria-hidden="true" />
                {isCompleted ? 'Completed' : `${daysLeft(current.weekEnd)} days left`}
              </p>
              <h2 className="mt-1.5 text-2xl">Finish {current.goal} quests this week</h2>
            </div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {current.completedCount}/{current.goal}
            </p>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-muted-fill"
            role="progressbar"
            aria-label="Weekly progress"
            aria-valuemin={0}
            aria-valuemax={current.goal}
            aria-valuenow={current.completedCount}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                isCompleted ? 'bg-reward-fill' : 'bg-accent'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <ul className="mt-6 divide-y divide-line">
            {current.activities?.map((act) => {
              const isDone = act.status === 'done';
              return (
                <li key={act._id} className="flex items-center gap-3 py-3.5">
                  {isDone ? (
                    <CheckCircle2 className="size-6 shrink-0 text-accent" aria-hidden="true" />
                  ) : (
                    <Circle className="size-6 shrink-0 text-line-strong" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={isDone ? 'muted line-through decoration-1' : 'font-semibold'}>{act.activity}</p>
                    <p className="muted text-sm">{getCategory(act.type).label}</p>
                  </div>
                  {isDone ? (
                    <span className="sr-only">Completed</span>
                  ) : (
                    <button type="button" onClick={() => handleMarkDone(act)} className="btn btn-outline btn-sm">
                      <Check className="size-4" aria-hidden="true" />
                      Complete
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {isCompleted && (
            <p className="mt-4 text-sm font-semibold text-reward">
              Challenge complete. +50 XP and the Challenge Champion badge.
            </p>
          )}
        </div>
      ) : (
        <EmptyState
          title="Ready for a weekly challenge?"
          text="Take on 3 of your accepted quests and finish them this week for bonus XP."
        >
          {savedCount >= 3 ? (
            <button
              type="button"
              onClick={() => dispatch(createChallenge({ auto: true, count: 3 }))}
              disabled={isLoading}
              className="btn btn-primary btn-lg"
            >
              Start a 3-quest challenge
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="muted text-sm">You have {savedCount} accepted. Accept at least 3 to start.</p>
              <Link to="/" className="btn btn-primary btn-lg">
                Find quests
              </Link>
            </div>
          )}
        </EmptyState>
      )}
    </div>
  );
};

export default ChallengesPage;
