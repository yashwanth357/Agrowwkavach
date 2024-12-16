import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import axios from "axios";
import { useUser  } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isLoaded } = useUser ();

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
        }
      );

      setPosts(
        posts.map((post) => (post._id === postId ? response.data : post))
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // If Clerk is still loading, show minimal loading state
  if (!isLoaded) {
    return null;
  }

  // Inline styles for farming theme
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      backgroundColor: "#e6f7e6", // Light green background
      fontFamily: "'Arial', sans-serif", // Simple, readable font
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "1rem",
      color: "#4a7c2a", // Dark green color
    },
    text: {
      color: "#5a5a5a", // Gray text color
      marginBottom: "2rem",
      textAlign: "center",
      maxWidth: "600px",
    },
    signInButton: {
      backgroundColor: "#4a7c2a", // Dark green background
      color: "white",
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "0.375rem",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    signInButtonHover: {
      backgroundColor: "#3b6b23", // Darker green on hover
    },
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "10rem",
    },
    errorMessage: {
      padding: "1rem",
      color: "#e53e3e", // Red color for error messages
      backgroundColor: "#fed7e2", // Light red background
      borderRadius: "0.375rem",
      margin: "1rem",
      textAlign: "center",
    },
    noPosts: {
      textAlign: "center",
      padding: "2rem",
      color: "#a0aec0", // Light gray for no posts message
    },
  };

  // Show welcome screen for non-authenticated users
  if (!user) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Welcome to Agroww Kavach</h2>
        <p style={styles.text}>
          Join our farming community to share experiences, get advice, and
          connect with other farmers.
        </p>
        <SignInButton mode="modal">
          <Button
            style={styles.signInButton}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.signInButtonHover.backgroundColor)}
            onMouseOut={(e) => (e.currentTarget.style .backgroundColor = styles.signInButton.backgroundColor)}
          >
            Sign in to view posts
          </Button>
        </SignInButton>
      </div>
    );
  }

  // Show loading state while fetching posts
  if (isLoading) {
    return (
      <div style={styles.loadingSpinner}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state if fetch failed
  if (error) {
    return <div style={styles.errorMessage}>{error}</div>;
  }

  // Show posts or empty state
  return (
    <div>
      {posts.length === 0 ? (
        <div style={styles.noPosts}>
          <p>No posts available</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={() => handleLikePost(post._id)}
            currentUser ={user}
          />
        ))
      )}
    </div>
  );
};

export default HomePage;





//.....

