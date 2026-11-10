import React from 'react';
import { AlertCircle } from 'lucide-react';

const TONES = {
  error: 'border-danger/40 bg-danger/10 [&>svg]:text-danger',
  warning: 'border-reward-fill/50 bg-reward-fill/10 [&>svg]:text-reward'
};

export const Alert = ({ tone = 'error', children, className = '' }) => (
  <div
    role="alert"
    className={`flex items-start gap-2.5 rounded-md border p-3.5 text-sm text-fg ${TONES[tone]} ${className}`}
  >
    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <div className="min-w-0">{children}</div>
  </div>
);

export default Alert;
