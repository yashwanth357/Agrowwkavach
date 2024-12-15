import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5003/api/posts");
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.post(
        `http://localhost:5003/api/posts/${postId}/like`,
        {
          clerkId: user.id,
        },
      );

      // Update the posts state with the updated post
      setPosts(
        posts.map((post) => (post._id === postId ? response.data : post)),
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={() => handleLikePost(post._id)}
          currentUser={user}
        />
      ))}
    </div>
  );
};

export default HomePage;
