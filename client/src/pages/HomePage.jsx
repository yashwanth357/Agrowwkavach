import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Only fetch posts if user is authenticated
    if (isLoaded && user) {
      const fetchPosts = async () => {
        setIsLoading(true);
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

      fetchPosts();
    }
  }, [isLoaded, user]);

  const handleLikePost = async (postId) => {
    if (!user) return;

    try {
      const response = await axios.post(
        `http://localhost:5003/api/posts/${postId}/like`,
        {
          clerkId: user.id,
        },
      );

      setPosts(
        posts.map((post) => (post._id === postId ? response.data : post)),
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // If Clerk is still loading, show minimal loading state
  if (!isLoaded) {
    return null;
  }

  // Show welcome screen for non-authenticated users
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to Agroww Kavach</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Join our farming community to share experiences, get advice, and
          connect with other farmers.
        </p>
        <SignInButton mode="modal">
          <Button className="bg-gray-900 text-white hover:bg-gray-800">
            Sign in to view posts
          </Button>
        </SignInButton>
      </div>
    );
  }

  // Show loading state while fetching posts
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state if fetch failed
  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  // Show posts or empty state
  return (
    <div>
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No posts available</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={() => handleLikePost(post._id)}
            currentUser={user}
          />
        ))
      )}
    </div>
  );
};

export default HomePage;
