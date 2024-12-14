// components/PostCard.jsx
import React from "react";
import { Heart, Share, MessageCircle, Repeat2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PostCard = ({ post }) => (
  <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors p-4">
    <div className="flex gap-3">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarFallback className="bg-gray-200">
          {post.author[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <span className="font-bold hover:underline cursor-pointer text-gray-900">
            {post.author}
          </span>
          <span className="text-gray-500">{post.handle}</span>
          <span className="text-gray-500">· {post.timestamp}</span>
        </div>
        <p className="mt-1 text-gray-900 break-words">{post.content}</p>
        <div className="flex justify-between items-center mt-3 text-gray-500">
          <button className="flex items-center gap-1 hover:text-blue-600">
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-green-600">
            <Repeat2 size={18} />
            <span className="text-sm">{post.shares}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-red-600">
            <Heart size={18} />
            <span className="text-sm">{post.likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600">
            <Share size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PostCard;
