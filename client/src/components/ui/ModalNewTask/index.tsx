import React, { useState, useMemo, useCallback, useEffect } from "react";
import { formatISO } from "date-fns";
import { Priority, Status, useCreateTaskMutation, useGetCurrentUserQuery, Task } from "@/lib/api/api";
import FormModal from "@/components/ui/FormModal";
import AssignedUserSelect from "@/components/common/AssignedUserSelect";
import { toast } from 'react-toastify';

type ModalNewTaskProps = { 
  isOpen: boolean; 
  onClose: () => void; 
  id?: string | null 
};

const ModalNewTask: React.FC<ModalNewTaskProps> = ({ 
  isOpen, 
  onClose, 
  id = null 
}) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    status: Status.ToDo,
    priority: Priority.Backlog,
    tags: [] as string[],
    startDate: '',
    dueDate: '',
    authorUserId: '',
    assignedUserIds: [] as string[],
    projectId: '',
  });

  // Set current user as author when component mounts or current user changes
  useEffect(() => {
    if (currentUser) {
      setFormState(prev => ({
        ...prev,
        authorUserId: String(currentUser.userId)
      }));
    }
  }, [currentUser]);

  const resetForm = useCallback(() => {
    setFormState({
      title: '',
      description: '',
      status: Status.ToDo,
      priority: Priority.Backlog,
      tags: [] as string[],
      startDate: '',
      dueDate: '',
      authorUserId: '',
      assignedUserIds: [] as string[],
      projectId: '',
    });
  }, []);

  const isFormValid = useMemo(() => 
    formState.title.trim().length > 0 && 
    formState.authorUserId.trim().length > 0 && 
    (id !== null || formState.projectId.trim().length > 0),
    [formState, id]
  );

  const handleSubmit = async () => {
    if (!isFormValid) return;

    // Ensure authorUserId is set to current user
    const authorId = currentUser ? currentUser.userId : undefined;
    if (!authorId) {
      toast.error('Unable to create task: User not authenticated', {
        position: 'bottom-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      await createTask({
        ...formState,
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        tags: formState.tags.length > 0 
          ? formState.tags.filter(tag => tag.trim() !== '').map(tag => tag.trim())
          : undefined,
        startDate: formState.startDate 
          ? formatISO(new Date(formState.startDate)) 
          : undefined,
        dueDate: formState.dueDate 
          ? formatISO(new Date(formState.dueDate)) 
          : undefined,
        authorUserId: authorId,
        assignedUserIds: formState.assignedUserIds.length > 0 
          ? formState.assignedUserIds.map(Number)
          : undefined,
        projectId: id !== null 
          ? Number(id) 
          : Number(formState.projectId),
      } as Partial<Task>).unwrap();

      resetForm();
      onClose();
      
      toast.success('Task created successfully', {
        position: 'bottom-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to create task', error);
      toast.error('Failed to create task', {
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
      title="Create New Task"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitDisabled={!isFormValid || isLoading}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Title *</label>
          <input
            type="text"
            value={formState.title}
            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
            className={inputStyles}
            required
          />
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Tags</label>
          <input
            type="text"
            value={formState.tags.join(', ')}
            onChange={(e) => setFormState(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
            className={inputStyles}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Status</label>
            <select
              value={formState.status}
              onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as Status }))}
              className={inputStyles}
            >
              {Object.values(Status).map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Priority</label>
            <select
              value={formState.priority}
              onChange={(e) => setFormState(prev => ({ ...prev, priority: e.target.value as Priority }))}
              className={inputStyles}
            >
              {Object.values(Priority).map((priorityOption) => (
                <option key={priorityOption} value={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
          </div>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Due Date</label>
            <input
              type="date"
              value={formState.dueDate}
              onChange={(e) => setFormState(prev => ({ ...prev, dueDate: e.target.value }))}
              className={inputStyles}
            />
          </div>
        </div>
        {currentUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Author
            </label>
            <input 
              type="text" 
              value={currentUser?.username || currentUser?.email || ''} 
              className={inputStyles} 
              disabled 
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Assigned Users</label>
          <AssignedUserSelect 
            assignedUserIds={formState.assignedUserIds}
            setAssignedUserIds={(userIds) => setFormState(prev => ({ ...prev, assignedUserIds: userIds }))}
            multiple={true}
            label="Select Assigned Users"
            className={inputStyles}
          />
        </div>
        {id === null && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Project *</label>
            <input
              type="text"
              value={formState.projectId}
              onChange={(e) => setFormState(prev => ({ ...prev, projectId: e.target.value }))}
              className={inputStyles}
              required
            />
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default ModalNewTask;
