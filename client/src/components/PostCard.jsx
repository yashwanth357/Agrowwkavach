import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  MoreVertical,
  Trash,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { formatDistanceToNow } from "date-fns";
import ShareMenu from "./ShareMenu";
import CommentSection from "./CommentSection";
import axios from "axios";

const PostCard = ({ post: initialPost, currentUser, onPostDeleted }) => {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = post.author?.clerkId === currentUser?.id;
  const isLiked = post.likes?.some((like) => like === currentUser?.id);
  const authorName = post.author?.email?.split("@")[0] || "Anonymous";
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
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
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5003/api/posts/${post._id}`, {
        data: { clerkId: currentUser.id },
      });
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentAdded = (updatedPost) => {
    setPost(updatedPost);
  };

  const handleCommentDeleted = async (commentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5003/api/posts/${post._id}/comments/${commentId}`,
        {
          data: { clerkId: currentUser.id },
        },
      );
      setPost(response.data);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
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

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Post</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this post? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
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
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle size={18} />
                <span className="ml-1 text-sm">
                  {post.comments?.length || 0}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-green-600"
              >
                <Repeat2 size={18} />
                <span className="ml-1 text-sm">0</span>
              </Button>
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
              <ShareMenu post={post} />
            </div>
          </div>
        </div>
      </div>

      {showComments && (
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
