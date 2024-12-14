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
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-medium text-gray-900 mb-3">Farm Details</h3>
          <div className="grid gap-2">
            <p className="text-gray-600">Location: Karnataka, India</p>
            <p className="text-gray-600">Farm Size: 25 acres</p>
            <p className="text-gray-600">Main Crops: Rice, Wheat, Vegetables</p>
            <p className="text-gray-600">Farming Type: Mixed Farming</p>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Activity Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">156</p>
              <p className="text-sm text-gray-500">Total Posts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfilePage;
