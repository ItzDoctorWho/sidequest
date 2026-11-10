import React, { useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, Dices } from 'lucide-react';
import { setFilters, resetFilters } from '../redux/suggestionSlice.js';
import { CATEGORIES } from './questMeta.js';

const PARTICIPANTS = [
  { value: '', label: 'Any group size' },
  { value: '1', label: 'Solo' },
  { value: '2', label: 'Pair' },
  { value: '3', label: '3 people' },
  { value: '4', label: '4 people' },
  { value: '5', label: '5 people' },
  { value: '6', label: '6 people' },
  { value: '8', label: '8 people' }
];

const Tile = ({ selected, disabled, onClick, icon: Icon, label, blurb, accent }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={selected}
    className={`cat-${accent} focus-ring flex min-h-16 items-center gap-3 rounded-lg border bg-card p-3 text-left transition-[border-color,background-color,box-shadow] duration-150 ease-out hover:bg-muted-fill disabled:opacity-60 ${
      selected ? 'border-focus shadow-[0_0_0_1px_var(--focus)]' : 'border-line'
    }`}
  >
    <span className="cat-icon flex size-10 shrink-0 items-center justify-center rounded-md" aria-hidden="true">
      <Icon className="size-5" />
    </span>
    <span className="min-w-0">
      <span className="block font-display text-base leading-tight font-semibold">{label}</span>
      <span className="muted block truncate text-sm">{blurb}</span>
    </span>
  </button>
);

/** "Explore quests": pick a category and a matching quest is dealt straight away. */
export const CategoryTiles = ({ disabled, onPick }) => {
  const dispatch = useDispatch();
  const { type } = useSelector((state) => state.suggestion.filters);

  const pick = (next) => {
    dispatch(setFilters({ type: next }));
    onPick?.({ type: next });
  };

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
      <Tile
        selected={type === ''}
        disabled={disabled}
        onClick={() => pick('')}
        icon={Dices}
        label="Anything"
        blurb="Surprise me"
        accent="purple"
      />
      {CATEGORIES.map((c) => (
        <Tile
          key={c.type}
          selected={type === c.type}
          disabled={disabled}
          onClick={() => pick(type === c.type ? '' : c.type)}
          icon={c.icon}
          label={c.label}
          blurb={c.blurb}
          accent={c.accent}
        />
      ))}
    </div>
  );
};

/** Group size, "Under an hour" and reset. `onChange` gets the changed filters. */
export const Filters = ({ disabled, onChange }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.suggestion);
  const participantsId = useId();

  const isQuick = filters.maxDuration === 'minutes';
  const hasFilters = Boolean(filters.type || filters.participants || filters.maxDuration);

  const change = (partial) => {
    dispatch(setFilters(partial));
    onChange?.(partial);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-44 flex-1 sm:max-w-56">
        <label htmlFor={participantsId} className="field-label">
          Group size
        </label>
        <select
          id={participantsId}
          value={filters.participants}
          onChange={(e) => change({ participants: e.target.value })}
          disabled={disabled}
          className="field"
        >
          {PARTICIPANTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => change({ maxDuration: isQuick ? '' : 'minutes' })}
        disabled={disabled}
        aria-pressed={isQuick}
        className={`btn ${isQuick ? 'btn-primary' : 'btn-outline'}`}
      >
        <Clock className="size-4" aria-hidden="true" />
        Under an hour
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            dispatch(resetFilters());
            onChange?.({ type: '', participants: '', maxDuration: '' });
          }}
          disabled={disabled}
          className="btn btn-ghost"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default Filters;
