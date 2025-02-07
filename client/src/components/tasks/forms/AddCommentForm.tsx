import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useCreateCommentMutation } from '@/lib/api/api';
import { Send } from 'lucide-react';
import AssignedUserSelect from '@/components/common/AssignedUserSelect';
import { toast } from 'react-toastify';

type AddCommentFormProps = {
  taskId: number;
  onCommentAdded?: () => void;
};

const AddCommentForm: React.FC<AddCommentFormProps> = ({ 
  taskId, 
  onCommentAdded 
}) => {
  const [text, setText] = useState('');
  const [userId, setUserId] = useState('');
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAuthorError, setShowAuthorError] = useState(false);

  const resetForm = useCallback(() => {
    setText('');
    setUserId('');
    setShowAuthorError(false);
  }, []);

  const isFormValid = useMemo(() => 
    text.trim().length > 0 && userId.trim().length > 0, 
    [text, userId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;

    if (!userId.trim()) {
      setShowAuthorError(true);
      return;
    }

    try {
      await createComment({ 
        taskId, 
        text: text.trim(), 
        userId: Number(userId)
      }).unwrap();

      resetForm();
      onCommentAdded?.();
      inputRef.current?.focus();
      
      toast.success('Comment added successfully', {
        position: 'bottom-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Failed to create comment', error);
      toast.error('Failed to add comment', {
        position: 'bottom-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <AssignedUserSelect 
        assignedUserId={userId}
        setAssignedUserId={(value) => {
          setUserId(value);
          setShowAuthorError(false);
        }}
        label="Comment As"
        required={showAuthorError}
      />
      {showAuthorError && (
        <p className="text-xs text-red-500 -mt-1 mb-2">
          Please select an author
        </p>
      )}

      <form 
        onSubmit={handleSubmit} 
        className="relative group"
      >
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-secondary rounded-lg border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300">
          <input 
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-3 bg-transparent outline-none w-full text-sm 
              placeholder-gray-500 dark:placeholder-neutral-500 
              text-gray-800 dark:text-white"
            disabled={isLoading}
            required
          />
          <button 
            type="submit" 
            disabled={!text.trim() || isLoading || (showAuthorError && !userId.trim())}
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
                ${text.trim() && userId ? 'rotate-0 opacity-100' : 'rotate-45 opacity-50'}
              `} 
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCommentForm;
