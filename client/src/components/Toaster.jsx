import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { removeToast } from '../redux/uiSlice.js';
import { deleteActivity } from '../redux/activitiesSlice.js';
import { Sparkle, StarBurst } from './brand/Decor.jsx';

const TONE_CLASS = {
  info: 'bg-toast text-on-toast',
  success: 'bg-toast text-on-toast',
  error: 'bg-danger text-[var(--on-danger)]'
};

const ToastItem = ({ toast }) => {
  const dispatch = useDispatch();
  const dismiss = () => dispatch(removeToast(toast.id));

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.action ? 6000 : 4000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.action]);

  const handleAction = () => {
    // Undo for accept removes the record that was just created.
    if (toast.action?.type === 'undo' && toast.action.activityId) {
      dispatch(deleteActivity(toast.action.activityId));
    }
    dismiss();
  };

  const isSuccess = toast.tone === 'success';

  return (
    <div
      className={`enter pointer-events-auto flex items-center gap-3 rounded-md py-2 pr-2 pl-4 text-sm font-medium shadow-[var(--shadow-pop)] ${TONE_CLASS[toast.tone] || TONE_CLASS.info
        }`}
    >
      {isSuccess && (
        <span className="relative flex size-5 shrink-0 items-center justify-center text-action" aria-hidden="true">
          <Sparkle className="size-5" />
          <StarBurst className="inset-0" />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={handleAction}
          className="focus-ring rounded-sm px-2 py-1 font-bold text-action underline underline-offset-2 hover:bg-white/10"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="focus-ring inline-flex size-9 items-center justify-center rounded-sm hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export const Toaster = () => {
  const toasts = useSelector((state) => state.ui.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[max(5rem,calc(env(safe-area-inset-bottom)+1rem))] z-60 mx-auto flex max-w-md flex-col gap-2 sm:bottom-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toaster;
