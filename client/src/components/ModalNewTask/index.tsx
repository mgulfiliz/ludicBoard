import FormModal from "@/components/FormModal";
import { Priority, Status, useCreateTaskMutation } from "@/state/api";
import React, { useState } from "react";
import { formatISO } from "date-fns";
import AssignedUserSelect from "@/components/CustomComponents/AssignedUserSelect";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  const isFormValid = () => {
    return title && authorUserId && (id !== null || projectId);
  };
  
  const handleSubmit = async () => {
    if (!isFormValid()) return;
  
    const formattedStartDate = startDate
      ? formatISO(new Date(startDate), { representation: "complete" })
      : undefined;
    const formattedDueDate = dueDate
      ? formatISO(new Date(dueDate), { representation: "complete" })
      : undefined;
  
    await createTask({
      title,
      description,
      status,
      priority,
      tags,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      authorUserId: authorUserId ? parseInt(authorUserId, 10) : undefined,
      assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : undefined,
      projectId: id !== null ? Number(id) : Number(projectId),
    });
  };

  const inputStyles = "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputStyles}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputStyles}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
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
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputStyles}
            />
          </div>
        </div>
        <div>
          <AssignedUserSelect
            assignedUserId={authorUserId}
            setAssignedUserId={setAuthorUserId}
            label="Author"
          />
        </div>
        <div>
          <AssignedUserSelect
            assignedUserId={assignedUserId}
            setAssignedUserId={setAssignedUserId}
            label="Assigned To"
          />
        </div>
        {id === null && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Project</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
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
