import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dices, Plus } from 'lucide-react';
import { fetchActivities, setActiveTab } from '../redux/activitiesSlice.js';
import ActivityItemCard from '../components/ActivityItemCard.jsx';
import CustomActivityModal from '../components/CustomActivityModal.jsx';
import WheelModal from '../components/WheelModal.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';

// Tab ids match the activity `status` values the API stores.
const TABS = [
  { id: 'saved', label: 'Accepted' },
  { id: 'done', label: 'Completed' },
  { id: 'skipped', label: 'Maybe later' }
];

const EMPTY = {
  saved: {
    title: 'No quests accepted yet',
    text: 'Accept a quest on Home and it will wait for you here.',
    action: { label: 'Find a quest', to: '/' }
  },
  done: {
    title: 'No quests completed yet',
    text: 'Finish one and it lands here with your rating and notes.',
    action: { label: 'See accepted quests', tab: 'saved' }
  },
  skipped: {
    title: 'Nothing set aside',
    text: 'Quests you pass on are kept here in case you change your mind.',
    action: { label: 'Explore quests', to: '/' }
  }
};

export const MyListPage = () => {
  const dispatch = useDispatch();
  const { items, activeTab, status, error } = useSelector((state) => state.activities);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  const filteredItems = items.filter((item) => item.status === activeTab);
  const counts = TABS.reduce((acc, tab) => ({ ...acc, [tab.id]: items.filter((i) => i.status === tab.id).length }), {});
  const empty = EMPTY[activeTab];

  const handleTabKeyDown = (e) => {
    const index = TABS.findIndex((t) => t.id === activeTab);
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    dispatch(setActiveTab(TABS[next].id));
    document.getElementById(`tab-${TABS[next].id}`)?.focus();
  };

  return (
    <div className="page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl">Your adventures</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setIsWheelOpen(true)} className="btn btn-secondary">
            <Dices className="size-4" aria-hidden="true" />
            Spin the wheel
          </button>
          <button type="button" onClick={() => setIsAddOpen(true)} className="btn btn-primary">
            <Plus className="size-4" aria-hidden="true" />
            Add your own
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Quest status"
        onKeyDown={handleTabKeyDown}
        className="mb-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="activity-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`-mb-px min-h-11 border-b-[3px] px-4 text-sm font-semibold whitespace-nowrap transition-[color,border-color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${
                selected ? 'border-accent text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              }`}
            >
              {tab.label} <span className="tabular-nums">{counts[tab.id]}</span>
            </button>
          );
        })}
      </div>

      {error && status === 'failed' && <Alert className="mb-4">{error}</Alert>}

      <div id="activity-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {status === 'loading' && items.length === 0 ? (
          <ul className="surface divide-y divide-line" aria-busy="true">
            <li className="sr-only">Loading your adventures</li>
            {[0, 1, 2].map((n) => (
              <li key={n} className="flex gap-3 p-5 motion-safe:animate-pulse" aria-hidden="true">
                <div className="size-9 rounded-md bg-muted-fill" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-2/3 rounded bg-muted-fill" />
                  <div className="h-4 w-1/3 rounded bg-muted-fill" />
                </div>
              </li>
            ))}
          </ul>
        ) : filteredItems.length > 0 ? (
          <ul className="surface divide-y divide-line">
            {filteredItems.map((item) => (
              <ActivityItemCard key={item._id} item={item} />
            ))}
          </ul>
        ) : (
          <EmptyState title={empty.title} text={empty.text}>
            {empty.action.to ? (
              <Link to={empty.action.to} className="btn btn-primary">
                {empty.action.label}
              </Link>
            ) : (
              <button type="button" onClick={() => dispatch(setActiveTab(empty.action.tab))} className="btn btn-primary">
                {empty.action.label}
              </button>
            )}
          </EmptyState>
        )}
      </div>

      {isAddOpen && <CustomActivityModal onClose={() => setIsAddOpen(false)} />}
      {isWheelOpen && <WheelModal onClose={() => setIsWheelOpen(false)} activities={items} />}
    </div>
  );
};

export default MyListPage;
