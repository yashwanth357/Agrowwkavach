import React from "react";
import PostCard from "../components/PostCard";

const posts = [
  {
    id: 1,
    author: "Farmer John",
    handle: "@farmerjohn",
    content:
      "Just implemented new sustainable farming practices! #AgriTech #Sustainability",
    timestamp: "2h ago",
    likes: 24,
    comments: 5,
    shares: 3,
  },
  {
    id: 2,
    author: "AgroTech Solutions",
    handle: "@agrotech",
    content:
      "New weather prediction models showing promising results for the upcoming season.",
    timestamp: "3h ago",
    likes: 42,
    comments: 8,
    shares: 12,
  },
];

const HomePage = () => (
  <div>
    {posts.map((post) => (
      <PostCard key={post.id} post={post} />
    ))}
  </div>
);

export default HomePage;
