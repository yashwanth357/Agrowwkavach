import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => (
  <div className="p-4">
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-gray-200 text-xl">JD</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">John Doe</h2>
          <p className="text-gray-500">@johndoe</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900">Farm Details</h3>
          <p className="text-gray-600">Location: Karnataka, India</p>
          <p className="text-gray-600">Farm Size: 25 acres</p>
          <p className="text-gray-600">Main Crops: Rice, Wheat, Vegetables</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Stats</h3>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">156</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">2.3K</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">428</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfilePage;
