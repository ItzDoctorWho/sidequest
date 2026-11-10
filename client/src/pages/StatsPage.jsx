import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, Trophy } from 'lucide-react';
import { fetchStats } from '../redux/statsSlice.js';
import Alert from '../components/Alert.jsx';
import { getCategory } from '../components/questMeta.js';

// Charts take their colours from the theme variables, so they follow light/dark by themselves.
const AXIS = 'var(--text-secondary)';

export const StatsPage = () => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.stats);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  if (error) {
    return (
      <div className="page">
        <h1 className="mb-6 text-3xl sm:text-4xl">Achievements</h1>
        <Alert>{error}</Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page" aria-busy={status === 'loading'}>
        <h1 className="mb-6 text-3xl sm:text-4xl">Achievements</h1>
        <div className="space-y-4 motion-safe:animate-pulse" aria-hidden="true">
          <div className="h-24 rounded-lg bg-muted-fill" />
          <div className="h-64 rounded-lg bg-muted-fill" />
        </div>
        <span className="sr-only">Loading your achievements</span>
      </div>
    );
  }

  const byType = [...(data.byType || [])].sort((a, b) => b.count - a.count);
  const maxTypeCount = Math.max(1, ...byType.map((t) => t.count));
  const last7Total = (data.last7Days || []).reduce((sum, d) => sum + d.count, 0);

  const kpis = [
    { label: 'XP earned', value: data.xp, reward: true },
    { label: 'Day streak', value: data.streak },
    { label: 'Quests completed', value: data.totalCompleted },
    { label: 'Quests accepted', value: data.totalSaved }
  ];

  return (
    <div className="page">
      <h1 className="mb-6 text-3xl sm:text-4xl">Achievements</h1>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card p-5">
            <dd className={`font-display text-3xl font-bold tabular-nums ${kpi.reward ? 'text-reward' : ''}`}>
              {kpi.value}
            </dd>
            <dt className="muted mt-1 text-sm">{kpi.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="surface p-5 sm:p-6" aria-labelledby="last7-heading">
          <h2 id="last7-heading" className="mb-4 text-lg">
            Completed in the last 7 days
          </h2>
          <div
            className="h-56 w-full"
            role="img"
            aria-label={`Bar chart of quests completed each day over the last 7 days. ${last7Total} in total.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.last7Days} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--surface-muted)' }}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '14px',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Completed"
                  fill="var(--cat-purple)"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface p-5 sm:p-6" aria-labelledby="category-heading">
          <h2 id="category-heading" className="mb-4 text-lg">
            By category
          </h2>
          {byType.length > 0 ? (
            <ul className="space-y-4">
              {byType.map((t) => {
                const category = getCategory(t.type);
                const Icon = category.icon;
                return (
                  <li key={t.type} className={`cat-${category.accent}`}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="cat-icon flex size-6 items-center justify-center rounded-full" aria-hidden="true">
                          <Icon className="size-3.5" />
                        </span>
                        {category.label}
                      </span>
                      <span className="muted tabular-nums">{t.count}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted-fill" aria-hidden="true">
                      <div className="h-full rounded-full bg-[var(--cat-purple)]" style={{ width: `${(t.count / maxTypeCount) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted text-sm">Complete a quest to see your categories.</p>
          )}
        </section>
      </div>

      <section className="mt-8" aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="mb-3 text-xl">
          Badges
        </h2>
        <ul className="surface divide-y divide-line">
          {data.allBadgeDefinitions?.map((badge) => {
            const unlocked = (data.badges || []).includes(badge.name);
            return (
              <li key={badge.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      unlocked ? 'bg-reward-fill text-on-action' : 'bg-muted-fill text-fg-muted'
                    }`}
                    aria-hidden="true"
                  >
                    {unlocked ? <Trophy className="size-5" /> : <Lock className="size-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className={unlocked ? 'font-display font-semibold' : 'muted font-display font-semibold'}>
                      {badge.name}
                    </p>
                    <p className="muted text-sm">{badge.description}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${unlocked ? 'text-reward' : 'muted'}`}>
                  {unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default StatsPage;
