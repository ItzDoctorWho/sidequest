import React from 'react';
import Modal from './Modal.jsx';

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel
}) => (
  <Modal title={title} onClose={onCancel}>
    <p className="muted text-sm">{message}</p>
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="btn btn-outline" data-autofocus>
        Cancel
      </button>
      <button type="button" onClick={onConfirm} className="btn btn-danger">
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
