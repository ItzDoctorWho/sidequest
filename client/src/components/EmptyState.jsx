import React from 'react';
import { Compass } from 'lucide-react';

/** Empty state on a faint topographic map: one message, one action. */
export const EmptyState = ({ title, text, children, as: Heading = 'h2' }) => (
  <div className="surface relative overflow-hidden px-6 py-12 text-center">
    <div className="topo opacity-70" aria-hidden="true" />
    <div className="relative">
      <span className="cat-icon cat-purple mx-auto flex size-12 items-center justify-center rounded-full" aria-hidden="true">
        <Compass className="size-6" />
      </span>
      <Heading className="mt-4 text-xl">{title}</Heading>
      {text && <p className="muted mx-auto mt-2 max-w-sm text-sm">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  </div>
);

export default EmptyState;
