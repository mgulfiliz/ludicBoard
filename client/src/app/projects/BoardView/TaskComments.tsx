import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Comment, Task as TaskType, User } from "@/types";
import AddCommentForm from "@/components/tasks/forms/AddCommentForm";
import { Trash2, Edit2, UserIcon, MessageSquareMore, MessageSquareOff } from "lucide-react";
import { useDeleteCommentMutation, useEditCommentMutation, useGetUsersQuery, useGetCurrentUserQuery } from "@/lib/api/api";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const formatRelativeTime = (date: Date | string) => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

  if (diffInSeconds < 5) return 'now';
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y`;
};

type TaskCommentsProps = {
  taskId: number;
  comments: Comment[];
  assignee?: TaskType['assignee'];
  author?: TaskType['author'];
};

export default function TaskComments({ 
  taskId, 
  comments, 
  assignee, 
  author 
}: TaskCommentsProps) {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [deleteComment] = useDeleteCommentMutation();
  const [editComment] = useEditCommentMutation();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const uniqueUserIds = Array.from(new Set(comments.map(comment => comment.userId)));

  const { data: usersData } = useGetUsersQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.filter(user => uniqueUserIds.includes(user.userId))
    })
  });

  const userMap = usersData?.reduce((acc, user) => {
    acc[user.userId] = user;
    return acc;
  }, {} as Record<number, User>) || {};

  const findUserProfilePicture = (userId: number) => {
    if (assignee?.userId === userId && assignee.profilePictureUrl) {
      return assignee.profilePictureUrl;
    }
    if (author?.userId === userId && author.profilePictureUrl) {
      return author.profilePictureUrl;
    }
    return userMap[userId]?.profilePictureUrl;
  };

  const getUserName = (comment: Comment) => {
    const username = userMap[comment.userId]?.username 
      || comment.user?.username 
      || `User ${comment.userId}`;
    
    return username;
  };

  const canEditOrDeleteComment = (comment: Comment) => {
    if (!currentUser) return false;

    // User can edit/delete their own comments
    if (comment.userId === currentUser.userId) return true;

    // Check if user is a project member or task creator/assignee
    const isProjectMember = author?.userId === currentUser.userId || 
                             assignee?.userId === currentUser.userId;

    return isProjectMember;
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment({ commentId: commentToDelete }).unwrap();
      toast.success("Comment deleted successfully", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Failed to delete comment', error);
      toast.error("Unable to delete comment. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editedCommentText.trim()) {
      toast.error("Comment cannot be empty", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      await editComment({ commentId, text: editedCommentText }).unwrap();
      setEditingCommentId(null);
      setEditedCommentText('');
      toast.success("Comment updated successfully", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Failed to edit comment', error);
      toast.error("Unable to edit comment. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditedCommentText('');
  };

  return (
    <div className="px-4 pb-4 md:px-6">
      <div className="border-t border-gray-200 dark:border-stroke-dark pt-3">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold dark:text-white flex items-center gap-2">
            Comments 
            <span className="ml-2 text-xs bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          </h5>
        </div>
        
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-500 text-center py-4">
            No comments yet
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment, index) => {
              const profilePictureUrl = findUserProfilePicture(comment.userId);
              const username = getUserName(comment);
              const isEditing = editingCommentId === comment.id;

              return (
                <div 
                  key={index} 
                  className="flex items-start gap-2 group relative"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center">
                    {profilePictureUrl ? (
                      <Image
                        src={`/${profilePictureUrl}`}
                        alt={username}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <UserIcon size={20} className="text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium dark:text-white">
                          {username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-neutral-500">
                          {formatRelativeTime(comment.createdAt || comment.updatedAt || new Date())}
                        </span>
                      </div>
                      
                      {canEditOrDeleteComment(comment) && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => startEditing(comment)}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button 
                            onClick={() => setCommentToDelete(comment.id)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input 
                          type="text"
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                          className="flex-1 rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none"
                        />
                        <button 
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editedCommentText.trim()}
                          className="rounded-md border border-transparent bg-blue-primary px-3 py-2 text-sm text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-dark-tertiary dark:text-white dark:hover:bg-dark-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                        {comment.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Move AddCommentForm to the bottom */}
      <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark pt-3">
        <AddCommentForm taskId={taskId} />
      </div>

      <ConfirmationModal 
        isOpen={commentToDelete !== null}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};
