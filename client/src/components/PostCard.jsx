import React, { useState } from "react";
import { Heart, MessageCircle, MoreVertical, Trash } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import ShareMenu from "./ShareMenu";
import CommentSection from "./CommentSection";
import axios from "axios";

const PostCard = ({ post: initialPost, currentUser, onPostDeleted }) => {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const isAuthor = post.author?.clerkId === currentUser?.id;
  const isLiked = post.likes?.some((like) => like === currentUser?.id);
  const authorName = post.author?.email?.split("@")[0] || "Anonymous";
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLike = async () => {
    if (isLiking || !currentUser) return;
    setIsLiking(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5003/api/posts/${post._id}/like`,
        {
          clerkId: currentUser.id,
        },
      );
      setPost(response.data);
    } catch (error) {
      console.error("Error liking post:", error);
      setError(error.response?.data?.error || "Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setError(null);

    try {
      await axios.delete(`http://localhost:5003/api/posts/${post._id}`, {
        data: { clerkId: currentUser.id },
      });
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setError(error.response?.data?.error || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentAdded = (updatedPost) => {
    setPost(updatedPost);
  };

  const handleCommentDeleted = (updatedPost) => {
    setPost(updatedPost);
  };

  const renderLikeButton = () => {
    if (!currentUser) {
      return (
        <SignInButton mode="modal">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600"
          >
            <Heart size={18} />
            <span className="ml-1 text-sm">{post.likes?.length || 0}</span>
          </Button>
        </SignInButton>
      );
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className={`${
          isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
        }`}
        onClick={handleLike}
        disabled={isLiking}
      >
        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        <span className="ml-1 text-sm">{post.likes?.length || 0}</span>
      </Button>
    );
  };

  const renderCommentButton = () => {
    const commentCount = post.comments?.length || 0;

    if (!currentUser) {
      return (
        <SignInButton mode="modal">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600"
          >
            <MessageCircle size={18} />
            <span className="ml-1 text-sm">{commentCount}</span>
          </Button>
        </SignInButton>
      );
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 hover:text-blue-600"
        onClick={() => setShowComments(!showComments)}
      >
        <MessageCircle size={18} />
        <span className="ml-1 text-sm">{commentCount}</span>
      </Button>
    );
  };

  return (
    <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">{error}</div>
      )}
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="bg-gray-200">
              {authorName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex flex-wrap items-center gap-1 text-sm">
                <span className="font-bold hover:underline cursor-pointer text-gray-900">
                  {authorName}
                </span>
                {post.author?.location && (
                  <span className="text-gray-500">
                    · {post.author.location}
                  </span>
                )}
                <span className="text-gray-500">· {timeAgo}</span>
              </div>

              {isAuthor && (
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <AlertDialogTrigger className="w-full">
                        <DropdownMenuItem className="text-red-600 cursor-pointer">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Post
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <AlertDialogContent className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl">
                        Delete Post
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        Are you sure you want to delete this post? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border hover:bg-gray-100">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
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

            <p className="mt-2 text-gray-900 break-words whitespace-pre-wrap">
              {post.content}
            </p>

            {post.image && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={`http://localhost:5003${post.image}`}
                  alt="Post attachment"
                  className="max-h-[300px] w-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {renderCommentButton()}
                  </TooltipTrigger>
                  <TooltipContent>
                    {currentUser ? "Comment" : "Sign in to comment"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>{renderLikeButton()}</TooltipTrigger>
                  <TooltipContent>
                    {currentUser
                      ? isLiked
                        ? "Unlike"
                        : "Like"
                      : "Sign in to like"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ShareMenu post={post} />
            </div>
          </div>
        </div>
      </div>

      {showComments && currentUser && (
        <div className="border-t border-gray-100">
          <CommentSection
            post={post}
            currentUser={currentUser}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
