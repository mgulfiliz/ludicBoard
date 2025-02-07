import React, { useState, useMemo, useCallback } from "react";
import { formatISO } from "date-fns";
import { useCreateProjectMutation } from "@/lib/api/api";
import FormModal from "@/components/ui/FormModal";
import { toast } from 'react-toastify';

type ModalNewProjectProps = { 
  isOpen: boolean; 
  onClose: () => void; 
};

const ModalNewProject: React.FC<ModalNewProjectProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const resetForm = useCallback(() => {
    setFormState({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
    });
  }, []);

  const isFormValid = useMemo(() => 
    formState.name.trim().length >= 3, 
    [formState.name]
  );

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      await createProject({
        name: formState.name.trim(),
        description: formState.description.trim() || undefined,
        startDate: formState.startDate 
          ? formatISO(new Date(formState.startDate)) 
          : undefined,
        endDate: formState.endDate 
          ? formatISO(new Date(formState.endDate)) 
          : undefined,
      }).unwrap();

      resetForm();
      onClose();
      
      toast.success('Project created successfully', {
        position: 'bottom-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to create project', error);
      toast.error('Failed to create project', {
        position: 'bottom-right',
        autoClose: 3000,
      });
    }
  };

  const inputStyles = "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Create New Project"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitDisabled={!isFormValid || isLoading}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Project Name *</label>
          <input
            type="text"
            value={formState.name}
            onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
            className={`
              ${inputStyles} 
              ${formState.name.trim().length > 0 && formState.name.trim().length < 3 
                ? 'border-red-500 focus:ring-red-500' 
                : ''
              }
            `}
            required
            minLength={3}
          />
          {formState.name.trim().length > 0 && formState.name.trim().length < 3 && (
            <p className="text-xs text-red-500 mt-1">
              Project name must be at least 3 characters long
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Description</label>
          <textarea
            value={formState.description}
            onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
            className={inputStyles}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Start Date</label>
            <input
              type="date"
              value={formState.startDate}
              onChange={(e) => setFormState(prev => ({ ...prev, startDate: e.target.value }))}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">End Date</label>
            <input
              type="date"
              value={formState.endDate}
              onChange={(e) => setFormState(prev => ({ ...prev, endDate: e.target.value }))}
              className={inputStyles}
            />
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default ModalNewProject;
