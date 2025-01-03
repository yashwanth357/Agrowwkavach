import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

const CommentSection = ({
  post,
  currentUser,
  onCommentAdded,
  onCommentDeleted,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [error, setError] = useState(null);
  const [activeDeleteId, setActiveDeleteId] = useState(null);

  // Debug logs
  console.log("CommentSection Debug:", {
    currentUserId: currentUser?.id,
    comments: post.comments,
    post,
  });

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5003/api/posts/${post._id}/comment`,
        {
          text: comment.trim(),
          clerkId: currentUser.id,
        },
      );

      setComment("");
      if (onCommentAdded) {
        onCommentAdded(response.data);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError(error.response?.data?.error || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (isDeletingComment) return;
    setIsDeletingComment(true);
    setError(null);
    setActiveDeleteId(commentId);

    try {
      const response = await axios.delete(
        `http://localhost:5003/api/posts/${post._id}/comments/${commentId}`,
        {
          data: { clerkId: currentUser.id },
        },
      );

      if (onCommentDeleted) {
        onCommentDeleted(response.data);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError(error.response?.data?.error || "Failed to delete comment");
    } finally {
      setIsDeletingComment(false);
      setActiveDeleteId(null);
    }
  };

  return (
    <div className="px-4 py-3 space-y-4">
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {currentUser?.firstName?.[0] ||
                currentUser?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[80px] resize-none focus-visible:ring-1"
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="bg-gray-900 text-white hover:bg-gray-800"
                size="sm"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {post.comments?.map((comment) => {
          const isCommentAuthor = comment.user?.clerkId === currentUser?.id;
          const commentUserName =
            comment.user?.email?.split("@")[0] || "Anonymous";
          const isDeleting =
            activeDeleteId === comment._id && isDeletingComment;

          return (
            <div key={comment._id} className="flex gap-3 group">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {commentUserName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-sm">
                        {commentUserName}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {isCommentAuthor && (
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-600 -mt-1 h-8 w-8"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <AlertDialogTrigger className="w-full">
                              <DropdownMenuItem className="text-red-600 cursor-pointer">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Comment
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl">
                              Delete Comment
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to delete this comment? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border hover:bg-gray-100">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteComment(comment._id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {post.comments?.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
