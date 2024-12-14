import React from "react";

const TimelinePage = () => (
  <div className="p-4">
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Your Activity Timeline</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div>
            <p className="font-medium">Crop Analysis Updated</p>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div>
            <p className="font-medium">Weather Alert</p>
            <p className="text-sm text-gray-500">5 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <div>
            <p className="font-medium">Irrigation Schedule Updated</p>
            <p className="text-sm text-gray-500">Yesterday</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TimelinePage;
