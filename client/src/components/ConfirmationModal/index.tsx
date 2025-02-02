import React from "react";
import Modal from "../Modal";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name={title}>
      <div className="p-4">
        <p className="mb-4 text-gray-700 dark:text-white">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-dark-tertiary dark:text-white dark:hover:bg-dark-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-md border border-transparent bg-blue-primary px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
