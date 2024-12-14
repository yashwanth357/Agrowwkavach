// components/TrendingSidebar.jsx
import React from "react";

const trends = [
  { topic: "#Agriculture", posts: "12.5K posts" },
  { topic: "#Sustainability", posts: "8.2K posts" },
  { topic: "#FarmTech", posts: "5.3K posts" },
];

const TrendingSidebar = () => (
  <div className="fixed w-[350px]">
    <div className="p-4">
      <div className="bg-gray-50 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-3 text-gray-900">Trending</h2>
        {trends.map((trend, index) => (
          <div
            key={index}
            className="mb-3 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
          >
            <div className="font-bold text-gray-900">{trend.topic}</div>
            <div className="text-gray-500 text-sm">{trend.posts}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TrendingSidebar;
