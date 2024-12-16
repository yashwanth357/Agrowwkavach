import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileForm from "../components/ProfileForm";
import { useUser  } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import axios from "axios";

const ProfilePage = () => {
  const { user } = useUser ();
  const [activeTab, setActiveTab] = useState("posts");
  const [userProfile, setUserProfile] = useState({
    location: "",
    farmSize: "",
    mainCrops: [],
    farmingType: "",
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      setIsLoadingProfile(true);
      try {
        const response = await axios.get(
          `http://localhost:5003/api/profile/${user.id}`
        );
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5003/api/posts?userId=${user.id}`
        );
        setUserPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        setError("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user?.id]);

  const handleUpdateProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  // Inline styles for farming theme
  const styles = {
    container: {
      padding: "1rem",
      backgroundColor: "#e6f7e6", // Light green background
      fontFamily: "'Arial', sans-serif", // Simple, readable font
    },
    profileCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
    },
    header: {
      padding: "1.5rem",
      borderBottom: "1px solid #d1d5db",
    },
    avatar: {
      width: "4rem",
      height: "4rem",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1rem",
      padding: "1rem",
    },
    statCard: {
      textAlign: "center",
      padding: "1rem",
      backgroundColor: "#f9fafb", // Light gray background
      borderRadius: "8px",
    },
    tabButton: {
      flex: 1,
      padding: "1rem",
      fontSize: "1rem",
      fontWeight: "500",
      borderBottom: "2px solid transparent",
      cursor: "pointer",
    },
    activeTab: {
      borderBottom: "2px solid #4a7c2a", // Dark green for active tab
      color: "#4a7c2a",
    },
    inactiveTab: {
      color: "#6b7280", // Gray for inactive tab
    },
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      padding: "2rem",
    },
    errorMessage: {
      color: "#e53e3e", // Red color for error messages
      textAlign: "center",
      padding: "1rem",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        {/* Profile Header */}
        <div style={styles.header}>
          <div className="flex items-center gap-4 mb-6">
            <Avatar style={styles.avatar}>
              <AvatarFallback className=" bg-gray-200 text-xl">
                {user?.firstName?.[0] ||
                  user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
              </h2>
              <p className="text-gray-500">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
          </div>

          {/* Profile Stats */}
          {isLoadingProfile ? (
            <div style={styles.statsContainer}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="text-center p-4 bg-gray-50 rounded-lg animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <p className="font-semibold">{userProfile.farmSize || "0"}</p>
                <p className="text-sm text-gray-500">Farm Size (acres)</p>
              </div>
              <div style={styles.statCard}>
                <p className="font-semibold">
                  {userProfile.farmingType || "N/A"}
                </p>
                <p className="text-sm text-gray-500">Farming Type</p>
              </div>
              <div style={styles.statCard}>
                <p className="font-semibold">
                  {userProfile.mainCrops?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Crops</p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("posts")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "posts" ? styles.activeTab : styles.inactiveTab),
            }}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "profile" ? styles.activeTab : styles.inactiveTab),
            }}
          >
            Edit Profile
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "posts" && (
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div style={styles.loadingSpinner}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser ={user}
                    onPostDeleted={(deletedPostId) => {
                      setUserPosts(
                        userPosts.filter((p) => p._id !== deletedPostId),
                      );
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
              <ProfileForm
                initialData={userProfile}
                onUpdateSuccess={handleUpdateProfile}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;





//...





