import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileForm from "../components/ProfileForm";
import { useUser } from "@clerk/clerk-react";

const ProfilePage = () => {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState({
    location: "",
    farmSize: "",
    mainCrops: [],
    farmingType: "",
  });

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Profile Header */}
        <div className="p-6 border-b">
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
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold">{userProfile.farmSize || "0"}</p>
            <p className="text-sm text-gray-500">Farm Size (acres)</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold">{userProfile.farmingType || "N/A"}</p>
            <p className="text-sm text-gray-500">Farming Type</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold">
              {userProfile.mainCrops?.length || 0}
            </p>
            <p className="text-sm text-gray-500">Crops</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="border-b">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <ProfileForm
              initialData={userProfile}
              onUpdateSuccess={(updatedProfile) =>
                setUserProfile(updatedProfile)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
