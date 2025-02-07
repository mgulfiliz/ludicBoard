import React from 'react';
import Modal from '@/components/ui/Modal';

type FormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
  submitDisabled?: boolean;
  children: React.ReactNode;
};

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  isLoading = false,
  submitDisabled = false,
  children
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled || isLoading) return;
    await onSubmit();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name={title}>
      <form 
        className="mt-4 space-y-6"
        onSubmit={handleSubmit}
      >
        {children}
        <div className="flex justify-end space-x-2">
          <button 
            type="button" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitDisabled || isLoading}
            className={`
              bg-blue-primary text-white px-4 py-2 rounded 
              ${submitDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
            `}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FormModal;
