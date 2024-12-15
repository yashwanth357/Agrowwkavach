import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileForm from "../components/ProfileForm";
import { useUser } from "@clerk/clerk-react";
import PostCard from "../components/PostCard";
import axios from "axios";

const ProfilePage = () => {
  const { user } = useUser();
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
          `http://localhost:5003/api/profile/${user.id}`,
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
          `http://localhost:5003/api/posts?userId=${user.id}`,
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

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gray-200 text-xl">
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
            <div className="grid grid-cols-3 gap-4">
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
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{userProfile.farmSize || "0"}</p>
                <p className="text-sm text-gray-500">Farm Size (acres)</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">
                  {userProfile.farmingType || "N/A"}
                </p>
                <p className="text-sm text-gray-500">Farming Type</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
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
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "posts"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "profile"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Edit Profile
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "posts" && (
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={user}
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
