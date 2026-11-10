import React, { useId, useState } from 'react';
import { useDispatch } from 'react-redux';
import { saveActivity } from '../redux/activitiesSlice.js';
import { addToast } from '../redux/uiSlice.js';
import Modal from './Modal.jsx';
import { CATEGORIES } from './questMeta.js';

/** Mount conditionally ({open && <CustomActivityModal />}); state resets each time it opens. */
export const CustomActivityModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const ids = { name: useId(), type: useId(), people: useId(), duration: useId(), notes: useId() };
  const [activity, setActivity] = useState('');
  const [type, setType] = useState('recreational');
  const [participants, setParticipants] = useState(1);
  const [duration, setDuration] = useState('minutes');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activity.trim()) return;

    setIsSaving(true);
    const result = await dispatch(
      saveActivity({
        activity: activity.trim(),
        type,
        participants: Number(participants),
        duration,
        notes: notes.trim(),
        isCustom: true,
        status: 'saved',
        price: 0,
        availability: 1
      })
    );
    setIsSaving(false);

    if (saveActivity.rejected.match(result)) {
      dispatch(addToast({ tone: 'error', message: "Couldn't add that quest. Try again." }));
      return;
    }
    dispatch(addToast({ message: 'Quest added to your adventures' }));
    onClose();
  };

  return (
    <Modal title="Add your own quest" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={ids.name} className="field-label">
            What&rsquo;s the quest?
          </label>
          <input
            id={ids.name}
            type="text"
            required
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Walk a street you've never been down"
            className="field"
            data-autofocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={ids.type} className="field-label">
              Category
            </label>
            <select id={ids.type} value={type} onChange={(e) => setType(e.target.value)} className="field">
              {CATEGORIES.map((c) => (
                <option key={c.type} value={c.type}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={ids.people} className="field-label">
              People
            </label>
            <input
              id={ids.people}
              type="number"
              min={1}
              max={20}
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="field"
            />
          </div>
        </div>

        <div>
          <label htmlFor={ids.duration} className="field-label">
            How long?
          </label>
          <select id={ids.duration} value={duration} onChange={(e) => setDuration(e.target.value)} className="field">
            <option value="minutes">Under an hour</option>
            <option value="hours">A few hours</option>
            <option value="days">A day or more</option>
          </select>
        </div>

        <div>
          <label htmlFor={ids.notes} className="field-label">
            Notes <span className="muted font-normal">(optional)</span>
          </label>
          <textarea
            id={ids.notes}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ingredients, equipment, details"
            className="field"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Adding…' : 'Add quest'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomActivityModal;
