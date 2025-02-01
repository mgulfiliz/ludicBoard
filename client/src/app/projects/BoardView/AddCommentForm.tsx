import React, { useState, useRef } from 'react';
import { useCreateCommentMutation } from '@/state/api';
import { Send } from 'lucide-react';
import AssignedUserSelect from '@/components/CustomComponents/AssignedUserSelect';

type AddCommentFormProps = {
  taskId: number;
  onCommentAdded?: () => void;
};

const AddCommentForm: React.FC<AddCommentFormProps> = ({ 
  taskId, 
  onCommentAdded 
}) => {
  const [commentText, setCommentText] = useState('');
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !assignedUserId) return;

    try {
      await createComment({ 
        taskId, 
        text: commentText, 
        userId: Number(assignedUserId)
      }).unwrap();

      setCommentText('');
      setAssignedUserId('');
      onCommentAdded?.();
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {/* User Selection */}
      <AssignedUserSelect 
        assignedUserId={assignedUserId}
        setAssignedUserId={setAssignedUserId}
        label="Comment As"
      />

      {/* Comment Form */}
      <form 
        onSubmit={handleSubmit} 
        className="relative group"
      >
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-secondary rounded-lg border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300">
          <input 
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-3 bg-transparent outline-none w-full text-sm 
              placeholder-gray-500 dark:placeholder-neutral-500 
              text-gray-800 dark:text-white"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !commentText.trim() || !assignedUserId}
            className="
              mr-2 p-2 rounded-full 
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-blue-100 dark:hover:bg-blue-900/30
              focus:outline-none focus:ring-2 focus:ring-blue-500
              flex items-center justify-center
              group-focus-within:text-blue-600 
              text-gray-500 dark:text-neutral-400
            "
          >
            <Send 
              size={20} 
              className={`
                transition-transform duration-300
                ${commentText.trim() && assignedUserId ? 'rotate-0 opacity-100' : 'rotate-45 opacity-50'}
              `} 
            />
          </button>
        </div>
        
        {/* Subtle loading indicator */}
        {isLoading && (
          <div className="absolute left-0 bottom-[-4px] w-full h-[2px] overflow-hidden">
            <div className="w-full h-full bg-blue-500 animate-loading-bar"></div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddCommentForm;
