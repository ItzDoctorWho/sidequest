import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Check, Star, Trash2, Pencil } from 'lucide-react';
import { updateActivity, deleteActivity } from '../redux/activitiesSlice.js';
import { addToast } from '../redux/uiSlice.js';
import ConfirmDialog from './ConfirmDialog.jsx';
import { durationLabel, getCategory, groupLabel } from './questMeta.js';

/** One row in the Adventures <ul>. Rows are grouped by the parent surface, not carded individually. */
export const ActivityItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const update = async (updates, success) => {
    const result = await dispatch(updateActivity({ id: item._id, updates }));
    if (updateActivity.rejected.match(result)) {
      dispatch(addToast({ tone: 'error', message: "Couldn't update that quest. Try again." }));
      return false;
    }
    if (success) dispatch(addToast(success));
    return true;
  };

  const handleSaveNotes = async () => {
    if (await update({ notes })) setIsEditingNotes(false);
  };

  const handleDelete = async () => {
    setIsConfirmingDelete(false);
    const result = await dispatch(deleteActivity(item._id));
    dispatch(
      addToast(
        deleteActivity.rejected.match(result)
          ? { tone: 'error', message: "Couldn't remove that quest. Try again." }
          : { message: 'Quest removed' }
      )
    );
  };

  const category = getCategory(item.type);
  const CategoryIcon = category.icon;
  const duration = durationLabel(item.duration);

  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className={`cat-${category.accent} flex min-w-0 items-start gap-3`}>
          <span className="cat-icon mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md" aria-hidden="true">
            <CategoryIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg leading-snug">{item.activity}</h3>
            <p className="muted mt-1 text-sm">
              {category.label} · {groupLabel(item.participants)}
              {duration && ` · ${duration}`}
              {item.isCustom && ' · Your own'}
            </p>
            {item.completedAt && (
              <p className="muted mt-1 text-sm">Completed {new Date(item.completedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 pl-12 sm:pl-0">
          {item.status === 'saved' && (
            <button
              type="button"
              onClick={() => update({ status: 'done' }, { tone: 'success', message: 'Quest completed! +15 XP' })}
              className="btn btn-outline btn-sm"
              title="Complete quest (+15 XP)"
            >
              <Check className="size-4" aria-hidden="true" />
              Complete
            </button>
          )}
          {item.status === 'done' && (
            <button type="button" onClick={() => update({ status: 'saved' })} className="btn btn-ghost btn-sm">
              Undo
            </button>
          )}
          {item.status === 'skipped' && (
            <button type="button" onClick={() => update({ status: 'saved' })} className="btn btn-outline btn-sm">
              Accept quest
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditingNotes(true)}
            className="icon-btn"
            aria-label={item.notes ? `Edit note for ${item.activity}` : `Add note to ${item.activity}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="icon-btn hover:text-danger"
            aria-label={`Remove ${item.activity}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {item.status === 'done' && (
        <div className="mt-3 flex items-center gap-0.5 pl-12" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => update({ rating: star })}
              aria-label={`Rate ${star} of 5`}
              aria-pressed={item.rating === star}
              className="focus-ring inline-flex size-9 items-center justify-center rounded-md hover:bg-muted-fill"
            >
              <Star
                aria-hidden="true"
                className={`size-5 ${
                  (item.rating || 0) >= star ? 'fill-reward-fill text-reward-fill' : 'text-line-strong'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {isEditingNotes ? (
        <div className="mt-3 space-y-2 sm:pl-12">
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="field"
            placeholder="Add a note"
            aria-label={`Notes for ${item.activity}`}
            data-autofocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setNotes(item.notes || '');
                setIsEditingNotes(false);
              }}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button type="button" onClick={handleSaveNotes} className="btn btn-primary btn-sm">
              Save note
            </button>
          </div>
        </div>
      ) : (
        item.notes && <p className="muted mt-3 text-sm whitespace-pre-wrap sm:pl-12">{item.notes}</p>
      )}

      {isConfirmingDelete && (
        <ConfirmDialog
          title="Remove this quest?"
          message={`"${item.activity}" will be removed from your adventures.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </li>
  );
};

export default ActivityItemCard;
